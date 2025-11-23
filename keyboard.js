import { predict } from "./predictiveEngine.js";
import { transliterate } from "./transliteration.js";
import { TypingTest } from "./testmode.js";

let activeVariantIndex = 0;
let activeVariants = [];
let backspaceInterval = null;
let backspaceTimeout = null;
let longPressTimeout = null;
let diacriticPopup = null;
let currentKey = null;

// === Keyboard Layout with Diacriticals ===
const keyboardLayout = [
  // Row 1
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  // Row 2
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '⌫'],
  // Row 3
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', '⏎'],
  // Row 4
  ['space']
];

// Diacritical variants for each base letter
const diacriticals = {
  'a': ['a', 'ā', 'ă'],
  'e': ['e', 'ɛ', 'ē'],
  'i': ['i', 'ī', 'ĭ'],
  'o': ['o', 'ō', 'ŏ'],
  'u': ['u', 'ū', 'ụ', 'ŭ'],
  'r': ['r', 'ṛ', 'ṟ'],
  't': ['t', 'ṭ'],
  'd': ['d', 'ḍ'],
  'n': ['n', 'ṇ', 'ñ', 'ṅ'],
  'l': ['l', 'ḷ', 'ḻ'],
  's': ['s', 'ś', 'ṣ'],
  'h': ['h', 'ḥ'],
  'm': ['m', 'ṃ'],
  // Add more as needed
};

let typedText = '';
let suggestions = [];
let isSwiping = false;
let swipeKeys = new Set();
let lastKey = null;

