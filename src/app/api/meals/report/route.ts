
import dbConnect from "@/lib/dbConnect";
import { Meal } from "@/models/Meal";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const query: any = {};

  // Date Filtering
  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) {
      const [yf, mf, df] = dateFrom.split("-").map(Number);
      query.date.$gte = new Date(Date.UTC(yf, mf - 1, df));
    }
    if (dateTo) {
      const [yt, mt, dt] = dateTo.split("-").map(Number);
      query.date.$lte = new Date(Date.UTC(yt, mt - 1, dt, 23, 59, 59, 999));
    }
  }

  try {
    const report = await Meal.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$userId",
          totalBreakfast: { $sum: { $cond: ["$breakfast", 1, 0] } },
          totalLunch: { $sum: { $cond: ["$lunch", 1, 0] } },
          totalDinner: { $sum: { $cond: ["$dinner", 1, 0] } },
          totalAmount: {
            $sum: {
              $add: [
                { $cond: ["$breakfast", 30, 0] },
                { $cond: ["$lunch", 35, 0] },
                { $cond: ["$dinner", 35, 0] }
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "polapains",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          totalBreakfast: 1,
          totalLunch: 1,
          totalDinner: 1,
          totalAmount: 1,
          "user.name": 1,
          "user.avatar": 1
        }
      },
      { $sort: { "user.name": 1 } }
    ]);

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("GET /api/meals/report error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
