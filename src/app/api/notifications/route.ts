
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/Notification";
import Polapain from "@/models/Polapain"; // Ensure model is registered
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  try {
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("sender", "name avatar");
    
    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications", details: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { notificationId, markAllRead, userId } = body;

    if (markAllRead && userId) {
      await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
      );
      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      const updated = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
