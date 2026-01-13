import KhorochModel from "@/models/Khoroch";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "User ID is required" }, { status: 400 });
  }

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Pipeline for "Last 30 Days Expenses" (User Share)
    const last30DaysStats = await KhorochModel.aggregate([
      {
        $match: {
          type: { $ne: "add-taka" },
          date: { $gte: thirtyDaysAgo },
          "dibo.id": userId,
        },
      },
      {
        $unwind: "$dibo",
      },
      {
        $match: {
          "dibo.id": userId,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$dibo.amount" },
        },
      },
    ]);

    // Pipeline for "This Month Expenses" (User Share)
    // Matches: type!='add-taka', date in current month, user is in 'dibo'
    const monthlyStats = await KhorochModel.aggregate([
      {
        $match: {
          type: { $ne: "add-taka" },
          date: { $gte: firstDayOfMonth, $lt: nextMonth },
          "dibo.id": userId,
        },
      },
      {
        $unwind: "$dibo",
      },
      {
        $match: {
          "dibo.id": userId,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$dibo.amount" },
        },
      },
    ]);

    // Pipeline for "Total Expenses" (User Share - All Time)
    // Matches: type!='add-taka', user is in 'dibo'
    const totalStats = await KhorochModel.aggregate([
      {
        $match: {
          type: { $ne: "add-taka" },
          "dibo.id": userId,
        },
      },
      {
        $unwind: "$dibo",
      },
      {
        $match: {
          "dibo.id": userId,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$dibo.amount" },
        },
      },
    ]);

    return Response.json({
      last30DaysExpenses: last30DaysStats[0]?.total || 0,
      thisMonthExpenses: monthlyStats[0]?.total || 0,
      totalExpenses: totalStats[0]?.total || 0,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
