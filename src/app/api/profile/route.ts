
import dbConnect from "@/lib/dbConnect";
import PolapainModel from "@/models/Polapain";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { userId, avatar, name } = body;

    if (!userId) {
        return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const updateData: { avatar?: string; name?: string } = {};
    if (avatar) updateData.avatar = avatar;
    if (name) updateData.name = name;

    const updatedUser = await PolapainModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    return NextResponse.json(updatedUser);
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
