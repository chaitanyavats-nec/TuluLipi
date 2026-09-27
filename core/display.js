// Output panes, suggestion bar, Copy and Reset - everything that reacts to the store.
import { transliterate } from "../transliteration.js";
import { predict, resetDialect } from "../predictiveEngine.js";

const PREDICT_OPTIONS = { region: "north", preferredDialect: "brahmin" };

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Insecure context (e.g. file://) or permission denied: fall back to execCommand.
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.append(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { /* ignore */ }
    area.remove();
    return ok;
  }
}

export function initDisplay(store, announce) {
  const roman = document.getElementById("roman-output");
  const tulu = document.getElementById("tulu-output");
  const bar = document.getElementById("suggestion-bar");
  const copyBtn = document.getElementById("copy-btn");
  const resetBtn = document.getElementById("reset-btn");

  const dialectState = {};
  let suggestions = [];

  function renderSuggestions(text) {
    const word = text.match(/\S*$/)[0];
    if (!word) resetDialect(dialectState);
    suggestions = predict(word, dialectState, PREDICT_OPTIONS);

    bar.textContent = "";
    suggestions.forEach((entry, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "suggestion";
      button.textContent = entry.variant;
      button.dataset.index = String(index);
      bar.append(button);
    });
  }

  function render(text) {
    roman.textContent = text;
    tulu.textContent = transliterate(text);
    roman.scrollTop = roman.scrollHeight;
    tulu.scrollTop = tulu.scrollHeight;
    renderSuggestions(text);
  }

  bar.addEventListener("click", event => {
    const button = event.target.closest(".suggestion");
    if (!button) return;
    const entry = suggestions[Number(button.dataset.index)];
    // `variant` is the typeable spelling; `latin_phonetic` can contain IPA symbols.
    if (entry) store.replaceCurrentWord(entry.variant + " ");
  });

  let copyLabelTimer = null;
  function flashCopyLabel(label) {
    copyBtn.textContent = label;
    clearTimeout(copyLabelTimer);
    copyLabelTimer = setTimeout(() => {
      copyBtn.textContent = "Copy";
      copyBtn.classList.remove("copied");
    }, 1800);
  }

  copyBtn.addEventListener("click", async () => {
    const output = tulu.textContent;
    if (!output.trim()) {
      flashCopyLabel("Nothing to copy");
      announce("Nothing to copy");
      return;
    }
    if (await copyToClipboard(output)) {
      copyBtn.classList.add("copied");
      flashCopyLabel("Copied");
      announce("Tulu text copied to clipboard");
    } else {
      flashCopyLabel("Copy failed");
      announce("Copy failed. Press and hold the Tulu text to select it.");
    }
  });

  resetBtn.addEventListener("click", () => {
    store.clear();
    announce("Text cleared");
  });

  store.subscribe(render);
  render(store.getText());
}
