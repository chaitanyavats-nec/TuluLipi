const tuluMap = {
  // === Independent vowels (i) and vowel signs (d) ===
  // Basic vowels
  'a':  { i: '\u{11380}', d: '' },                 // LETTER A
  'aa': { i: '\u{11381}', d: '\u{113B8}' },        // LETTER AA / VOWEL SIGN AA
  'ā':  { i: '\u{11381}', d: '\u{113B8}' },        // macron alias

  'i':  { i: '\u{11382}', d: '\u{113B9}' },        // LETTER I / VOWEL SIGN I
  'ī':  { i: '\u{11383}', d: '\u{113BA}' },        // LETTER II / VOWEL SIGN II

  'u':  { i: '\u{11384}', d: '\u{113BB}' },        // LETTER U / VOWEL SIGN U
  'ū':  { i: '\u{11385}', d: '\u{113BC}' },        // LETTER UU / VOWEL SIGN UU

  'ụ': { i: '', d: '\u{113BB}' },
  'ụụ': { i: '', d: '\u{113CF}' },

  'ṛ':  { i: '\u{11386}', d: '\u{113BD}' },        // LETTER VOCALIC R / VOWEL SIGN VOC R
  'ṝ':  { i: '\u{11387}', d: '\u{113BE}' },        // (if present) VOCALIC RR

  'ḷ':  { i: '\u{1138A}' /* fallback if present */, d: '\u{113BF}' }, // vocalic l variants (chart uses 113BF/113C0)
  // Note: 'ḷ' and long ḹ variants mapping may vary by font; keep these as examples.

  // Additional vowels/diphthongs
  'e':  { i: '\u{1138B}', d: '\u{113C2}' },        // LETTER E / VOWEL SIGN EE
  'ai': { i: '\u{1138E}', d: '\u{113C5}' },        // LETTER AI / VOWEL SIGN AI
  'o':  { i: '\u{11390}', d: '\u{113C7}' },        // LETTER OO / VOWEL SIGN OO
  'au': { i: '\u{11391}', d: '\u{113C8}' },        // LETTER AU / VOWEL SIGN AU

  // common orthographic signs
  'avagraha': { s: '\u{113B7}' },                  // SIGN AVAGRAHA
  "'": { s: '\u{113B7}' },                         // single-quote alias -> avagraha

  // === Consonants (c) ===
  // Velar
  'k':  { c: '\u{11392}' },   // KA
  'kh': { c: '\u{11393}' },   // KHA
  'g':  { c: '\u{11394}' },   // GA
  'gh': { c: '\u{11395}' },   // GHA
  'ng': { c: '\u{11396}' },   // NGA (ṅ) - alias 'ng' used for ASCII input
  'ṅ':  { c: '\u{11396}' },   // diacritic alias

  // Palatal
  'c':  { c: '\u{11397}' },   // CA
  'ch': { c: '\u{11398}' },   // CHA
  'j':  { c: '\u{11399}' },   // JA
  'jh': { c: '\u{1139A}' },   // JHA
  'ny': { c: '\u{1139B}' },   // NYA (ñ)
  'ñ':  { c: '\u{1139B}' },

  // Retroflex (cerebral)
  'tt':  { c: '\u{1139C}' },  // TTA (retroflex)
  'tth': { c: '\u{1139D}' },  // TTHA
  'dd':  { c: '\u{1139E}' },  // DDA
  'ddh': { c: '\u{1139F}' },  // DDHA
  'nng': { c: '\u{113A0}' },  // NNA (retroflex nasal) - alias
  'ṇ':   { c: '\u{113A0}' },

  // Dental
  't_':  { c: '\u{113A1}' },  // TA (dental) -- user alias 't_' avoids clash with 'tt'
  't':   { c: '\u{113A1}' },  // we'll map plain 't' to dental TA
  'th':  { c: '\u{113A2}' },  // THA
  'd':   { c: '\u{113A3}' },  // DA
  'dh':  { c: '\u{113A4}' },  // DHA
  'n':   { c: '\u{113A5}' },  // NA (dental nasal)

  // Labial
  'p':  { c: '\u{113A6}' },   // PA
  'ph': { c: '\u{113A7}' },   // PHA
  'b':  { c: '\u{113A8}' },   // BA
  'bh': { c: '\u{113A9}' },   // BHA
  'm':  { c: '\u{113AA}' },   // MA

  // Approximants / liquids
  'y': { c: '\u{113AB}' },    // YA
  'r': { c: '\u{113AC}' },    // RA
  'l': { c: '\u{113AD}' },    // LA
  'v': { c: '\u{113AE}' },    // VA

  // Sibilants & fricatives
  'sh':  { c: '\u{113AF}' },  // SHA
  'ss':  { c: '\u{113B0}' },  // SSA
  's':   { c: '\u{113B1}' },  // SA
  'h':   { c: '\u{113B2}' },  // HA

  // Additional liquids
  'lla': { c: '\u{113B3}' },  // LLA (rare)
  'rra': { c: '\u{113B4}' },  // RRA (retroflex R)
  'llla':{ c: '\u{113B5}' },  // LLLA

  // === Signs (anusvara, visarga, virama etc.) ===
  'anusvara': { s: '\u{113CC}' }, // SIGN ANUSVARA
  'visarga':  { s: '\u{113CD}' }, // SIGN VISARGA
  'virama':   { s: '\u{113CF}' }, // SIGN VIRAMA (used to suppress inherent vowel)
  'candranunasika': { s: '\u{113CA}' }, // CANDRA ANUNASIKA
  'anunasika': { s: '\u{113CC}' }, // alias
  'ṃ': { s: '\u{113CC}' },  // anusvara alias
  'ḥ': { s: '\u{113CD}' },  // visarga alias
  '|': { s: '\u{113B7}' },  // avagraha as pipe alias

  // === Vowel signs (dependent marks) - more explicit aliases ===
  // AA, I, II, U, UU, VOC R, VOC RR, VOC L, VOC LL, EE, AI, OO, AU, AU LENGTH MARK
  'vowel_aa': { sign: '\u{113B8}' },
  'vowel_i':  { sign: '\u{113B9}' },
  'vowel_ii': { sign: '\u{113BA}' },
  'vowel_u':  { sign: '\u{113BB}' },
  'vowel_uu': { sign: '\u{113BC}' },
  'vowel_vr': { sign: '\u{113BD}' },
  'vowel_vrr':{ sign: '\u{113BE}' },
  'vowel_vl': { sign: '\u{113BF}' },
  'vowel_vll':{ sign: '\u{113C0}' },
  'vowel_ee': { sign: '\u{113C2}' },
  'vowel_ai': { sign: '\u{113C5}' },
  'vowel_oo': { sign: '\u{113C7}' },
  'vowel_au': { sign: '\u{113C8}' },
  'au_length':{ sign: '\u{113C9}' }, // AU LENGTH MARK
  'vowel_ụ': { sign: '\u{113CE}' },
  'vowel_ụụ': { sign: '\u{113CF}' },  

  // === Digits (if you want to expose them) ===
  '0': { num: '\u{113E1}' }, // TULU-TIGALARI DIGIT ZERO (if present)
  '1': { num: '\u{113E2}' }  // additional digits mapping sometimes included in proposals
  // Note: the Unicode chart shows some digits in later codepoints; adjust as needed.
};

