import dbConnect from "@/lib/dbConnect";
import PolapainModel from "@/models/Polapain";
import Settings from "@/models/Settings";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  await dbConnect();

  // Check if registration is enabled
  const registrationSetting = await Settings.findOne({ key: "registrationEnabled" });
  if (registrationSetting && registrationSetting.value === false) {
    return NextResponse.json(
      { error: "Registration is currently closed by the manager" },
      { status: 403 }
    );
  }

  const cookieStore = await cookies();
  const polapain = await req.json();

  if (!polapain.name || !polapain.password) {
    return NextResponse.json(
      { error: "Please fill name and password" },
      { status: 400 }
    );
  }

  const exisitingPolapain = await PolapainModel.findOne({
    name: polapain.name,
  });

  if (exisitingPolapain) {
    return Response.json(
      { error: "This pola is already registered" },
      { status: 400 }
    );
  }

  polapain.password = await bcrypt.hash(polapain.password, 10);

  const newPola = await PolapainModel.create(polapain);
  const token = jwt.sign({ _id: newPola._id }, process.env.JWT_SECRET!, {
    expiresIn: "3d",
  });

  cookieStore.set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
  });
  return Response.json({
    _id: newPola._id,
    name: newPola.name,
    avatar: newPola.avatar,
    dob: newPola.dob,
    balance: newPola.balance,
  });
}
