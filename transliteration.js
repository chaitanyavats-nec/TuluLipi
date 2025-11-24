const tuluMap = {
  // === Independent vowels (i) and vowel signs (d) ===
  // Basic vowels
  'a':  { i: '\u{11380}', d: '' },                 // LETTER A
  'aa': { i: '\u{11381}', d: '\u{113B8}' },        // LETTER AA / VOWEL SIGN AA

  'i':  { i: '\u{11382}', d: '\u{113B9}' },        // LETTER I / VOWEL SIGN I
  'ii':  { i: '\u{11383}', d: '\u{113BA}' },        // LETTER II / VOWEL SIGN II

  'u':  { i: '\u{11384}', d: '\u{113BB}' },        // LETTER U / VOWEL SIGN U
  'uu':  { i: '\u{11385}', d: '\u{113BC}' },        // LETTER UU / VOWEL SIGN UU

  'ụ': { i: '', d: '\u{113BB}' },
  'ụụ': { i: '', d: '\u{113CF}' },

  'ṛ':  { i: '\u{11386}', d: '\u{113BD}' },        // LETTER VOCALIC R / VOWEL SIGN VOC R
  'ṛṛ':  { i: '\u{11387}', d: '\u{113BE}' },        // (if present) VOCALIC RR

  'ḷ':  { i: '\u{11388}' /* fallback if present */, d: '\u{113BF}' }, // vocalic l variants (chart uses 113BF/113C0)
  'ḷḷ': { i: '\u{11389}', d: '\u{113B5}' },
  // Note: 'ḷ' and long ḹ variants mapping may vary by font; keep these as examples.

// Long vowels (NOTE: E and O are NOT in traditional Tulu-Tigalari per proposal)
  'ee': { i: '\u{1138B}', d: '\u{113C2}' },        // LETTER EE / VOWEL SIGN EE
  /* fallback*/ 'ē':  { i: '\u{1138B}', d: '\u{113C2}' },        // diacritic alias
  'ai': { i: '\u{1138E}', d: '\u{113C5}' },        // LETTER AI / VOWEL SIGN AI
  'oo': { i: '\u{11390}', d: '\u{113C7}' },        // LETTER OO / VOWEL SIGN OO
  /* fallback*/ 'ō':  { i: '\u{11390}', d: '\u{113C7}' },        // diacritic alias
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
  'ṭ':  { c: '\u{1139C}' },  // TTA (retroflex)
  'ṭh': { c: '\u{1139D}' },  // TTHA
  'ḍ':  { c: '\u{1139E}' },  // DDA
  'ḍh': { c: '\u{1139F}' },  // DDHA
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
  /* fallback*/ 'ś':  { c: '\u{113AF}' },
  'ss':  { c: '\u{113B0}' },  // SSA
  /* fallback*/  'ṣ':  { c: '\u{113B0}' },  // SSA  
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

// --- CONSTANTS USED FOR SHAPING LOGIC ---
const CONJOINER = '\u{113D0}';   // Conjunct / post-base trigger
const VIRAMA    = '\u{113CE}';   // Standard virama
const LOOPED_VIRAMA = '\u{113CF}'; // Special ligating virama
const REPHA     = '\u{113D1}';   // Repha (initial ra in clusters)

// Helper: is a Tulu consonant
function isCons(code) {
  if (!code) return false;
  const cp = [...code].pop().codePointAt(0);
  return cp >= 0x11390 && cp <= 0x113B5;
}

// Helper: is a dependent vowel sign available?
function hasMatra(entry) {
  return entry && entry.d;
}

// Helper: is a vowel entry?
function isVowelEntry(entry) {
  return entry && (entry.i !== undefined);
}

// Longest match extraction
function matchToken(chars, i, keys) {
  for (let L = 3; L >= 1; L--) {
    const slice = chars.slice(i, i + L).join('');
    if (keys.includes(slice)) return { token: slice, len: L };
  }
  return { token: null, len: 0 };
}

export function transliterate(input) {
  const chars = [...input];
  let out = '';

  let inCluster = false;     // Are we building a consonant cluster?
  let justVirama = false;    // Did user explicitly type virama?
  let lastWasConsonant = false;
  let lastConsonantChar = null;

  for (let i = 0; i < chars.length; ) {

    const { token, len } = matchToken(chars, i, mapKeysSorted);

    if (!token) {
      // raw passthrough character
      out += chars[i];
      lastWasConsonant = false;
      inCluster = false;
      i++;
      continue;
    }

    const entry = tuluMap[token];

    // --- 1. SIGNS (anusvara, visarga, explicit virama etc.) ---
    if (entry.s) {
      if (token === 'virama') {
        out += VIRAMA;
        justVirama = true;
        inCluster = true;      // explicitly continues cluster
        lastWasConsonant = false;
      } else {
        out += entry.s;
        justVirama = false;
        lastWasConsonant = false;
      }
      i += len;
      continue;
    }

    // --- 2. CONSONANTS ---
    if (entry.c) {

      // Repha case: RA at start of cluster + followed by consonant
      if (token === 'r' && lastWasConsonant === false && inCluster === true) {
        out += REPHA;
        i += len;
        continue;
      }

      // If previous was consonant and user didn’t insert a virama,
      // automatically build conjunct using CONJOINER.
      if (lastWasConsonant && !justVirama) {
        out += CONJOINER;
      }

      out += entry.c;

      inCluster = true;
      lastWasConsonant = true;
      justVirama = false;
      lastConsonantChar = entry.c;

      i += len;
      continue;
    }

    // --- 3. VOWELS ---
    if (isVowelEntry(entry)) {

      if (lastWasConsonant) {
        // Consonant + vowel ⇒ dependent form
        if (entry.d) {
          out += entry.d;
        } else {
          // fallback independent if sign missing
          out += entry.i;
        }
      } else {
        // standalone vowel
        out += entry.i;
      }

      // vowels break clusters
      inCluster = false;
      justVirama = false;
      lastWasConsonant = false;

      i += len;
      continue;
    }

    // --- 4. EXPLICIT VOWEL SIGNS ---
    if (entry.sign) {
      if (lastWasConsonant) {
        out += entry.sign;
      } else {
        // if no consonant, convert sign into independent vowel?
        // strict mode: just output sign
        out += entry.sign;
      }

      inCluster = false;
      justVirama = false;
      lastWasConsonant = false;

      i += len;
      continue;
    }

    // --- 5. NUMBERS ---
    if (entry.num) {
      out += entry.num;
      inCluster = false;
      lastWasConsonant = false;
      i += len;
      continue;
    }

    // fallback
    out += token;
    i += len;
  }

  return out;
}
