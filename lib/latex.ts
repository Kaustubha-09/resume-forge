const escapeLatex = (value: string) => value.replace(/\\/g, "\\textbackslash{}").replace(/([#$%&_{}])/g, "\\$1").replace(/~/g, "\\textasciitilde{}").replace(/\^/g, "\\textasciicircum{}");

export function toLatex(content: string) {
  const body = escapeLatex(content)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.split("\n").join(" \\\\\n"))
    .join("\n\n");
  return `\\documentclass[10pt,letterpaper]{article}
\\usepackage[margin=0.55in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\begin{document}
{\\small
${body}
}
\\end{document}
`;
}
