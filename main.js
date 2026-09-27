import { store } from "./core/store.js";
import { announce } from "./core/announce.js";
import { initDisplay } from "./core/display.js";
import { initHardwareKeyboard } from "./core/hardware.js";
import { initTestMode } from "./testmode.js";
import { initWelcomeModal } from "./welcome.js";

const KEYBOARDS = {
  "1": () => import("./keyboards/keyboard1.js"),
  "2": () => import("./keyboards/keyboard2.js"),
};
const DEFAULT_KEYBOARD = "1";
const PREFERENCE_KEY = "keyboardPreference";

const root = document.getElementById("keyboard");
const selectorButtons = document.querySelectorAll("[data-keyboard]");
const sink = {
  insert: text => store.insert(text, "screen"),
  backspace: () => store.backspace("screen"),
};

let current = null;
let loadToken = 0;

function readPreference() {
  try {
    const saved = localStorage.getItem(PREFERENCE_KEY);
    return saved in KEYBOARDS ? saved : DEFAULT_KEYBOARD;
  } catch {
    return DEFAULT_KEYBOARD;
  }
}

function savePreference(version) {
  try { localStorage.setItem(PREFERENCE_KEY, version); } catch { /* ignore */ }
}

async function loadKeyboard(version) {
  const token = ++loadToken;                       // ignore stale loads from rapid clicks
  const module = await KEYBOARDS[version]();
  if (token !== loadToken) return;

  current?.destroy();
  current = module.initKeyboard(root, { sink, announce });

  selectorButtons.forEach(button =>
    button.setAttribute("aria-pressed", String(button.dataset.keyboard === version)));
}

selectorButtons.forEach(button => {
  button.addEventListener("click", () => {
    const version = button.dataset.keyboard;
    savePreference(version);
    loadKeyboard(version);
  });
});

initDisplay(store, announce);
initTestMode(store, announce);
initHardwareKeyboard(store);
initWelcomeModal();
loadKeyboard(readPreference());
