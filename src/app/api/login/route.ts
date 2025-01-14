import dbConnect from "@/lib/dbConnect";
import PolapainModel, { Polapain } from "@/models/Polapain";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  await dbConnect();
  const cookieStore = await cookies();
  const { name, password } = await req.json();
  const polapain: Polapain | null = await PolapainModel.findOne({
    name,
  });
  if (!polapain) {
    return Response.json(
      { error: "Tui ki asholei control room er pola?" },
      { status: 404 }
    );
  }

  const passwordMatch = await bcrypt.compare(password, polapain.password);

  if (!passwordMatch) {
    return Response.json(
      { error: "Hop pola thik moto password de" },
      { status: 400 }
    );
  }

  const token = jwt.sign({ _id: polapain._id }, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });

  cookieStore.set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30,
  });

  return Response.json({
    _id: polapain._id,
    name: polapain.name,
    avatar: polapain.avatar,
    balance: polapain.balance,
    isManager: polapain.isManager,
  });
}
