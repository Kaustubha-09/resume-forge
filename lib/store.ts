import { promises as fs } from "fs";
import path from "path";

export type Application = { id: string; company: string; role: string; jobDescription: string; keywords: string; output: string; score: number; matchedKeywords: string[]; missingKeywords: string[]; createdAt: string };
export type Store = { masterResume: string; applications: Application[] };
const file = path.join(process.cwd(), "data", "resumeforge.json");
const empty: Store = { masterResume: "", applications: [] };

export async function getStore(): Promise<Store> {
  try { return JSON.parse(await fs.readFile(file, "utf8")) as Store; }
  catch { return empty; }
}
export async function saveStore(store: Store) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(store, null, 2), "utf8");
}
