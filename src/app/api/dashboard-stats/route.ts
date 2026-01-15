import KhorochModel from "@/models/Khoroch";
import { NextRequest } from "next/server";
import PolapainModel from "@/models/Polapain";
import dbConnect from "@/lib/dbConnect";

export async function GET(req: NextRequest) {
  await dbConnect();
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

    const pipeline = [
      {
        $match: {
          type: { $ne: "add-taka" },
          "dibo.id": userId,
        },
      },
      {
        $facet: {
          last30Days: [
            { $match: { date: { $gte: thirtyDaysAgo } } },
            { $unwind: "$dibo" },
            { $match: { "dibo.id": userId } },
            { $group: { _id: null, total: { $sum: "$dibo.amount" } } },
          ],
          thisMonth: [
            { $match: { date: { $gte: firstDayOfMonth, $lt: nextMonth } } },
            { $unwind: "$dibo" },
            { $match: { "dibo.id": userId } },
            { $group: { _id: null, total: { $sum: "$dibo.amount" } } },
          ],
          total: [
            { $unwind: "$dibo" },
            { $match: { "dibo.id": userId } },
            { $group: { _id: null, total: { $sum: "$dibo.amount" } } },
          ],
        },
      },
    ];

    // Run fetches in parallel
    const [statsResult, user] = await Promise.all([
      KhorochModel.aggregate(pipeline),
      PolapainModel.findById(userId).select("balance").lean(),
    ]);

    const stats = statsResult[0];

    return Response.json({
      last30DaysExpenses: stats.last30Days[0]?.total || 0,
      thisMonthExpenses: stats.thisMonth[0]?.total || 0,
      totalExpenses: stats.total[0]?.total || 0,
      userBalance: user?.balance || 0,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
