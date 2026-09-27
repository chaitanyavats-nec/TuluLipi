// Welcome dialog, shown once. Uses <dialog> so focus trapping, Escape and inert background are native.
const STORAGE_KEY = "welcome_seen";

function hasSeenWelcome() {
  try { return localStorage.getItem(STORAGE_KEY) === "yes"; } catch { return false; }
}

function rememberWelcome() {
  try { localStorage.setItem(STORAGE_KEY, "yes"); } catch { /* private mode: show again next time */ }
}

export function initWelcomeModal() {
  const dialog = document.getElementById("welcome-modal");
  if (!dialog || typeof dialog.showModal !== "function") return;

  // Start button remembers immediately; 'close' covers Escape.
  document.getElementById("welcome-start")?.addEventListener("click", rememberWelcome);
  dialog.addEventListener("close", rememberWelcome);
  if (!hasSeenWelcome()) dialog.showModal();
}
