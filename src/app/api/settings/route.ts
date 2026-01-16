import dbConnect from "@/lib/dbConnect";
import Settings from "@/models/Settings";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import PolapainModel from "@/models/Polapain";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
  try {
    const registrationSetting = await Settings.findOne({ key: "registrationEnabled" });
    return NextResponse.json({ 
      registrationEnabled: registrationSetting ? registrationSetting.value : true 
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await PolapainModel.findById(decoded._id);

    if (!user || !user.isManager) {
      return NextResponse.json({ error: "Unauthorized: Manager only" }, { status: 403 });
    }

    const { registrationEnabled } = await req.json();

    await Settings.findOneAndUpdate(
      { key: "registrationEnabled" },
      { key: "registrationEnabled", value: registrationEnabled },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, registrationEnabled });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
