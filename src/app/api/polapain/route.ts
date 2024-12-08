import PolapainModel, { Polapain } from "@/models/Polapain";

export async function GET() {
  const all_polapain: Polapain[] = await PolapainModel.find();
  return Response.json(all_polapain);
}
