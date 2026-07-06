import { spawn } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { toLatex } from "@/lib/latex";

function runTectonic(texPath: string, cwd: string): Promise<{ ok: boolean; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn("tectonic", [texPath], { cwd });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", (error) => resolve({ ok: false, stderr: error.message }));
    child.on("close", (code) => resolve({ ok: code === 0, stderr }));
  });
}

export async function POST(request: Request) {
  let body: { content?: unknown };
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request body." }, { status: 400 }); }
  const { content } = body;
  if (typeof content !== "string" || !content.trim()) return Response.json({ error: "Add resume content to export." }, { status: 400 });

  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "resumeforge-pdf-"));
  const texPath = path.join(workDir, "resume.tex");
  const pdfPath = path.join(workDir, "resume.pdf");
  try {
    await fs.writeFile(texPath, toLatex(content), "utf8");
    const result = await runTectonic("resume.tex", workDir);
    if (!result.ok) {
      const detail = result.stderr.includes("ENOENT") ? "tectonic is not installed or not on PATH." : result.stderr;
      return Response.json({ error: `PDF compilation failed. ${detail || "Unknown tectonic error."}` }, { status: 400 });
    }
    const pdf = await fs.readFile(pdfPath);
    return new Response(pdf, { headers: { "Content-Type": "application/pdf" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: `Could not generate a PDF. ${message}` }, { status: 500 });
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
}
