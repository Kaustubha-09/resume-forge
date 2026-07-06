import { getStore, saveStore } from "@/lib/store";

export async function GET() { return Response.json({ masterResume: (await getStore()).masterResume }); }
export async function PUT(request: Request) {
  let body: { masterResume?: unknown };
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request body." }, { status: 400 }); }
  const { masterResume } = body;
  if (typeof masterResume !== "string") return Response.json({ error: "Master resume must be text." }, { status: 400 });
  const store = await getStore(); store.masterResume = masterResume.trim(); await saveStore(store);
  return Response.json({ ok: true });
}