// Helper: order of matching for longest-key-first
const mapKeysSorted = Object.keys(tuluMap).sort((a, b) => b.length - a.length);

// === Unicode-safe consonant detection ===
function isTuluConsonant(str) {
  if (!str) return false;
  // get last full Unicode character (handles surrogate pairs)
  const last = [...str].pop();
  if (!last) return false;
  const code = last.codePointAt(0);
  // Consonant block in Tigalari (rough consonant range)
  // According to Unicode chart, letters occupy roughly U+11390..U+113B5
  return (code >= 0x11390 && code <= 0x113B5);
}

// === 2. Transliteration Engine (longest-match, Unicode-safe) ===
export function transliterate(latin) {
  let out = '';
  const chars = [...latin]; // unicode-safe split of input

  for (let i = 0; i < chars.length; ) {
    // build the longest possible token from the current position
    // try up to 3 characters (adjust if you want longer digraphs)
    let token = null;
    let tokenLen = 0;

    // Attempt matches from longest to shortest
    for (let L = 3; L >= 1; L--) {
      const slice = chars.slice(i, i + L).join('');
      if (!slice) continue;
      // check direct key
      if (tuluMap.hasOwnProperty(slice)) {
        token = slice;
        tokenLen = L;
        break;
      }
    }

    // If no token found, emit raw character and advance 1
    if (!token) {
      out += chars[i];
      i += 1;
      continue;
    }

    const entry = tuluMap[token];

    // Handle different entry types: consonant (c), independent vowel (i), signs (s), numbers (num)
    if (entry.c) {
      // Append consonant letter
      out += entry.c;
    } else if (entry.i !== undefined) {
      // Independent vowel
      const prevIsCons = isTuluConsonant(out);
      if (prevIsCons && entry.d) {
        // If previous was consonant and a dependent sign exists, append the dependent sign
        out += entry.d;
      } else {
        // Otherwise append the independent vowel
        out += entry.i;
      }
    } else if (entry.s) {
      // Sign (anusvara/visarga/virama etc.)
      out += entry.s;
    } else if (entry.sign) {
      // explicit vowel sign alias
      out += entry.sign;
    } else if (entry.num) {
      out += entry.num;
    } else {
      // fallback: append nothing or raw
      out += chars.slice(i, i + tokenLen).join('');
    }

    i += tokenLen;
  }

  return out;
}