// === Define showCompletionModal BEFORE creating test instance ===
function showCompletionModal(elapsed, wpm, accuracy) {
  const modal = document.createElement('div');
  modal.className = 'completion-modal';
  modal.innerHTML = `
    <div class="completion-content">
      <h2>Test Complete!</h2>
      <div class="completion-stats">
        <div class="stat-item">
          <div class="stat-label">Time</div>
          <div class="stat-value">${elapsed.toFixed(1)}s</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Speed</div>
          <div class="stat-value">${wpm.toFixed(1)} WPM</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Accuracy</div>
          <div class="stat-value">${accuracy}%</div>
        </div>
      </div>
      <div class="completion-buttons">
        <button id="retry-btn" class="btn-primary">Try Again</button>
        <button id="close-btn" class="btn-secondary">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Animate in
  setTimeout(() => modal.classList.add('show'), 10);
  
  // Handle buttons
  document.getElementById('retry-btn').addEventListener('click', () => {
    typedText = '';
    test.resetTest();
    updateDisplay();
    modal.remove();
  });
  
  document.getElementById('close-btn').addEventListener('click', () => {
    modal.remove();
  });
}

// === NOW create test instance with callback ===
const test = new TypingTest("vennakam", () => typedText, showCompletionModal);

// === Build Keyboard ===
function createKeyboard() {
  const keyboard = document.getElementById('keyboard');
  if (!keyboard) return;
  keyboard.innerHTML = '';

  keyboardLayout.forEach((row, rowIndex) => {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('key-row');

    row.forEach(key => {
      const keyDiv = document.createElement('div');
      keyDiv.classList.add('key');

      if (key === 'space') {
        keyDiv.textContent = 'Space';
        keyDiv.classList.add('key-space');
      }
      else if (key === '⌫') {
        keyDiv.textContent = '⌫';
        keyDiv.classList.add('key-special');
      }
      else if (key === '⏎') {
        keyDiv.textContent = 'Enter';
        keyDiv.classList.add('key-special');
      }
      else {
        keyDiv.textContent = key;
        // Add indicator if key has diacriticals
        if (diacriticals[key]) {
          const indicator = document.createElement('span');
          indicator.className = 'diacritic-indicator';
          indicator.textContent = '•••';
          keyDiv.appendChild(indicator);
        }
      }

      // Mouse events
      keyDiv.addEventListener('mousedown', e => {
        e.preventDefault();
        handleKeyPress(key, keyDiv, e);
      });

      keyDiv.addEventListener('mouseup', e => {
        handleKeyRelease(key);
      });

      // Touch events
      keyDiv.addEventListener('touchstart', e => {
        if (e.cancelable) e.preventDefault();
        handleKeyPress(key, keyDiv, e);
      }, { passive: false });

      keyDiv.addEventListener('touchend', e => {
        if (e.cancelable) e.preventDefault();
        handleKeyRelease(key);
      }, { passive: false });

      rowDiv.appendChild(keyDiv);
    });

    keyboard.appendChild(rowDiv);
  });
}

// === Key Press Handler ===
function handleKeyPress(key, keyDiv, event) {
  currentKey = key;
  
  // Handle backspace immediately and start repeat
  if (key === '⌫') {
    processKey('⌫');
    highlight(keyDiv);
    
    backspaceTimeout = setTimeout(() => {
      backspaceInterval = setInterval(() => processKey('⌫'), 50);
    }, 300);
    return;
  }

  // Handle Enter and Space immediately
  if (key === '⏎' || key === 'space') {
    processKey(key);
    highlight(keyDiv);
    return;
  }

  // For keys with diacriticals, show popup after long press
  if (diacriticals[key]) {
    highlight(keyDiv);
    
    longPressTimeout = setTimeout(() => {
      showDiacriticalPopup(key, keyDiv, event);
    }, 500); // 500ms long press
  } else {
    // Keys without diacriticals are typed immediately
    processKey(key);
    highlight(keyDiv);
  }
}

// === Key Release Handler ===
function handleKeyRelease(key) {
  clearTimeout(backspaceTimeout);
  clearInterval(backspaceInterval);
  clearTimeout(longPressTimeout);
  
  // If popup is showing, don't type the base character
  if (diacriticPopup) {
    // Do nothing here. Selection handled by touchend logic above.
    return;
  }

  
  // If key has diacriticals but popup wasn't shown (short press), type base character
  if (diacriticals[key] && currentKey === key) {
    processKey(key);
  }
  
  currentKey = null;
}

// === Diacritical Popup ===
function showDiacriticalPopup(baseKey, keyDiv, event) {
  const variants = diacriticals[baseKey];
  if (!variants) return;

  activeVariants = variants;

  diacriticPopup = document.createElement('div');
  diacriticPopup.className = 'diacritic-popup';

  const rect = keyDiv.getBoundingClientRect();
  diacriticPopup.style.left = `${rect.left + rect.width / 2}px`;
  diacriticPopup.style.bottom = `${window.innerHeight - rect.top + 10}px`;

  variants.forEach((variant, index) => {
    const variantDiv = document.createElement('div');
    variantDiv.className = 'diacritic-variant';
    variantDiv.textContent = variant;
    variantDiv.dataset.index = index;

    if (index === 0) variantDiv.classList.add('active-variant');

    diacriticPopup.appendChild(variantDiv);
  });

  document.body.appendChild(diacriticPopup);

  setTimeout(() => diacriticPopup.classList.add('show'), 10);

  // 👇 CORE TOUCH GESTURE LOGIC
  document.addEventListener('touchmove', handleVariantSwipe, { passive: false });
  document.addEventListener('touchend', confirmVariantSelection, { passive: false });
}

function handleVariantSwipe(e) {
  if (!diacriticPopup) return;

  e.preventDefault();

  const touch = e.touches[0];
  const elements = document.elementsFromPoint(touch.clientX, touch.clientY);

  const hovered = elements.find(el => el.classList.contains('diacritic-variant'));
  if (!hovered) return;

  const index = Number(hovered.dataset.index);
  setActiveVariant(index);
}

function setActiveVariant(index) {
  activeVariantIndex = index;

  const children = diacriticPopup.querySelectorAll('.diacritic-variant');
  children.forEach(el => el.classList.remove('active-variant'));
  children[index].classList.add('active-variant');
}

function confirmVariantSelection(e) {
  if (!diacriticPopup) return;

  e.preventDefault();

  const chosen = activeVariants[activeVariantIndex];
  processKey(chosen);
  hideDiacriticalPopup();

  document.removeEventListener('touchmove', handleVariantSwipe);
  document.removeEventListener('touchend', confirmVariantSelection);
}


function hideDiacriticalPopup() {
  if (diacriticPopup) {
    diacriticPopup.remove();
    diacriticPopup = null;
  }
}

// === Key Processing ===
function processKey(key) {
  // Start timer when first non-backspace key is pressed
  if (!test.testStarted && !test.testFinished && key !== "⌫") {
    test.startTimer();
  }
  
  if (key === 'space') typedText += ' ';
  else if (key === '⌫') typedText = typedText.slice(0, -1);
  else if (key === '⏎') typedText += '\n';
  else typedText += key;

  updateDisplay();
  updateSuggestions();
  
  // Stop timer when finished
  if (!test.testFinished && typedText === test.testTarget) {
    test.stopTimer();
  }
}

function updateDisplay() {
  const roman = document.getElementById('roman-output');
  const tulu = document.getElementById('tulu-output');

  if (roman) roman.textContent = typedText;
  if (tulu) tulu.textContent = transliterate(typedText);
  
  // Add accuracy highlighting during test
  if (test.testStarted && !test.testFinished) {
    highlightAccuracy(typedText, test.testTarget);
    updateProgressBar(typedText.length, test.testTarget.length);
  }
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

function highlight(el) {
  el.classList.add('active');
  setTimeout(() => el.classList.remove('active'), 200);
}

// === Progress Indicator Functions ===
function highlightAccuracy(typed, target) {
  const targetEl = document.getElementById('target-text');
  if (!targetEl) return;
  
  let html = '';
  let correctCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < target.length; i++) {
    const char = target[i];
    
    if (i < typed.length) {
      if (typed[i] === char) {
        html += `<span class="correct">${char}</span>`;
        correctCount++;
      } else {
        html += `<span class="incorrect">${char}</span>`;
        errorCount++;
      }
    } else if (i === typed.length) {
      // Current cursor position
      html += `<span class="current">${char}</span>`;
    } else {
      // Not yet typed
      html += `<span class="pending">${char}</span>`;
    }
  }
  
  // Show extra characters if user typed more than target
  if (typed.length > target.length) {
    const extra = typed.slice(target.length);
    html += `<span class="extra">${extra}</span>`;
    errorCount += extra.length;
  }
  
  targetEl.innerHTML = html;
  
  // Update accuracy stats
  updateAccuracyStats(correctCount, errorCount);
}

function updateAccuracyStats(correct, errors) {
  const total = correct + errors;
  const accuracy = total > 0 ? ((correct / total) * 100).toFixed(1) : 100;
  
  const accuracyEl = document.getElementById('live-accuracy');
  if (accuracyEl) {
    accuracyEl.textContent = `Accuracy: ${accuracy}%`;
    
    // Color code based on accuracy
    if (accuracy >= 95) {
      accuracyEl.style.color = '#4CAF50';
    } else if (accuracy >= 80) {
      accuracyEl.style.color = '#FF9800';
    } else {
      accuracyEl.style.color = '#f44336';
    }
  }
}

function updateProgressBar(current, total) {
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  
  if (progressBar) {
    const percentage = (current / total) * 100;
    progressBar.style.width = `${Math.min(percentage, 100)}%`;
    
    // Celebrate milestones
    if (percentage === 25 || percentage === 50 || percentage === 75) {
      progressBar.setAttribute('data-milestone', 'true');
      setTimeout(() => progressBar.removeAttribute('data-milestone'), 500);
    }
  }
  
  if (progressText) {
    progressText.textContent = `${current} / ${total}`;
  }
}

// === Initialize ===
window.tuluTest = test;

createKeyboard();
document.getElementById("target-text").textContent = test.testTarget;