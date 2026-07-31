(function () {
  "use strict";

  let selectedPiece = null;
  let selectedSlot = null;

  function showEmptyCurrentPiece() {
    const current = document.getElementById("current-piece");
    current.replaceChildren();
    const message = document.createElement("div");
    message.className = "empty-piece-message";
    message.innerHTML = '<span class="empty-piece-icon" aria-hidden="true">?</span><span>No piece selected</span>';
    current.appendChild(message);
  }

  function selectPiece(piece, slot) {
    selectedSlot?.classList.remove("piece-slot--selected");
    selectedPiece = piece;
    selectedSlot = slot;
    slot.classList.add("piece-slot--selected");

    const current = document.getElementById("current-piece");
    current.replaceChildren();
    current.appendChild(window.QuartoPieces.createPieceSvg(piece));

    const description = document.createElement("div");
    description.className = "selected-description";
    description.textContent = window.QuartoPieces.describePiece(piece);
    current.appendChild(description);

    document.getElementById("status").textContent =
      `Selected for Player 2: ${window.QuartoPieces.describePiece(piece)}.`;
  }

  function resetGame() {
    selectedPiece = null;
    selectedSlot = null;
    window.QuartoBoard.createBoard();
    window.QuartoPieces.createRemainingPieces(selectPiece);
    showEmptyCurrentPiece();
    document.getElementById("piece-count").textContent = "16 remaining";
    document.getElementById("status").textContent = "Player 1: choose any piece for Player 2.";
    document.getElementById("timer").textContent = "00:30";
  }

  function bindControls() {
    document.getElementById("new-game-button")?.addEventListener("click", resetGame);
    const dialog = document.getElementById("how-to-play-dialog");
    document.getElementById("how-to-play-button")?.addEventListener("click", () => dialog?.showModal());
    document.getElementById("settings-button")?.addEventListener("click", () => {
      document.getElementById("status").textContent = "Settings will be added in a later version.";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    resetGame();
    bindControls();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("service-worker.js").catch(() => {});
    }
  });
})();
