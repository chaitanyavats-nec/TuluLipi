import { TypingTimer } from "./timer.js";
import { calculateWPM, simpleErrorRate } from "./metrics.js";

export class TestController {
    constructor(targetText, onFinish) {
        this.targetText = targetText;
        this.timer = new TypingTimer();
        this.typed = "";
        this.onFinish = onFinish;
    }

    handleInput(char) {
        if (this.typed.length === 0) {
            this.timer.start();
        }

        this.typed += char;

        if (this.typed === this.targetText) {
            this.timer.stop();
            const minutes = this.timer.getTimeInMinutes();
            const wpm = calculateWPM(this.typed, minutes);
            const errors = simpleErrorRate(this.targetText, this.typed);

            this.onFinish({
                wpm,
                time: minutes,
                errors,
                typed: this.typed,
            });
        }
    }
}
