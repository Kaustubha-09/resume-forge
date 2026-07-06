# ResumeForge

Private, local resume tailoring. Your master resume and generated versions are stored in `data/resumeforge.json` on this Mac. Ollama runs the AI model locally.

## Run it

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

For an 8 GB MacBook Air, use the default `qwen2.5:7b`; close memory-heavy apps before generating. To use a lighter model:

```bash
OLLAMA_MODEL=qwen2.5:3b npm run dev
```

## Output

Each generated version can be edited and downloaded as a `.tex` file or plain text. Compile the `.tex` file with a local LaTeX distribution such as BasicTeX to create a PDF.

The generator is instructed to use only facts in the saved master resume. Review every claim before applying.
