export function calculateWPM(typedText, minutes) {
    if (minutes === 0) return 0;
    const charCount = typedText.length;
    return (charCount / 5) / minutes;
}

export function simpleErrorRate(target, typed) {
    let errors = 0;
    for (let i = 0; i < Math.max(target.length, typed.length); i++) {
        if (target[i] !== typed[i]) errors++;
    }
    return errors;
}
