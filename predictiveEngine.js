import { TULU_LEXICON } from "./words.js";

export function predict(input, options = {}) {
  const { preferredDialect = null, region = null } = options;
  if (!input) return [];

  const cleaned = input.toLowerCase();

  // Match logic
  const matches = TULU_LEXICON.filter(entry => {
    return (
      entry.latin_phonetic.startsWith(cleaned) ||
      entry.variant.startsWith(cleaned)
    );
  });

  // Scoring logic
  const scored = matches.map(entry => {
    let score = entry.frequency || 0.5;
    if (preferredDialect && entry.dialect === preferredDialect) score += 0.5;
    if (region && entry.region === region) score += 0.3;
    return { entry, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // ✳️ Change: Return the full 'entry' object so we can access latin_phonetic later
  return scored.slice(0, 5).map(s => s.entry);
}