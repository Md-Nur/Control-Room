import { cookies } from "next/headers";


export async function GET() {
    const cookieStore = await cookies();
    cookieStore.set("token", "");
  return Response.json({ message: "You are logged out" });
}