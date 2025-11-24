// predictiveEngine.js
import { TULU_LEXICON } from "./words.js";

//
// 1. Dialect Neighbor Graph
//
const DIALECT_GRAPH = {
  "harijan-tribal": ["harijan-tribal", "harijan-tribal-jain"],
  "harijan-tribal-jain": [
    "harijan-tribal-jain",
    "harijan-tribal",
    "brahmin-jain"
  ],
  "brahmin-jain": ["brahmin-jain", "harijan-tribal-jain"],
  "brahmin": ["brahmin", "brahmin-jain"],
  "paaddana": ["paaddana"],
  "classical-bhagavato": ["classical-bhagavato"],
  "universal": ["universal"],
  "general": ["general"] // fallback for your universal/general entries
};

function getNeighborDialects(dialect) {
  return DIALECT_GRAPH[dialect] || [dialect];
}

//
// 2. Detect dialect from what user types
//
function detectDialectFromInput(input) {
  const matches = TULU_LEXICON.filter(e =>
    e.latin_phonetic.startsWith(input) ||
    e.variant.startsWith(input)
  );

  if (matches.length === 0) return null;

  const counts = {};
  for (const m of matches) {
    counts[m.dialect] = (counts[m.dialect] || 0) + 1;
  }

  // Sort by highest occurrence
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return sorted.length ? sorted[0][0] : null;
}

//
// 3. Main Predictive Engine
//    state.detectedDialect WILL auto-update
//
export function predict(input, state, options = {}) {
  const { region = null } = options;
  if (!input) return [];

  const cleaned = input.toLowerCase();

  // ---- Detect dialect only ONCE until user clears/reset ----
  if (!state.detectedDialect) {
    const guess = detectDialectFromInput(cleaned);
    if (guess) state.detectedDialect = guess;
  }

  // Allowed dialect set
  const allowedDialects = state.detectedDialect
    ? getNeighborDialects(state.detectedDialect)
    : null;

  // ---- FILTER ENTRIES ----
  const matches = TULU_LEXICON.filter(entry => {
    // restrict variants if dialect known
    const dialectOK = allowedDialects
      ? allowedDialects.includes(entry.dialect)
      : true;

    return dialectOK && (
      entry.latin_phonetic.startsWith(cleaned) ||
      entry.variant.startsWith(cleaned)
    );
  });

  // ---- SCORING ----
  const scored = matches.map(entry => {
    let score = entry.frequency || 0.5;

    // Strong boost for exact dialect
    if (state.detectedDialect && entry.dialect === state.detectedDialect)
      score += 0.7;

    // moderate boost for region
    if (region && entry.region === region)
      score += 0.3;

    return { entry, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 5).map(s => s.entry);
}

//
// 4. Helper: reset dialect in your UI on input clear
//
export function resetDialect(state) {
  state.detectedDialect = null;
}
