import KhorochModel from "@/models/Khoroch";
import PolapainModel from "@/models/Polapain";

export async function GET() {
  const allKhoroch = await KhorochModel.find().sort({ date: -1 });
  // aggrigation pipeline for polapain name and avatar for each dise and dibo
  
  return Response.json(allKhoroch);
}

export async function POST(req: Request) {
  const khoroch = await req.json();
  khoroch.amount = Number(khoroch.amount);

  for (let i = 0; i < khoroch.dise.length; i++) {
    khoroch.dise[i].amount = Number(khoroch.dise[i].amount);
    khoroch.dibo[i].amount = Number(khoroch.dibo[i].amount);
  }

  console.log(khoroch);
  
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
