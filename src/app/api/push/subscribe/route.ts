
import dbConnect from "@/lib/dbConnect";
import PolapainModel from "@/models/Polapain";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const { userId, subscription } = await req.json();

    if (!userId || !subscription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Add subscription to user's list if it doesn't already exist
    // We filter by endpoint to avoid duplicates
    await PolapainModel.findByIdAndUpdate(userId, {
      $addToSet: { pushSubscriptions: subscription }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
