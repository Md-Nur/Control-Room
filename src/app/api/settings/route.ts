import dbConnect from "@/lib/dbConnect";
import Settings from "@/models/Settings";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import PolapainModel from "@/models/Polapain";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (key) {
      const setting = await Settings.findOne({ key });
      return NextResponse.json({
        key,
        value: setting ? setting.value : null,
      });
    }

    const registrationSetting = await Settings.findOne({
      key: "registrationEnabled",
    });
    return NextResponse.json({
      registrationEnabled:
        registrationSetting ? registrationSetting.value : true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: "Unauthorized: Manager only" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { key, value, registrationEnabled } = body;

    let updateKey = key;
    let updateValue = value;

    // Backward compatibility for existing client that sends { registrationEnabled: boolean }
    if (!key && registrationEnabled !== undefined) {
      updateKey = "registrationEnabled";
      updateValue = registrationEnabled;
    }

    if (!updateKey) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const updatedSetting = await Settings.findOneAndUpdate(
      { key: updateKey },
      { key: updateKey, value: updateValue },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: updatedSetting,
      // Maintain response structure for legacy checks if any, though most just check status 200
      registrationEnabled:
        updateKey === "registrationEnabled" ? updateValue : undefined,
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
