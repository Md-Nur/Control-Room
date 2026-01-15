import Settings from "@/models/Settings";
import dbConnect from "@/lib/dbConnect";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  try {
    if (key) {
      const setting = await Settings.findOne({ key });
      return Response.json(setting || { key, value: null });
    }
    const settings = await Settings.find({});
    return Response.json(settings);
  } catch (error) {
    return Response.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return Response.json({ error: "Key and value are required" }, { status: 400 });
    }

    const setting = await Settings.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );

    return Response.json(setting);
  } catch (error) {
    return Response.json({ error: "Failed to save setting" }, { status: 500 });
  }
}
