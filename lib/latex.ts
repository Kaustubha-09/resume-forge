const escapeLatex = (value: string) => value.replace(/\\/g, "\\textbackslash{}").replace(/([#$%&_{}])/g, "\\$1").replace(/~/g, "\\textasciitilde{}").replace(/\^/g, "\\textasciicircum{}");

export function toLatex(content: string) {
  const body = escapeLatex(content).replace(/\n\n+/g, "\n\\par\n").replace(/\n/g, "\\\\\n");
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
