import dbConnect from "@/lib/dbConnect";
import PolapainModel from "@/models/Polapain";

export async function POST(req: Request) {
  await dbConnect();
  const {
    id,
    amount,
  }: {
    id: string;
    amount: number;
  } = await req.json();
  if (!id || !amount) {
    return Response.json(
      { error: "Please fill all the fields" },
      { status: 400 }
    );
  }
  const newTaka = await PolapainModel.findByIdAndUpdate(
    id,
    { $inc: { balance: Number(amount) } },
    { new: true }
  );
  if (!newTaka) {
    return Response.json({ error: "Polapain not found" }, { status: 404 });
  }
  return Response.json(newTaka);
}
