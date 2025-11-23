import { predict } from "./predictiveEngine.js";
import { transliterate } from "./transliteration.js";
import { TypingTest } from "./testmode.js";

let backspaceInterval = null;
let backspaceTimeout = null;
let currentLayout = 'A';

// === 3. Keyboard Layout ===
const layoutA = [
  // Row 1: Q(ɛ) W(ụ) E R T(ṭ) Y U I O P
  ['q', 'u', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],

  // Row 2: A S D(ḍ) G H J K L(ḷ)
  ['⇧', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '⌫',],

  // Row 4: Remaining Nasals, Liquids, and Misc (Centered)
  ['caps','z', ,'x', 'c', 'v', 'b', 'n', 'm', , '⏎'],

  ['space']
];

const layoutB = [
  // Row 1: Q(ɛ) W(ụ) E R T(ṭ) Y U I O P
  ['q', 'ụ', 'ɛ', 'ṛ', 'ṟ', 'ṭ', 'ụ', 'i', 'o', 'p'],

  // Row 2: A S D(ḍ) G H J K L(ḷ)
  ['⇧', 'ś', 'ṣ', 'ḍ', 'f', 'h', 'ḥ', 'j', 'ḻ', 'ḷ', '⌫'],

  // Row 3: Z(ś) X(ṣ) C V B N(ṇ) M(ṃ)
  ['caps', 'z', 'x', 'ṅ', 'ñ', 'ṇ', 'm', 'ṃ', '⏎'],
  
  ['space']
];

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

// === 4. Build Keyboard ===
function createKeyboard() {
  console.log('createKeyboard() called, currentLayout is:', currentLayout);
  const keyboard = document.getElementById('keyboard');
  if (!keyboard) return;
  keyboard.innerHTML = '';
  const activeLayout = currentLayout === 'A' ? layoutA : layoutB;
  console.log('Using layout:', currentLayout, 'Layout contents:', activeLayout);

  activeLayout.forEach((row, rowIndex) => {
    console.log(`Building row ${rowIndex}:`, row);
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
      else if (key === '⇧') {
        keyDiv.textContent = 'Shift';
        keyDiv.classList.add('key-shift');
        console.log('Creating shift key, key value:', key);
      }
      else keyDiv.textContent = key;

      keyDiv.addEventListener('mousedown', e => {
        console.log('Mouse down on key:', key, 'Current layout before:', currentLayout);
        e.preventDefault();
        if (key === '⇧') {
          console.log('Shift mouse click! Current layout:', currentLayout);
          // switch layouts
          currentLayout = currentLayout === 'A' ? 'B' : 'A';
          console.log('Switching to layout:', currentLayout);
          createKeyboard(); // rebuild UI
          console.log('After rebuild, currentLayout is:', currentLayout);
          return; // don't type anything
        }

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

      keyDiv.addEventListener('touchstart', e => {
        console.log('Touch start on key:', key, 'Current layout before:', currentLayout);
        if (e.cancelable) e.preventDefault();
        
        // Handle Shift key
        if (key === '⇧') {
          console.log('Shift key detected! Current layout:', currentLayout);
          currentLayout = currentLayout === 'A' ? 'B' : 'A';
          console.log('Switching to layout:', currentLayout);
          createKeyboard();
          console.log('After rebuild, currentLayout is:', currentLayout);
          highlight(keyDiv);
          console.log('Shift key processing complete');
          return;
        }
        
        // Handle backspace with hold-to-repeat
        if (key === '⌫') {
          console.log('Backspace key detected');
          processKey('⌫');
          highlight(keyDiv);
          
          // Start delayed auto-repeat
          backspaceTimeout = setTimeout(() => {
            backspaceInterval = setInterval(() => processKey('⌫'), 50);
          }, 300);
          return;
        }
        
        // Handle all other keys (swipeable)
        console.log('Regular key, passing to handleTouchStart:', key);
        handleTouchStart(e, keyDiv, key);
      }, { passive: false });

      rowDiv.appendChild(keyDiv);
    });

    keyboard.appendChild(rowDiv);
  });

  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd);
}

// === 5. Key Logic + Predictions ===
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

// === 6. Touch Handling ===
function handleTouchStart(e, keyDiv, key) {
  console.log('handleTouchStart called with key:', key);
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

// === 7. Progress Indicator Functions ===
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
  }
  
  if (progressText) {
    progressText.textContent = `${current} / ${total}`;
  }
}



// === 8. Initialize ===
window.tuluTest = test; // Make test accessible globally for debugging

createKeyboard();
document.getElementById("target-text").textContent = test.testTarget;