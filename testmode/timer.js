export class TypingTimer {
    constructor() {
        this.startTime = null;
        this.endTime = null;
    }

    start() {
        if (!this.startTime) this.startTime = performance.now();
    }

    stop() {
        this.endTime = performance.now();
    }

    getTimeInMinutes() {
        if (!this.startTime || !this.endTime) return 0;
        return (this.endTime - this.startTime) / 1000 / 60;
    }
}
