const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9+#.\- ]/g, " ").replace(/\s+/g, " ").trim();

export function calculateAtsScore(keywords: string, resume: string) {
  const terms = [...new Set(keywords.split(/[\n,;|]/).map((term) => term.trim()).filter((term) => term.length > 1))];
  const normalizedResume = normalize(resume);
  const matchedKeywords = terms.filter((term) => normalizedResume.includes(normalize(term)));
  const missingKeywords = terms.filter((term) => !matchedKeywords.includes(term));
  return { score: terms.length ? Math.round((matchedKeywords.length / terms.length) * 100) : 0, matchedKeywords, missingKeywords };
}
