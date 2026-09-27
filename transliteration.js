// Latin (phonetic) -> Tulu-Tigalari transliteration.
// Pure and stateless: the whole roman buffer is re-transliterated on every change.
import { TULU_MAP, CONJOINER, VIRAMA } from './translit/tuluMap.js';

const TOKENS = new Map(Object.entries(TULU_MAP));
const MAX_TOKEN_LENGTH = Math.max(...[...TOKENS.keys()].map(k => [...k].length));

/** Longest-match lookup starting at index i of a code-point array. */
function matchToken(cps, i) {
  const longest = Math.min(MAX_TOKEN_LENGTH, cps.length - i);
  for (let len = longest; len >= 1; len--) {
    const token = cps.slice(i, i + len).join('');
    if (TOKENS.has(token)) return { token, len };
  }
  return null;
}

export function transliterate(input) {
  const chars = [...String(input).normalize('NFC')];
  const lower = chars.map(c => c.toLowerCase());

  let out = '';
  // True while the last thing written is a consonant that has not yet received a vowel.
  let pendingConsonant = false;

  // A consonant that is not followed by a vowel keeps no inherent 'a': write a virama.
  const closeConsonant = () => {
    if (pendingConsonant) {
      out += VIRAMA;
      pendingConsonant = false;
    }
  };

  for (let i = 0; i < chars.length; ) {
    const match = matchToken(lower, i);

    if (!match) {                       // spaces, punctuation, digits, unmapped letters
      closeConsonant();
      out += chars[i];
      i++;
      continue;
    }

    const entry = TOKENS.get(match.token);
    i += match.len;

    if (entry.c) {                      // consonant
      if (pendingConsonant) out += CONJOINER;
      out += entry.c;
      pendingConsonant = true;
    } else if ('i' in entry) {          // vowel
      out += pendingConsonant ? (entry.d ?? entry.i) : entry.i;
      pendingConsonant = false;
    } else if (entry.halant) {          // explicit virama
      closeConsonant();
    } else if (entry.attach) {          // anusvara / visarga sit on the syllable
      out += entry.s;
      pendingConsonant = false;
    } else {                            // standalone sign (avagraha)
      closeConsonant();
      out += entry.s;
    }
  }

  closeConsonant();
  return out;
}
