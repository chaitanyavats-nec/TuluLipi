import { predict } from "./predictiveEngine.js";
import { transliterate } from "./transliteration.js";
let backspaceInterval = null;
let backspaceTimeout = null;

// === Timer for WPM Testing ===
let testTarget = "abc"; // Or load dynamically
let testStarted = false;
let testFinished = false;
let startTime = null;
let endTime = null;

// === Live WPM Display ===
let liveWPMInterval = null;

function updateLiveWPM() {
  if (!testStarted || testFinished) return;

  const now = performance.now();
  const minutes = (now - startTime) / 1000 / 60;

  const wpm = (typedText.length / 5) / minutes;

  document.getElementById("live-wpm").textContent = `WPM: ${wpm.toFixed(1)}`;
  document.getElementById("live-time").textContent = `Time: ${((now - startTime) / 1000).toFixed(1)}s`;
}


function startTestTimer() {
  testStarted = true;
  startTime = performance.now();

  // update immediately
  updateLiveWPM();

  // keep updating every 100ms
  liveWPMInterval = setInterval(updateLiveWPM, 100);
}


function endTestTimer() {
  testFinished = true;
  endTime = performance.now();

  clearInterval(liveWPMInterval);

  const minutes = (endTime - startTime) / 1000 / 60;
  const wpm = (typedText.length / 5) / minutes;

  alert(
    `Test Complete!\n\n` +
    `Time: ${(minutes * 60).toFixed(1)} sec\n` +
    `WPM: ${wpm.toFixed(1)}`
  );
}


// === 3. Keyboard Layout ===
const layout = [
  // Row 1: Q(ɛ) W(ụ) E R T(ṭ) Y U I O P
  ['ɛ', 'ụ', 'e', 'r', 't', 'ṭ', 'y', 'u', 'i', 'o', 'p'],

  // Row 2: A S D(ḍ) G H J K L(ḷ)
  ['a', 's', 'd', 'ḍ', 'g', 'h', 'j', 'k', 'l', 'ḷ'],

  // Row 3: Z(ś) X(ṣ) C V B N(ṇ) M(ṃ)
  ['','ś', 'ṣ', 'b', 'n', 'ṇ', 'm', 'ṃ'],

  // Row 4: Remaining Nasals, Liquids, and Misc (Centered)
  ['', 'c', 'v', 'ṅ', 'ñ', 'ḥ', 'ṟ', 'ṛ'],

  // Row 5: Functional Keys
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

      if (key === 'space') {
      keyDiv.textContent = 'Space';
      keyDiv.classList.add('key-space');
      }
      else if (key === '⌫') keyDiv.textContent = '⌫';
      else if (key === '⏎') keyDiv.textContent = 'Enter';
      else keyDiv.textContent = key;

    keyDiv.addEventListener('mousedown', e => {
        e.preventDefault();

        if (key === '⌫') {
            // delete once
            processKey('⌫');

            // start delayed auto-repeat
            backspaceTimeout = setTimeout(() => {
                backspaceInterval = setInterval(() => processKey('⌫'), 50);
            }, 300); // start repeating after 300ms hold
        } else {
            processKey(key);
        }
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
  if (!testStarted && !testFinished && key !== '⌫') {
    startTestTimer();
  }
  if (key === 'space') typedText += ' ';
  else if (key === '⌫') typedText = typedText.slice(0, -1);
  else if (key === '⏎') typedText += '\n';
  else typedText += key;

  updateDisplay();
  updateSuggestions();
  if (!testFinished && typedText === testTarget) {
    endTestTimer();
  }
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

document.addEventListener('touchend', () => {
  clearTimeout(backspaceTimeout);
  clearInterval(backspaceInterval);
});

document.addEventListener('mouseup', () => {
  clearTimeout(backspaceTimeout);
  clearInterval(backspaceInterval);
});

createKeyboard();
document.getElementById('target-text').textContent = testTarget;

