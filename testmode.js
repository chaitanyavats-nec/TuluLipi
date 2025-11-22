export class TypingTest {
  constructor(targetText, typedTextRef, onComplete) {
    this.testTarget = targetText;
    this.typedTextRef = typedTextRef; // Function that returns current typedText
    this.onComplete = onComplete; // Callback function to show completion modal
    this.testStarted = false;
    this.testFinished = false;
    this.startTime = null;
    this.endTime = null;
    this.liveWPMInterval = null;
  }
  
  updateLiveWPM() {
    if (!this.testStarted || this.testFinished) return;
    
    const now = performance.now();
    const elapsed = (now - this.startTime) / 1000;
    const minutes = elapsed / 60;
    
    const typedLength = this.typedTextRef().length;
    const wpm = (typedLength / 5) / Math.max(minutes, 0.01);
    
    const wpmEl = document.getElementById("live-wpm");
    const timeEl = document.getElementById("live-time");
    
    if (wpmEl) wpmEl.textContent = `WPM: ${wpm.toFixed(1)}`;
    if (timeEl) timeEl.textContent = `Time: ${elapsed.toFixed(1)}s`;
  }
  
  startTimer() {
    this.testStarted = true;
    this.startTime = performance.now();
    this.updateLiveWPM();
    this.liveWPMInterval = setInterval(() => this.updateLiveWPM(), 100);
    
    // Show progress container
    const progressContainer = document.getElementById('progress-container');
    if (progressContainer) {
      progressContainer.style.display = 'block';
    }
  }
  
  stopTimer() {
    this.testFinished = true;
    this.endTime = performance.now();
    clearInterval(this.liveWPMInterval);
    
    const elapsed = (this.endTime - this.startTime) / 1000;
    const minutes = elapsed / 60;
    const typedLength = this.typedTextRef().length;
    const wpm = (typedLength / 5) / minutes;
    
    // Calculate final accuracy
    let correct = 0;
    const typed = this.typedTextRef();
    for (let i = 0; i < this.testTarget.length; i++) {
      if (typed[i] === this.testTarget[i]) correct++;
    }
    const accuracy = ((correct / this.testTarget.length) * 100).toFixed(1);
    
    // Call the completion callback if it exists
    if (this.onComplete) {
      this.onComplete(elapsed, wpm, accuracy);
    }
  }
  
  resetTest() {
    this.testStarted = false;
    this.testFinished = false;
    this.startTime = null;
    this.endTime = null;
    clearInterval(this.liveWPMInterval);
    
    // Reset display elements
    const targetEl = document.getElementById('target-text');
    if (targetEl) targetEl.innerHTML = this.testTarget;
    
    const wpmEl = document.getElementById('live-wpm');
    if (wpmEl) wpmEl.textContent = 'WPM: 0';
    
    const timeEl = document.getElementById('live-time');
    if (timeEl) timeEl.textContent = 'Time: 0.0s';
    
    const accuracyEl = document.getElementById('live-accuracy');
    if (accuracyEl) {
      accuracyEl.textContent = 'Accuracy: 100%';
      accuracyEl.style.color = '#4CAF50';
    }
    
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) progressBar.style.width = '0%';
    
    const progressText = document.getElementById('progress-text');
    if (progressText) progressText.textContent = '0 / ' + this.testTarget.length;
    
    const progressContainer = document.getElementById('progress-container');
    if (progressContainer) {
      progressContainer.style.display = 'none';
    }
  }
}