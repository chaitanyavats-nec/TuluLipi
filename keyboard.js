import { predict } from "./predictiveEngine.js";

// === 1. Tulu-Tigalari Unicode Mapping (clean + consistent) ===
// NOTE: Replace '𑮀' with the exact independent "a" used by your font.
const tuluMap = {
  // Vowels
  'a':  { i: '𑎀', d: '𑎀' }, 
  'i':  { i: '𑎀', d: '𑮹' },
  'u':  { i: '𑎀', d: '𑮻' },
  'e':  { i: '𑎀', d: '𑯂' },
  'o':  { i: '𑮐', d: '𑯇' },
  'ai': { i: '𑮎', d: '𑯅' },
  'au': { i: '𑮑', d: '𑯈' },
  'ụ':  { i: '𑯎', d: '𑯎' },
  'ṛ':  { i: '𑮆', d: '𑮽' },

  // Consonants (always c:)
  'k':  { c: '𑮒' },
  'g':  { c: '𑮔' },
  'c':  { c: '𑮗' },
  'j':  { c: '𑮙' },

  't':  { c: '𑮡' },
  'd':  { c: '𑮣' },
  'n':  { c: '𑮥' },

  'ṭ':  { c: '𑮜' },
  'ḍ':  { c: '𑮞' },
  'ṇ':  { c: '𑮠' },

  'p':  { c: '𑮦' },
  'b':  { c: '𑮨' },
  'm':  { c: '𑮪' },

  'y':  { c: '𑮫' },
  'r':  { c: '𑮬' },
  'l':  { c: '𑮭' },
  'v':  { c: '𑮮' },

  's':  { c: '𑮱' },
  'ś':  { c: '𑮯' },
  'ṣ':  { c: '𑮰' },
  'h':  { c: '𑮲' },

  'ḷ':  { c: '𑮳' },
  'ṟ':  { c: '𑮴' },

  'ṅ':  { c: '𑮖' },
  'ñ':  { c: '𑮛' },

  'ṃ':  { c: '𑯌' },
  'ḥ':  { c: '𑯍' },

  '’':  { c: '𑮷' }
};

// === Unicode-safe consonant detection ===
function isTuluConsonant(str) {
  if (!str) return false;

  const char = [...str].pop();          // Safe for surrogate pairs
  const code = char.codePointAt(0);

  // Full Tigalari consonant range
  return (code >= 0x1139F && code <= 0x113C5);
}

// === 2. Transliteration Engine (clean, Unicode-safe) ===
function transliterate(latin) {
  let out = '';
  const chars = [...latin]; // Unicode-safe iteration

  for (let i = 0; i < chars.length; i++) {
    let ch = chars[i];
    let next = chars[i + 1];

    // Handle digraph vowels: ai, au
    if (ch === 'a' && (next === 'i' || next === 'u')) {
      ch = ch + next;
      i++;
    }

    const entry = tuluMap[ch];

    if (!entry) {
      out += ch; // fallback to raw
      continue;
    }

    if (entry.c) {
      out += entry.c; // consonant
    } else {
      const prevWasCons = isTuluConsonant(out);
      out += prevWasCons ? entry.d : entry.i;
    }
  }

  return out;
}

// === 3. Keyboard Layout ===
const layout = [
  ['a', 'i', 'u', 'ụ', 'e', 'o', 'ɛ'],
  ['k', 'g', 'c', 'j', 's', 'ś', 'ṣ', 'h', 'ḥ'],
  ['t', 'ṭ', 'd', 'ḍ', 'n', 'ṇ', 'ṅ', 'ñ', 'p', 'b'],
  ['m', 'ṃ', 'y', 'r', 'ṟ', 'ṛ', 'l', 'ḷ', 'v'],
  ['space', '⌫', '⏎']
];

let typedText = '';
let suggestions = [];
let isSwiping = false;
let swipeKeys = new Set();
let lastKey = null;

// === 4. Build Keyboard ===
function createKeyboard() {
  const keyboard = document.getElementById('keyboard');
  if (!keyboard) return;

  layout.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('key-row');

    row.forEach(key => {
      const keyDiv = document.createElement('div');
      keyDiv.classList.add('key');

      if (key === 'space') keyDiv.textContent = 'Space';
      else if (key === '⌫') keyDiv.textContent = '⌫';
      else if (key === '⏎') keyDiv.textContent = 'Enter';
      else keyDiv.textContent = key;

      keyDiv.addEventListener('mousedown', e => {
        e.preventDefault();
        processKey(key);
      });

      keyDiv.addEventListener('touchstart', e => handleTouchStart(e, keyDiv, key), { passive: false });

      rowDiv.appendChild(keyDiv);
    });

    keyboard.appendChild(rowDiv);
  });

  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd);
}

// === 5. Key Logic + Predictions ===
function processKey(key) {
  if (key === 'space') typedText += ' ';
  else if (key === '⌫') typedText = typedText.slice(0, -1);
  else if (key === '⏎') typedText += '\n';
  else typedText += key;

  updateDisplay();
  updateSuggestions();
}

function updateDisplay() {
  const roman = document.getElementById('roman-output');
  const tulu = document.getElementById('tulu-output');

  if (roman) roman.textContent = typedText;
  if (tulu) tulu.textContent = transliterate(typedText);
}

function updateSuggestions() {
  const words = typedText.split(' ');
  const currentWord = words[words.length - 1];

  suggestions = predict(currentWord, {
    region: "north",
    preferredDialect: "brahmin"
  });

  renderSuggestions();
}

function renderSuggestions() {
  const bar = document.getElementById('suggestion-bar');
  if (!bar) return;

  bar.innerHTML = '';

  suggestions.forEach(s => {
    const div = document.createElement('div');
    div.classList.add('suggestion');
    div.textContent = s.variant;
    div.addEventListener('click', () => selectSuggestion(s));
    bar.appendChild(div);
  });
}

function selectSuggestion(s) {
  const words = typedText.split(' ');
  words.pop();
  words.push(s.latin_phonetic);
  typedText = words.join(' ') + ' ';
  updateDisplay();
  updateSuggestions();
}

// === 6. Touch Handling ===
function handleTouchStart(e, keyDiv, key) {
  isSwiping = true;
  swipeKeys.clear();
  highlight(keyDiv);
  swipeKeys.add(key);
  lastKey = keyDiv;
  if (e.cancelable) e.preventDefault();
}

function handleTouchMove(e) {
  if (!isSwiping) return;
  if (e.cancelable) e.preventDefault();

  const touch = e.touches[0];
  const el = document.elementFromPoint(touch.clientX, touch.clientY);

  if (el && el.classList.contains('key') && el !== lastKey) {
    highlight(el);
    const val =
      el.textContent === 'Space' ? 'space' :
      el.textContent === 'Enter' ? '⏎' :
      el.textContent === '⌫' ? '⌫' :
      el.textContent;
    swipeKeys.add(val);
    lastKey = el;
  }
}

function handleTouchEnd() {
  if (!isSwiping) return;
  const glide = Array.from(swipeKeys).join('');
  if (glide.length > 0) processKey(glide);
  clearHighlights();
  swipeKeys.clear();
  isSwiping = false;
}

function highlight(el) {
  el.classList.add('active');
  setTimeout(() => el.classList.remove('active'), 200);
}

function clearHighlights() {
  document.querySelectorAll('.key').forEach(k => k.classList.remove('active'));
}

createKeyboard();
