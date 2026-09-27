// Typing test: TypingTest holds the rules and numbers (no DOM); TestView draws them.

export const TEST_TARGET =
  'onji baaṇaalada yeradu cup akki nii neṇsoothu aiku neeru padthu jekkla bethhu baaṇaalani stove mithhu ijilaa';

const codePoints = text => [...text];

/** Characters of `typed` that do not match the target at the same position (extras included). */
export function countWrong(typed, target) {
  const t = codePoints(typed);
  const g = codePoints(target);
  return t.reduce((wrong, ch, i) => wrong + (ch === g[i] ? 0 : 1), 0);
}

export class TypingTest {
  constructor(target, { now = () => performance.now() } = {}) {
    this.target = target;
    this.now = now;
    this.reset();
  }

  reset() {
    this.started = false;
    this.finished = false;
    this.startTime = null;
    this.endTime = null;
    this.inserted = 0;    // characters typed, corrections included
    this.deleted = 0;     // characters removed again
    this.keystrokes = 0;
    this.corrections = 0;
  }

  /** Feed a store change. Returns 'started' | 'finished' | 'reset' | null. */
  handleChange(change, text) {
    if (change.type === 'clear') {
      this.reset();
      return 'reset';
    }
    if (this.finished) return null;

    let result = null;
    if (change.type === 'insert' || change.type === 'replace') {
      if (!this.started) {
        this.started = true;
        this.startTime = this.now();
        result = 'started';
      }
      this.inserted += codePoints(change.value).length;
      this.deleted += change.removed || 0;
      this.keystrokes++;
    } else if (change.type === 'backspace') {
      if (!this.started) return null;
      this.deleted++;
      this.corrections++;
      this.keystrokes++;
    }

    if (this.started && text === this.target) {
      this.finished = true;
      this.endTime = this.now();
      return 'finished';
    }
    return result;
  }

  elapsedSeconds() {
    if (!this.started) return 0;
    return ((this.finished ? this.endTime : this.now()) - this.startTime) / 1000;
  }

  /** Words per minute using the standard 5-characters-per-word convention. */
  wpm(text) {
    const minutes = Math.max(this.elapsedSeconds(), 0.05) / 60;
    return codePoints(text).length / 5 / minutes;
  }

  /**
   * Keystroke accuracy: the share of typed characters that were right first time.
   * Wrong characters still on screen and characters that had to be deleted both count against it.
   */
  accuracy(text) {
    if (this.inserted === 0) return 100;
    const wrongOnScreen = countWrong(text, this.target);
    const good = Math.max(0, this.inserted - this.deleted - wrongOnScreen);
    return (good / this.inserted) * 100;
  }
}

// ---------------------------------------------------------------- view
function accuracyClass(accuracy) {
  if (accuracy >= 95) return 'is-good';
  if (accuracy >= 80) return 'is-ok';
  return 'is-bad';
}

class TestView {
  constructor(test) {
    this.test = test;
    this.el = {
      target: document.getElementById('target-text'),
      bar: document.getElementById('progress-bar'),
      progressText: document.getElementById('progress-text'),
      progress: document.getElementById('progress-container'),
      time: document.getElementById('live-time'),
      wpm: document.getElementById('live-wpm'),
      accuracy: document.getElementById('live-accuracy'),
    };
    this.timer = null;
  }

  startClock() {
    this.stopClock();
    this.timer = setInterval(() => this.renderStats(), 100);
  }

  stopClock() {
    clearInterval(this.timer);
    this.timer = null;
  }

  renderTarget(text) {
    const typed = codePoints(text);
    const target = codePoints(this.test.target);
    const fragment = document.createDocumentFragment();

    target.forEach((ch, i) => {
      const span = document.createElement('span');
      span.textContent = ch;
      if (i > typed.length) span.className = 'pending';
      else if (i === typed.length) span.className = 'current';
      else span.className = typed[i] === ch ? 'correct' : 'incorrect';
      fragment.append(span);
    });

    if (typed.length > target.length) {
      const extra = document.createElement('span');
      extra.className = 'extra';
      extra.textContent = typed.slice(target.length).join('');
      fragment.append(extra);
    }
    this.el.target.replaceChildren(fragment);
  }

  renderStats(text = this.lastText || '') {
    const { test, el } = this;
    el.time.textContent = `Time: ${test.elapsedSeconds().toFixed(1)}s`;
    el.wpm.textContent = `WPM: ${test.started ? test.wpm(text).toFixed(1) : 0}`;

    const accuracy = test.accuracy(text);
    el.accuracy.textContent = `Accuracy: ${accuracy.toFixed(1)}%`;
    el.accuracy.className = `stat-badge ${accuracyClass(accuracy)}`;
  }

  render(text) {
    this.lastText = text;
    const { test, el } = this;
    const typedLength = codePoints(text).length;
    const targetLength = codePoints(test.target).length;

    el.progress.hidden = !test.started;
    el.bar.style.width = `${Math.min(100, (typedLength / targetLength) * 100)}%`;
    el.progressText.textContent = `${Math.min(typedLength, targetLength)} / ${targetLength}`;
    this.renderTarget(text);
    this.renderStats(text);
  }

  showResults(text, onRetry) {
    const { test } = this;
    const dialog = document.createElement('dialog');
    dialog.className = 'completion-dialog';
    dialog.setAttribute('aria-labelledby', 'completion-title');
    dialog.innerHTML = `
      <form method="dialog" class="completion-content">
        <h2 id="completion-title">Test complete</h2>
        <div class="completion-stats">
          <div class="stat-item"><div class="stat-label">Time</div><div class="stat-value">${test.elapsedSeconds().toFixed(1)}s</div></div>
          <div class="stat-item"><div class="stat-label">Speed</div><div class="stat-value">${test.wpm(text).toFixed(1)} WPM</div></div>
          <div class="stat-item"><div class="stat-label">Accuracy</div><div class="stat-value">${test.accuracy(text).toFixed(1)}%</div></div>
        </div>
        <p class="completion-detail">${test.keystrokes} keystrokes, ${test.corrections} corrections</p>
        <div class="completion-buttons">
          <button value="retry" class="btn-primary" autofocus>Try again</button>
          <button value="close" class="btn-secondary">Close</button>
        </div>
      </form>`;
    // Buttons act immediately; 'close' covers Escape. finish() runs once either way.
    let finished = false;
    const finish = retry => {
      if (finished) return;
      finished = true;
      dialog.remove();
      if (retry) onRetry();
    };
    dialog.querySelector('[value="retry"]').addEventListener('click', () => finish(true));
    dialog.querySelector('[value="close"]').addEventListener('click', () => finish(false));
    dialog.addEventListener('close', () => finish(false));
    document.body.append(dialog);
    dialog.showModal();
  }
}

export function initTestMode(store, announce, target = TEST_TARGET) {
  const test = new TypingTest(target);
  const view = new TestView(test);

  store.subscribe((text, change) => {
    const result = test.handleChange(change, text);
    if (result === 'started') view.startClock();
    if (result === 'finished' || result === 'reset') view.stopClock();
    view.render(text);

    if (result === 'finished') {
      announce(`Test complete. ${test.wpm(text).toFixed(1)} words per minute, ${test.accuracy(text).toFixed(1)} percent accuracy.`);
      view.showResults(text, () => store.clear());
    }
  });

  view.render(store.getText());
  return test;
}
