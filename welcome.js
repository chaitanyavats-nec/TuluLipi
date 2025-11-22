// welcome.js

export function initWelcomeModal() {
    const modal = document.getElementById("welcome-modal");
    const startBtn = document.getElementById("welcome-start");

    if (!modal || !startBtn) return; // failsafe

    // Show modal only if user has not dismissed it
    if (!localStorage.getItem("welcome_seen")) {
        modal.classList.remove("hidden");
    }

    startBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        localStorage.setItem("welcome_seen", "yes");
    });
}
