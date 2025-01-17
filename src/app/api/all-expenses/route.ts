import KhorochModel from "@/models/Khoroch";
import PolapainModel from "@/models/Polapain";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sort = url.searchParams.get("sort");
  // console.log(sort);

  const pipleline = [];
  if (sort === "date") {
    pipleline.push({ $sort: { date: -1 } });
  } else if (sort === "_id") {
    pipleline.push({ $sort: { _id: -1 } });
  } else {
    pipleline.push({ $sort: { date: -1, _id: -1 } });
  }
  const sortedKhoroch = await KhorochModel.aggregate(pipleline);

  // aggrigation pipeline for polapain name and avatar for each dise and dibo
  return Response.json(sortedKhoroch);
}

export async function POST(req: Request) {
  const khoroch = await req.json();
  khoroch.amount = Number(khoroch.amount);

  for (let i = 0; i < khoroch.dise.length; i++) {
    khoroch.dise[i].amount = Number(khoroch.dise[i].amount);
    khoroch.dibo[i].amount = Number(khoroch.dibo[i].amount);
  }

  const newKhoroch = await KhorochModel.create(khoroch);
  khoroch.dise.forEach(async (dise: { id: string; amount: number }) => {
    await PolapainModel.findByIdAndUpdate(dise.id, {
      $inc: { balance: dise.amount },
    });
  });

  khoroch.dibo.forEach(async (dibo: { id: string; amount: number }) => {
    await PolapainModel.findByIdAndUpdate(dibo.id, {
      $inc: { balance: -dibo.amount },
    });
  });

  return Response.json(newKhoroch);
}
