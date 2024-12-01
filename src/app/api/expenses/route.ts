import KhorochModel from "@/models/Khoroch";
import PolapainModel from "@/models/Polapain";

export async function GET(req: Request) {
  const allKhoroch = await KhorochModel.find();
  return Response.json(allKhoroch);
}

export async function POST(req: Request) {
  const khoroch = await req.json();
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
