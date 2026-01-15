
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
    start = new Date(y, m - 1, 1);
    end = new Date(y, m, 0, 23, 59, 59, 999);
  } else {
    const now = new Date();
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  if (userId) {
    const meals = await Meal.find({
      userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });
    return NextResponse.json(meals);
  } else {
    const meals = await Meal.find({
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });
    return NextResponse.json(meals);
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { userId, date, breakfast, lunch, dinner, isGuest } = body;

    const [year, monthVal, day] = date.split("-").map(Number);
    const normalizedDate = new Date(year, monthVal - 1, day);
    normalizedDate.setHours(0, 0, 0, 0);

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
    const normalizedDate = new Date(year, monthVal - 1, day);
    normalizedDate.setHours(0, 0, 0, 0);

    await Meal.findOneAndDelete({ userId, date: normalizedDate });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete meal" }, { status: 500 });
  }
}
