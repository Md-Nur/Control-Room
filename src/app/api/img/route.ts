import dbConnect from "@/lib/dbConnect";
import PhotosModel from "@/models/Photos";

export async function POST(req: Request) {
  await dbConnect();
  const data = await req.json();
  const photo = await PhotosModel.create(data);
  return Response.json(photo, { status: 201 });
}

export async function GET() {
  await dbConnect();
  const photos = await PhotosModel.find({}).sort({ date: -1 });
  return Response.json(photos);
}
