// Single source of truth for the typed (roman) text.
// Keyboards, the hardware-key handler and suggestions all write here; the display
// and the typing test subscribe. Keeping it outside the keyboards means text
// survives switching keyboards.

export function createStore(initial = "") {
  let text = initial;
  const subscribers = new Set();

  const emit = change => subscribers.forEach(fn => fn(text, change));

  return {
    getText: () => text,

    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },

    insert(value, source = "screen") {
      if (!value) return;
      text += value;
      emit({ type: "insert", value, source });
    },

    backspace(source = "screen") {
      if (!text) return false;
      const chars = [...text];
      chars.pop();
      text = chars.join("");
      emit({ type: "backspace", source });
      return true;
    },

    /** Replace the word currently being typed (used by suggestions). */
    replaceCurrentWord(replacement) {
      const current = text.match(/\S*$/)[0];
      text = text.slice(0, text.length - current.length) + replacement;
      emit({
        type: "replace",
        value: replacement,
        removed: [...current].length,
        source: "suggestion",
      });
    },

    clear() {
      text = "";
      emit({ type: "clear" });
    },
  };
}

export const store = createStore();
