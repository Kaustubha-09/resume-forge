# ResumeForge

Resume tailoring. Your master resume and generated versions are stored in `data/resumeforge.json` on this Mac. The AI model runs either locally (Ollama, fully private) or via the Groq API (cloud, faster — your resume content is sent to Groq for generation).

## Run it — local (Ollama, private)

```bash
cd ~/Desktop/ResumeForge
ollama serve
```

In a second Terminal window:

```bash
ollama pull qwen2.5:7b
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For an 8 GB MacBook Air, the default `qwen2.5:7b` can be slow/heavy; close memory-heavy apps before generating, or use a lighter model:

```bash
OLLAMA_MODEL=qwen2.5:3b npm run dev
```

## Run it — cloud (Groq, faster, not private)

Set `GROQ_API_KEY` in `.env.local` (get a free key at [console.groq.com](https://console.groq.com)). When this is set, the app uses Groq instead of Ollama automatically — **your resume and job description are sent to Groq's API**, not kept local. Optionally set `GROQ_MODEL` to override the default (`llama-3.3-70b-versatile`).

```bash
npm run dev
```

## Output

Each generated version can be edited and downloaded as a `.tex` file or plain text. Compile the `.tex` file with a local LaTeX distribution such as BasicTeX to create a PDF.

The generator is instructed to use only facts in the saved master resume. Review every claim before applying.
