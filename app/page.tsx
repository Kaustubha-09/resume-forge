"use client";

import { FormEvent, useEffect, useState } from "react";
import { toLatex } from "@/lib/latex";

type Application = { id: string; company: string; role: string; output: string; score?: number; matchedKeywords?: string[]; missingKeywords?: string[]; createdAt: string };

function download(filename: string, text: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [master, setMaster] = useState("");
  const [saved, setSaved] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [result, setResult] = useState("");
  const [ats, setAts] = useState<{ score: number; matchedKeywords: string[]; missingKeywords: string[] } | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [busy, setBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function downloadPdf() {
    setPdfBusy(true); setNotice("");
    try {
      const response = await fetch("/api/pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: result }) });
      if (!response.ok) { const data = await response.json(); setNotice(data.error || "Could not generate a PDF."); return; }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = "Kaustubha_Eluri_Resume.pdf"; anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setNotice("Could not reach the PDF export service.");
    } finally {
      setPdfBusy(false);
    }
  }

  useEffect(() => { void (async () => {
    const [masterResponse, appsResponse] = await Promise.all([fetch("/api/master"), fetch("/api/applications")]);
    setMaster((await masterResponse.json()).masterResume || "");
    setApplications((await appsResponse.json()).applications || []);
  })(); }, []);

  async function saveMaster() {
    setNotice("");
    const response = await fetch("/api/master", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ masterResume: master }) });
    if (response.ok) { setSaved(true); setNotice("Master resume saved locally."); }
    else setNotice((await response.json()).error || "Could not save the master resume.");
  }

  async function tailor(event: FormEvent) {
    event.preventDefault(); setBusy(true); setNotice(""); setResult("");
    const response = await fetch("/api/tailor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ company, role, jobDescription: description, keywords }) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) { setNotice(data.error || "Tailoring failed."); return; }
    setResult(data.application.output); setAts(data.application); setApplications((current) => [data.application, ...current]);
  }

  return <main>
    <header>
      <div><span className="brand-mark">RF</span><span className="brand">ResumeForge</span></div>
      <p>Private local resume tailoring</p>
    </header>
    <section className="hero"><p className="eyebrow">LOCAL-FIRST RESUME WRITER</p><h1>Tailor the truth.<br /><em>Win the interview.</em></h1><p>Save one master resume. Paste a job description and Simplify keywords. Generate an ATS-ready, one-page draft grounded in your real experience.</p></section>
    <div className="grid">
      <section className="card master-card">
        <div className="card-heading"><div><p className="step">01 — SOURCE OF TRUTH</p><h2>Master resume</h2></div><span className={master ? "status ready" : "status"}>{master ? "Saved locally" : "Not saved"}</span></div>
        <p className="hint">Paste the complete resume once. It stays on this Mac and is never sent to a cloud AI service.</p>
        <textarea value={master} onChange={(event) => { setMaster(event.target.value); setSaved(false); }} placeholder="Paste your master resume here…" className="master-input" />
        <button type="button" className="secondary" onClick={saveMaster}>{saved ? "Saved" : "Save master resume"}</button>
      </section>
      <section className="card">
        <div className="card-heading"><div><p className="step">02 — TARGET ROLE</p><h2>Tailor a version</h2></div></div>
        <form onSubmit={tailor}>
          <div className="two-col"><label>Company<input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Figma" /></label><label>Role<input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Product Designer" /></label></div>
          <label>Job description<textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Paste the full job description…" /></label>
          <label>Simplify ATS keywords <span>Paste comma-separated or one per line</span><textarea value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="User research, Figma, design systems…" /></label>
          <button className="primary" disabled={busy}>{busy ? "Generating with local Ollama…" : "Forge tailored resume →"}</button>
        </form>
      </section>
    </div>
    {notice && <p className="notice">{notice}</p>}
    {result && <section className="card result"><div className="card-heading"><div><p className="step">03 — GENERATED DRAFT</p><h2>{role || "Tailored"} resume</h2></div><div className="actions"><button className="small" onClick={downloadPdf} disabled={pdfBusy}>{pdfBusy ? "Compiling…" : "Download PDF"}</button><button className="small" onClick={() => download("Kaustubha_Eluri_Resume.tex", toLatex(result))}>Download LaTeX</button><button className="small" onClick={() => download("Kaustubha_Eluri_Resume.txt", result)}>Download text</button></div></div>{ats && <div className="ats"><div className="score"><strong>{ats.score}</strong><span>ATS match score</span></div><div><b>{ats.matchedKeywords.length} matched</b><p>{ats.matchedKeywords.join(", ") || "No pasted keywords found."}</p></div><div><b>{ats.missingKeywords.length} missing</b><p>{ats.missingKeywords.join(", ") || "All pasted keywords are present."}</p></div></div>}<textarea className="output" value={result} onChange={(e) => setResult(e.target.value)} /><p className="hint">This score measures pasted Simplify keyword coverage, not an employer ATS decision. Review every claim before applying.</p></section>}
    {applications.length > 0 && <section className="history"><p className="step">SAVED VERSIONS</p><h2>Application history</h2><div className="history-list">{applications.map((application) => <button key={application.id} onClick={() => { setCompany(application.company); setRole(application.role); setResult(application.output); setAts({ score: application.score ?? 0, matchedKeywords: application.matchedKeywords ?? [], missingKeywords: application.missingKeywords ?? [] }); }}><strong>{application.role || "Untitled role"}</strong><span>{application.company || "No company"} · {application.score ?? 0}% match · {new Date(application.createdAt).toLocaleDateString()}</span></button>)}</div></section>}
  </main>;
}
