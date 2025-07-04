import dbConnect from "@/lib/dbConnect";
import KhorochModel from "@/models/Khoroch";
import PolapainModel from "@/models/Polapain";

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const addTaka = body as { id: string; amount: number }[];

  const allPolapain = await PolapainModel.find();
  const newTaka = await KhorochModel.create({
    amount: addTaka.reduce((acc, curr) => acc + Number(curr.amount), 0),
    title: "Taka added",
    date: new Date(),
    dise: addTaka.map((taka) => ({
      id: taka.id,
      name:
        allPolapain.find((polapain) => polapain._id.toString() === taka.id)
          ?.name || "",
      amount: Number(taka.amount),
      avatar:
        allPolapain.find((polapain) => polapain._id.toString() === taka.id)
          ?.avatar || "",
    })),
    dibo: [],
    type: "add-taka",
    isApproved: true,
  });

  const takaPromise = addTaka.map(async (taka) => {
    await PolapainModel.findByIdAndUpdate(taka.id, {
      $inc: { balance: Number(taka.amount) },
    });
  });
  await Promise.all(takaPromise);

  return Response.json(newTaka);
}
