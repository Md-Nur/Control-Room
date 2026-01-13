
import dbConnect from "@/lib/dbConnect";
import PolapainModel from "@/models/Polapain";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { userId, avatar } = body;

    if (!userId || !avatar) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedUser = await PolapainModel.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true }
    );

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
