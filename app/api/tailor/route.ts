import { getStore, saveStore } from "@/lib/store";
import { calculateAtsScore } from "@/lib/ats";

const system = `You are ResumeForge, a precise resume editor. Use ONLY facts, tools, companies, roles, dates, achievements, and metrics explicitly present in MASTER RESUME. Do not invent anything. Create an ATS-friendly one-page resume in plain text. Incorporate only pasted ATS keywords supported by MASTER RESUME. Make experience bullets concise using the XYZ formula: Accomplished X, as measured by Y, by doing Z. If a metric is absent, do not create one. Output only the resume, with clear section headings. No markdown, commentary, or keyword score.`;

function resumeContent(source: string) {
  const document = source.includes("\\begin{document}") ? source.split("\\begin{document}")[1]?.split("\\end{document}")[0] ?? source : source;
  return document
    .replace(/%.*$/gm, "")
    .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, "$1")
    .replace(/\\(?:textbf|textit|small|large|Huge|scshape|emph)\{([^}]*)\}/g, "$1")
    .replace(/\\[a-zA-Z]+(?:\[[^\]]*\])?/g, " ")
    .replace(/[{}]/g, " ")
    .replace(/\\&/g, "&")
    .replace(/\\\\/g, "\n")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 26000);
}

async function generateWithGroq(prompt: string): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 1400,
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw new Error(`Groq returned ${response.status}`);
  const result = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const output = result.choices?.[0]?.message?.content?.trim();
  if (!output) throw new Error("Groq returned an empty response.");
  return output;
}

async function generateWithOllama(prompt: string): Promise<string> {
  const response = await fetch("http://127.0.0.1:11434/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: process.env.OLLAMA_MODEL || "qwen2.5:7b", prompt, stream: false, keep_alive: "10m", options: { temperature: 0.1, num_ctx: 8192, num_predict: 1400 } }), signal: AbortSignal.timeout(300000) });
  if (!response.ok) throw new Error(`Ollama returned ${response.status}`);
  const result = (await response.json()) as { response?: string };
  const output = result.response?.trim();
  if (!output) throw new Error("Ollama returned an empty response.");
  return output;
}

export async function POST(request: Request) {
  let body: { company?: string; role?: string; jobDescription?: string; keywords?: string };
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request body." }, { status: 400 }); }
  const { company = "", role = "", jobDescription = "", keywords = "" } = body;
  const store = await getStore();
  if (!store.masterResume) return Response.json({ error: "Save your master resume first." }, { status: 400 });
  if (!jobDescription.trim()) return Response.json({ error: "Add the job description." }, { status: 400 });
  const prompt = `${system}\n\nMASTER RESUME:\n${resumeContent(store.masterResume)}\n\nTARGET COMPANY: ${company}\nTARGET ROLE: ${role}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nPASTED ATS KEYWORDS:\n${keywords}`;
  try {
    const output = process.env.GROQ_API_KEY ? await generateWithGroq(prompt) : await generateWithOllama(prompt);
    const application = { id: crypto.randomUUID(), company, role, jobDescription, keywords, output, ...calculateAtsScore(keywords, output), createdAt: new Date().toISOString() };
    store.applications.unshift(application); await saveStore(store);
    return Response.json({ application });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const hint = process.env.GROQ_API_KEY ? "Check your Groq API key and connection." : "Start Ollama, install the selected model, then try again.";
    return Response.json({ error: `Could not generate a resume. ${hint} (${message})` }, { status: 503 });
  }
}
