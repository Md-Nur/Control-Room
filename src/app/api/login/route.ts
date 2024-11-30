import dbConnect from "@/lib/dbConnect";
import PolapainModel, { Polapain } from "@/models/Polapain";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  await dbConnect();
  const { name, password } = await req.json();
  const polapain: Polapain | null = await PolapainModel.findOne({
    name,
    password,
  });
  if (!polapain) {
    return Response.json(
      { error: "Tui ki asholei control room er pola?" },
      { status: 404 }
    );
  }
  const token = jwt.sign({ _id: polapain._id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  cookieStore.set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.redirect("/dashboard");
}
