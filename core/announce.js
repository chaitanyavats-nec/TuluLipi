// Screen-reader announcements through the polite live region in index.html.
let clearTimer = null;

export function announce(message) {
  const region = document.getElementById("sr-status");
  if (!region) return;
  region.textContent = "";
  // Re-inserting the text on the next tick makes repeated identical messages announce again.
  setTimeout(() => { region.textContent = message; }, 30);
  clearTimeout(clearTimer);
  clearTimer = setTimeout(() => { region.textContent = ""; }, 4000);
}
