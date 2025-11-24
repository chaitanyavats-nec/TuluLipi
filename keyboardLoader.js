const keyboardContainer = document.getElementById("keyboard");

// Clear old keyboard UI + listeners
function resetKeyboard() {
  keyboardContainer.innerHTML = "";
}

// Dynamically load selected keyboard
async function loadKeyboard(version) {
  resetKeyboard();

  if (version === "1") {
    const module = await import("./keyboards/keyboard1.js");
    module.initKeyboard();
  }

  if (version === "2") {
    const module = await import("./keyboards/keyboard2.js");
    module.initKeyboard();
  }
}

// Handle UI clicks
document.querySelectorAll("[data-keyboard]").forEach(btn => {
  btn.addEventListener("click", () => {
    const version = btn.dataset.keyboard;
    loadKeyboard(version);

    // Optional: remember choice
    localStorage.setItem("keyboardPreference", version);
  });
});

// Auto-load last used keyboard
const saved = localStorage.getItem("keyboardPreference") || "1";
loadKeyboard(saved);

document.querySelector(".reload-button").addEventListener("click", () => {
  location.reload();
});
