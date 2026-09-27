// Romanisation -> Tulu-Tigalari mapping data (Unicode block U+11380..U+113FF).
// Data only: the shaping/ordering logic lives in ../transliteration.js.
//
// Entry shapes:
//   { i, d }      vowel: independent letter (i) and dependent sign (d).
//                 d === ''  means "inherent vowel" (nothing is written after a consonant).
//   { c }         consonant letter (carries an inherent 'a').
//   { s, attach } sign. attach:true = combines with the preceding consonant (anusvara, visarga).
//   { s, halant } explicit virama request: suppresses the inherent vowel of the preceding consonant.

export const CONJOINER = '\u{113D0}'; // joins consonants into a conjunct
export const VIRAMA = '\u{113CE}';    // suppresses the inherent vowel
// U+113CF LOOPED VIRAMA and U+113D1 REPHA are not produced yet - see README "Open questions".

export const TULU_MAP = {
  // === Vowels ===
  'a':  { i: '\u{11380}', d: '' },
  'aa': { i: '\u{11381}', d: '\u{113B8}' },

  'i':  { i: '\u{11382}', d: '\u{113B9}' },
  'ĭ':  { i: '\u{11382}', d: '\u{113B9}' },   // short-i alias offered on the keyboards
  'ii': { i: '\u{11383}', d: '\u{113BA}' },
  'ī':  { i: '\u{11383}', d: '\u{113BA}' },

  'u':  { i: '\u{11384}', d: '\u{113BB}' },
  'uu': { i: '\u{11385}', d: '\u{113BC}' },
  // TODO(linguistic review): 'ụ' signs kept from the original table; independent forms added
  // so a standalone 'ụ' no longer disappears.
  'ụ':  { i: '\u{11384}', d: '\u{113BB}' },
  'ụụ': { i: '\u{11385}', d: '\u{113CF}' },

  'ṛ':  { i: '\u{11386}', d: '\u{113BD}' },   // vocalic R
  'ṛṛ': { i: '\u{11387}', d: '\u{113BE}' },

  // Tulu-Tigalari has no separate short e / o: both lengths use EE / OO.
  'e':  { i: '\u{1138B}', d: '\u{113C2}' },
  'ee': { i: '\u{1138B}', d: '\u{113C2}' },
  'ē':  { i: '\u{1138B}', d: '\u{113C2}' },
  'ɛ':  { i: '\u{1138B}', d: '\u{113C2}' },   // open-e offered on the keyboards
  'ai': { i: '\u{1138E}', d: '\u{113C5}' },
  'o':  { i: '\u{11390}', d: '\u{113C7}' },
  'oo': { i: '\u{11390}', d: '\u{113C7}' },
  'ō':  { i: '\u{11390}', d: '\u{113C7}' },
  'au': { i: '\u{11391}', d: '\u{113C8}' },

  // === Consonants ===
  // Velar
  'k':  { c: '\u{11392}' },
  'kh': { c: '\u{11393}' },
  'g':  { c: '\u{11394}' },
  'gh': { c: '\u{11395}' },
  'ng': { c: '\u{11396}' },
  'ṅ':  { c: '\u{11396}' },

  // Palatal
  'c':  { c: '\u{11397}' },
  'ch': { c: '\u{11398}' },
  'j':  { c: '\u{11399}' },
  'jh': { c: '\u{1139A}' },
  'ny': { c: '\u{1139B}' },
  'ñ':  { c: '\u{1139B}' },

  // Retroflex
  'ṭ':  { c: '\u{1139C}' },
  'ṭh': { c: '\u{1139D}' },
  'ḍ':  { c: '\u{1139E}' },
  'ḍh': { c: '\u{1139F}' },
  'nng': { c: '\u{113A0}' },
  'ṇ':  { c: '\u{113A0}' },

  // Dental
  't':  { c: '\u{113A1}' },
  'th': { c: '\u{113A2}' },
  'd':  { c: '\u{113A3}' },
  'dh': { c: '\u{113A4}' },
  'n':  { c: '\u{113A5}' },

  // Labial
  'p':  { c: '\u{113A6}' },
  'ph': { c: '\u{113A7}' },
  'b':  { c: '\u{113A8}' },
  'bh': { c: '\u{113A9}' },
  'm':  { c: '\u{113AA}' },

  // Approximants
  'y': { c: '\u{113AB}' },
  'r': { c: '\u{113AC}' },
  'l': { c: '\u{113AD}' },
  'v': { c: '\u{113AE}' },

  // Sibilants and fricatives
  'sh': { c: '\u{113AF}' },
  'ś':  { c: '\u{113AF}' },
  'ss': { c: '\u{113B0}' },
  'ṣ':  { c: '\u{113B0}' },
  's':  { c: '\u{113B1}' },
  'h':  { c: '\u{113B2}' },

  // Additional Tulu consonants
  'ḷ':  { c: '\u{113B3}' },   // LLA  (retroflex lateral)
  'ṟ':  { c: '\u{113B4}' },   // RRA  (trill)
  'ḻ':  { c: '\u{113B5}' },   // LLLA

  // === Signs ===
  'ṃ': { s: '\u{113CC}', attach: true },  // anusvara
  'ḥ': { s: '\u{113CD}', attach: true },  // visarga
  "'": { s: '\u{113B7}' },                // avagraha
  '|': { s: '\u{113B7}' },
  '_': { s: VIRAMA, halant: true },       // explicit halant: k_r -> K + virama + R
};
