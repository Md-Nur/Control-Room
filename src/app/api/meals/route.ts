
import dbConnect from "@/lib/dbConnect";
import { Meal } from "@/models/Meal";
import PolapainModel from "@/models/Polapain";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "date_desc";
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const query: any = {};

  if (userId) {
    query.userId = userId;
  }

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

  // Sorting
  let sort: any = { date: -1, _id: -1 };
  if (sortParam === "date_asc") sort = { date: 1 };
  if (sortParam === "date_desc") sort = { date: -1 };

  try {
    const pipeline: any[] = [];

    // Search by user name requires lookup
    if (search) {
      pipeline.push(
        {
          $lookup: {
            from: "polapains",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        { $match: { "user.name": { $regex: search, $options: "i" } } }
      );
    } else {
      // Still need lookup for population
      pipeline.push(
        {
          $lookup: {
            from: "polapains",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" }
      );
    }

    // Apply the rest of the matches
    pipeline.push({ $match: query });

    // Handle Sorting by cost/meals would be here if needed, but simple for now
    pipeline.push({ $sort: sort });

    // Facet for pagination and stats
    pipeline.push({
      $facet: {
        meals: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              date: 1, 
              breakfast: 1, 
              lunch: 1, 
              dinner: 1, 
              isGuest: 1,
              "user.name": 1,
              "user.avatar": 1,
              "user._id": 1
            }
          }
        ],
        meta: [
          { $count: "total" }
        ],
        stats: [
          {
            $group: {
              _id: null,
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
          }
        ]
      }
    });

    const result = await Meal.aggregate(pipeline);
    const data = result[0];

    return NextResponse.json({
      meals: data.meals,
      meta: {
        total: data.meta[0]?.total || 0,
        page,
        limit,
        totalPages: Math.ceil((data.meta[0]?.total || 0) / limit)
      },
      stats: data.stats[0] || { totalBreakfast: 0, totalLunch: 0, totalDinner: 0, totalAmount: 0 }
    });

  } catch (error: any) {
    console.error("GET /api/meals error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { userId, date, breakfast, lunch, dinner, isGuest } = body;

    // date is expected as YYYY-MM-DD
    const [year, monthVal, day] = date.split("-").map(Number);
    const normalizedDate = new Date(Date.UTC(year, monthVal - 1, day));

    const meal = await Meal.findOneAndUpdate(
      { userId, date: normalizedDate },
      { userId, date: normalizedDate, breakfast, lunch, dinner, isGuest },
      { upsert: true, new: true }
    );
    
    return NextResponse.json(meal);
  } catch {
    return NextResponse.json({ error: "Failed to save meal" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { userId, date, mealId } = body;
    
    if (mealId) {
      await Meal.findByIdAndDelete(mealId);
      return NextResponse.json({ success: true });
    }

    const [year, monthVal, day] = date.split("-").map(Number);
    const normalizedDate = new Date(Date.UTC(year, monthVal - 1, day));

    await Meal.findOneAndDelete({ userId, date: normalizedDate });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete meal" }, { status: 500 });
  }
}
