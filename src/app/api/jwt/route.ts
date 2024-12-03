import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import PolapainModel from "@/models/Polapain";
import dbConnect from "@/lib/dbConnect";

export async function GET() {
  await dbConnect();
  const cookieStore = await cookies();
  const token: string | undefined = cookieStore.get("token")?.value;
  // console.log(token);
  if (!token) {
    return Response.json({ error: "Did not found token" }, { status: 401 });
  }
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const userId: any = jwt.verify(token, process.env.JWT_SECRET!);
  if (!userId) {
    return Response.json(
      { error: "Unauthorized id didn't found" },
      { status: 401 }
    );
  }
  console.log(userId);
  const newUser = await PolapainModel.findById(userId._id);
  if (!newUser) {
    return Response.json({ error: "Unauthorized Pola nai" }, { status: 401 });
  }
  // console.log(newUser);
  return Response.json({
    _id: newUser._id,
    name: newUser.name,
    avatar: newUser.avatar,
    balance: newUser.balance,
    isManager: newUser.isManager,
  });
}
