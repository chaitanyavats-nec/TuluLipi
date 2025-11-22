export class TypingTest {
  constructor(targetText, typedTextRef) {
    this.testTarget = targetText;
    this.typedTextRef = typedTextRef; // typedText from your main file

    this.testStarted = false;
    this.testFinished = false;

    this.startTime = null;
    this.endTime = null;

    this.liveWPMInterval = null;
  }

  updateLiveWPM() {
    if (!this.testStarted || this.testFinished) return;

    const now = performance.now();
    const minutes = (now - this.startTime) / 1000 / 60;
    const wpm = (this.typedTextRef().length / 5) / minutes;

    document.getElementById("live-wpm").textContent = `WPM: ${wpm.toFixed(1)}`;
    document.getElementById("live-time").textContent = `Time: ${((now - this.startTime) / 1000).toFixed(1)}s`;
  }

  startTimer() {
    this.testStarted = true;
    this.startTime = performance.now();

    this.updateLiveWPM();
    this.liveWPMInterval = setInterval(() => this.updateLiveWPM(), 100);
  }

  stopTimer() {
    this.testFinished = true;
    this.endTime = performance.now();

    clearInterval(this.liveWPMInterval);

    const minutes = (this.endTime - this.startTime) / 1000 / 60;
    const wpm = (this.typedTextRef().length / 5) / minutes;

    alert(
      `Test Complete!\n\n` +
      `Time: ${(minutes * 60).toFixed(1)} sec\n` +
      `WPM: ${wpm.toFixed(1)}`
    );
  }
}
