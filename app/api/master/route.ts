import { getStore, saveStore } from "@/lib/store";

export async function GET() { return Response.json({ masterResume: (await getStore()).masterResume }); }
export async function PUT(request: Request) {
  const { masterResume } = await request.json();
  if (typeof masterResume !== "string") return Response.json({ error: "Master resume must be text." }, { status: 400 });
  const store = await getStore(); store.masterResume = masterResume.trim(); await saveStore(store);
  return Response.json({ ok: true });
}
