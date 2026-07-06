import { getStore } from "@/lib/store";
export async function GET() { return Response.json({ applications: (await getStore()).applications }); }
