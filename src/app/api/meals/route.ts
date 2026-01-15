
import dbConnect from "@/lib/dbConnect";
import { Meal } from "@/models/Meal";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const month = searchParams.get("month"); // YYYY-MM
  let start: Date, end: Date;

  if (month) {
    const [y, m] = month.split("-").map(Number);
    // Use UTC to avoid timezone shifts
    start = new Date(Date.UTC(y, m - 1, 1));
    end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
  } else {
    const now = new Date();
    start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  }

  const query: any = {
    date: { $gte: start, $lte: end },
  };

  if (userId) {
    query.userId = userId;
  }

  const meals = await Meal.find(query).sort({ date: 1 });
  return NextResponse.json(meals);
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
    const { userId, date } = body;
    
    const [year, monthVal, day] = date.split("-").map(Number);
    const normalizedDate = new Date(Date.UTC(year, monthVal - 1, day));

    await Meal.findOneAndDelete({ userId, date: normalizedDate });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete meal" }, { status: 500 });
  }
}
