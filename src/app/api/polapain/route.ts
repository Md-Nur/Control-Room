import PolapainModel, { Polapain } from "@/models/Polapain";

export async function GET() {
  const all_polapain: Polapain[] = await PolapainModel.find().sort({
    balance: -1,
  });
  return Response.json(all_polapain);
}
