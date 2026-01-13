import PolapainModel from "@/models/Polapain";
import dbConnect from "@/lib/dbConnect";

export async function GET() {
  await dbConnect();
  
  const all_polapain = await PolapainModel.find().sort({
    balance: -1,
  }).lean();
  
  return Response.json(all_polapain);
}
