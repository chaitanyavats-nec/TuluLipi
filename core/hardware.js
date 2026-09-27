// Physical-keyboard typing. Anything the OS can produce as a single character
// (including diacritics from a compose/IME layout) goes straight into the store.

const NATIVE_ACTIVATION = "button, a[href], input, textarea, select, [role='option']";

export function initHardwareKeyboard(store) {
  document.addEventListener("keydown", event => {
    if (event.defaultPrevented || event.isComposing) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (document.querySelector("dialog[open]")) return;

    const { key } = event;

    // Space/Enter on a focused control must keep activating it (on-screen keys handle
    // their own click), so only intercept them elsewhere.
    const onControl = event.target instanceof Element && event.target.closest(NATIVE_ACTIVATION);

    if (key === "Backspace") {
      event.preventDefault();
      store.backspace("hardware");
    } else if (key === "Enter") {
      if (onControl) return;
      event.preventDefault();
      store.insert("\n", "hardware");
    } else if ([...key].length === 1) {
      if (key === " " && onControl) return;
      event.preventDefault();
      store.insert(key, "hardware");
    }
  });
}
