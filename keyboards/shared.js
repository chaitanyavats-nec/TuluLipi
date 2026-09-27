// Data shared by both keyboards, so the two study conditions stay comparable.

// Long-press alternates. The first entry is the base key itself.
export const ALTERNATES = {
  e: ['e', 'ɛ'],
  i: ['i', 'ī', 'ĭ'],
  u: ['u', 'ụ'],
  r: ['r', 'ṛ', 'ṟ'],
  t: ['t', 'ṭ'],
  d: ['d', 'ḍ'],
  n: ['n', 'ṇ', 'ñ', 'ṅ'],
  l: ['l', 'ḷ', 'ḻ'],
  s: ['s', 'ś', 'ṣ'],
  h: ['h', 'ḥ'],
  m: ['m', 'ṃ'],
};

// Only letters the transliterator understands (no q, w, f, x, z).
export const LETTER_ROWS = [
  ['e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'g', 'h', 'j', 'k', 'l'],
  ['c', 'v', 'b', 'n', 'm'],
];

export const BOTTOM_ROW = [',', 'space', '.', '⏎'];

// Spoken names for the keys screen readers would otherwise mispronounce.
const SPECIAL_NAMES = {
  space: 'Space',
  '⏎': 'Enter',
  '⌫': 'Backspace',
  '⇧': 'Diacritics layer',
  ',': 'Comma',
  '.': 'Period',
  'ɛ': 'open e',
};

const MARK_NAMES = {
  '̣': 'dot below',
  '̄': 'macron',
  '̆': 'breve',
  '̱': 'line below',
  '́': 'acute',
  '̃': 'tilde',
  '̇': 'dot above',
};

export function describeKey(value) {
  if (SPECIAL_NAMES[value]) return SPECIAL_NAMES[value];
  const [base, ...marks] = value.normalize('NFD');
  const named = marks.map(m => MARK_NAMES[m]).filter(Boolean);
  return named.length ? `${base} with ${named.join(' and ')}` : value;
}
