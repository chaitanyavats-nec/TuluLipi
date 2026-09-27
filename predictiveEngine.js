// Word prediction over the Tulu lexicon.
import { TULU_LEXICON } from "./words.js";

// 1. Dialect neighbour graph ------------------------------------------------
const DIALECT_GRAPH = {
  "harijan-tribal": ["harijan-tribal", "harijan-tribal-jain"],
  "harijan-tribal-jain": ["harijan-tribal-jain", "harijan-tribal", "brahmin-jain"],
  "brahmin-jain": ["brahmin-jain", "harijan-tribal-jain"],
  "brahmin": ["brahmin", "brahmin-jain"],
  "paaddana": ["paaddana"],
  "classical-bhagavato": ["classical-bhagavato"],
  "universal": ["universal"],
  "general": ["general"],
};

// Entries in these dialects are understood everywhere, so they are never filtered out.
const NEUTRAL_DIALECTS = new Set(["general", "common", "universal"]);

const MAX_SUGGESTIONS = 5;
const MIN_LENGTH_TO_DETECT_DIALECT = 2;

function getNeighborDialects(dialect) {
  return DIALECT_GRAPH[dialect] || [dialect];
}

// 2. Diacritic-insensitive matching ------------------------------------------
// Users on a plain keyboard type "onasu" for "oṇasụ", so both sides are folded.
const IPA_FOLD = { "ɳ": "n", "ʈ": "t", "ɖ": "d", "ŋ": "n", "ɛ": "e", "ϵ": "e" };

export function foldText(text) {
  return text
    .toLowerCase()
    .replace(/([aeiou])ː/g, "$1$1")
    .replace(/[ɳʈɖŋɛϵ]/g, ch => IPA_FOLD[ch])
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

const INDEX = TULU_LEXICON.map(entry => ({
  entry,
  keys: [foldText(entry.variant), foldText(entry.latin_phonetic)],
}));

function matchesPrefix(item, folded) {
  return item.keys.some(key => key.startsWith(folded));
}

// 3. Dialect detection --------------------------------------------------------
// Only commits once the typed prefix clearly points at one dialect.
function detectDialect(matches) {
  const counts = new Map();
  for (const { entry } of matches) {
    if (NEUTRAL_DIALECTS.has(entry.dialect)) continue;
    counts.set(entry.dialect, (counts.get(entry.dialect) || 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0) return null;
  if (ranked.length > 1 && ranked[0][1] === ranked[1][1]) return null;
  return ranked[0][0];
}

/**
 * @param {string} input   the word being typed
 * @param {object} state   caller-owned; `state.detectedDialect` persists between calls
 * @param {object} options { region, preferredDialect }
 */
export function predict(input, state = {}, options = {}) {
  const { region = null, preferredDialect = null } = options;
  if (!input) return [];

  const folded = foldText(input);
  const matches = INDEX.filter(item => matchesPrefix(item, folded));
  if (matches.length === 0) return [];

  if (!state.detectedDialect && folded.length >= MIN_LENGTH_TO_DETECT_DIALECT) {
    const guess = detectDialect(matches);
    if (guess) state.detectedDialect = guess;
  }

  const dialect = state.detectedDialect || preferredDialect;
  const neighbors = dialect ? getNeighborDialects(dialect) : [];
  const typed = input.toLowerCase();

  const scored = matches.map(({ entry }) => {
    let score = entry.frequency ?? 0.5;
    if (dialect && entry.dialect === dialect) score += 0.7;
    else if (neighbors.includes(entry.dialect)) score += 0.35;
    if (NEUTRAL_DIALECTS.has(entry.dialect)) score += 0.2;
    if (region && entry.region === region) score += 0.3;
    if (entry.variant.startsWith(typed)) score += 0.1; // user typed the exact diacritics
    return { entry, score };
  });

  scored.sort((a, b) =>
    b.score - a.score ||
    a.entry.variant.length - b.entry.variant.length ||
    a.entry.variant.localeCompare(b.entry.variant));

  const seen = new Set();
  const results = [];
  for (const { entry } of scored) {
    if (seen.has(entry.variant)) continue;
    seen.add(entry.variant);
    results.push(entry);
    if (results.length === MAX_SUGGESTIONS) break;
  }
  return results;
}

// 4. Reset when the word being typed is cleared ----------------------------------
export function resetDialect(state) {
  state.detectedDialect = null;
}
