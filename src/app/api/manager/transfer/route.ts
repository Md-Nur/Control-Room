import dbConnect from "@/lib/dbConnect";
import PolapainModel from "@/models/Polapain";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { fromId, toId } = await req.json();

    if (!fromId || !toId) {
      return NextResponse.json({ error: "Missing required IDs" }, { status: 400 });
    }

    // 1. Double check that fromId is actually a manager
    const currentManager = await PolapainModel.findById(fromId);
    if (!currentManager || !currentManager.isManager) {
      return NextResponse.json({ error: "Unauthorized: fromId is not a manager" }, { status: 403 });
    }

    // 2. Perform the transfer
    // Revoke old manager
    await PolapainModel.findByIdAndUpdate(fromId, { isManager: false });
    
    // Grant new manager
    await PolapainModel.findByIdAndUpdate(toId, { isManager: true });

    return NextResponse.json({ success: true, message: "Manager power transferred successfully" });
  } catch (error: any) {
    console.error("Manager transfer error:", error);
    return NextResponse.json({ error: "Failed to transfer manager power" }, { status: 500 });
  }
}
