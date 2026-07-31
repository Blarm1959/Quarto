(function () {
  "use strict";

  const STORAGE_KEY = "quarto.settings.v0.0.4";
  const DEFAULT_SETTINGS = {
    playerNames: ["Player 1", "Player 2"],
    starterMode: "random",
    timerSeconds: 30,
    lightColour: "#2668b2",
    darkColour: "#c83d4b",
    lastStarter: 1
  };

  const gameState = {
    settings: loadSettings(),
    currentPlayer: 0,
    receivingPlayer: 1,
    selectedPiece: null,
    selectedSlot: null,
    phase: "choose-piece",
    board: Array(16).fill(null),
    remainingPieceIds: window.QuartoPieces.PIECES.map(piece => piece.id)
  };

  function loadSettings() {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState.settings));
  }

  function playerName(index) {
    return gameState.settings.playerNames[index] || `Player ${index + 1}`;
  }

  function chooseStarter(mode) {
    if (mode === "0" || mode === "1") return Number(mode);
    if (mode === "alternate") return gameState.settings.lastStarter === 0 ? 1 : 0;
    return Math.random() < 0.5 ? 0 : 1;
  }

  function applyTheme() {
    document.documentElement.style.setProperty("--light-piece", gameState.settings.lightColour);
    document.documentElement.style.setProperty("--dark-piece", gameState.settings.darkColour);
  }

  function formatTimer(seconds) {
    if (!seconds) return "∞";
    return `00:${String(seconds).padStart(2, "0")}`;
  }

  function renderPlayers() {
    for (let index = 0; index < 2; index += 1) {
      const card = document.getElementById(`player-card-${index + 1}`);
      const name = document.getElementById(`player-name-${index + 1}`);
      const state = document.getElementById(`player-state-${index + 1}`);
      name.textContent = playerName(index);
      card.classList.toggle("player-card--active", index === gameState.currentPlayer);
      state.className = index === gameState.currentPlayer ? "turn-badge" : "waiting-label";
      state.textContent = index === gameState.currentPlayer ? "Choosing a piece" : "Waiting";
    }

    document.getElementById("timer").textContent = formatTimer(gameState.settings.timerSeconds);
    document.getElementById("current-piece-for").textContent = `For ${playerName(gameState.receivingPlayer)}`;
    document.getElementById("current-piece-help").textContent =
      `${playerName(gameState.currentPlayer)} chooses a piece for ${playerName(gameState.receivingPlayer)} to place.`;
  }

  function showEmptyCurrentPiece() {
    const current = document.getElementById("current-piece");
    current.replaceChildren();
    const message = document.createElement("div");
    message.className = "empty-piece-message";
    message.innerHTML = '<span class="empty-piece-icon" aria-hidden="true">?</span><span>No piece selected</span>';
    current.appendChild(message);
  }

  function animatePieceToCurrent(slot, piece) {
    const sourceSvg = slot.querySelector(".quarto-piece");
    const current = document.getElementById("current-piece");
    if (!sourceSvg || !current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sourceRect = sourceSvg.getBoundingClientRect();
    const targetRect = current.getBoundingClientRect();
    const clone = sourceSvg.cloneNode(true);
    clone.classList.add("flying-piece");
    Object.assign(clone.style, {
      left: `${sourceRect.left}px`,
      top: `${sourceRect.top}px`,
      width: `${sourceRect.width}px`,
      height: `${sourceRect.height}px`
    });
    document.body.appendChild(clone);

    const targetSize = Math.min(targetRect.width * 0.62, targetRect.height * 0.62, 220);
    const targetLeft = targetRect.left + (targetRect.width - targetSize) / 2;
    const targetTop = targetRect.top + (targetRect.height - targetSize) / 2 - 12;

    requestAnimationFrame(() => {
      clone.style.left = `${targetLeft}px`;
      clone.style.top = `${targetTop}px`;
      clone.style.width = `${targetSize}px`;
      clone.style.height = `${targetSize}px`;
      clone.style.opacity = "0.15";
    });
    clone.addEventListener("transitionend", () => clone.remove(), { once: true });
  }

  function renderCurrentPiece() {
    if (!gameState.selectedPiece) {
      showEmptyCurrentPiece();
      return;
    }

    const current = document.getElementById("current-piece");
    current.replaceChildren();
    const pieceWrap = document.createElement("div");
    pieceWrap.className = "current-piece-visual";
    pieceWrap.appendChild(window.QuartoPieces.createPieceSvg(gameState.selectedPiece));
    current.appendChild(pieceWrap);

    const description = document.createElement("div");
    description.className = "selected-description";
    description.textContent = window.QuartoPieces.describePiece(gameState.selectedPiece);
    current.appendChild(description);
  }

  function selectPiece(piece, slot) {
    if (gameState.selectedPiece?.id === piece.id) {
      slot.classList.add("piece-slot--nudge");
      setTimeout(() => slot.classList.remove("piece-slot--nudge"), 280);
      return;
    }

    gameState.selectedSlot?.classList.remove("piece-slot--selected");
    animatePieceToCurrent(slot, piece);
    gameState.selectedPiece = piece;
    gameState.selectedSlot = slot;
    slot.classList.add("piece-slot--selected");
    renderCurrentPiece();

    document.getElementById("status").textContent =
      `${playerName(gameState.currentPlayer)} selected ${window.QuartoPieces.describePiece(piece)} for ${playerName(gameState.receivingPlayer)}.`;
  }

  function renderTray() {
    window.QuartoPieces.createRemainingPieces(selectPiece);
    gameState.selectedSlot = null;
  }

  function resetGame(starterMode = gameState.settings.starterMode) {
    gameState.currentPlayer = chooseStarter(starterMode);
    gameState.receivingPlayer = gameState.currentPlayer === 0 ? 1 : 0;
    gameState.settings.lastStarter = gameState.currentPlayer;
    gameState.selectedPiece = null;
    gameState.selectedSlot = null;
    gameState.phase = "choose-piece";
    gameState.board = Array(16).fill(null);
    gameState.remainingPieceIds = window.QuartoPieces.PIECES.map(piece => piece.id);
    saveSettings();

    applyTheme();
    window.QuartoBoard.createBoard();
    renderTray();
    showEmptyCurrentPiece();
    renderPlayers();
    document.getElementById("piece-count").textContent = "16 remaining";
    document.getElementById("status").textContent =
      `${playerName(gameState.currentPlayer)} starts: choose any piece for ${playerName(gameState.receivingPlayer)}.`;
  }

  function populateSetupDialog() {
    document.getElementById("player-1-input").value = gameState.settings.playerNames[0];
    document.getElementById("player-2-input").value = gameState.settings.playerNames[1];
    document.getElementById("light-colour-input").value = gameState.settings.lightColour;
    document.getElementById("dark-colour-input").value = gameState.settings.darkColour;

    const starter = document.querySelector(`input[name="starter"][value="${gameState.settings.starterMode}"]`);
    const timer = document.querySelector(`input[name="timer"][value="${gameState.settings.timerSeconds}"]`);
    if (starter) starter.checked = true;
    if (timer) timer.checked = true;
  }

  function startFromDialog(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    gameState.settings.playerNames = [
      document.getElementById("player-1-input").value.trim() || "Player 1",
      document.getElementById("player-2-input").value.trim() || "Player 2"
    ];
    gameState.settings.starterMode = String(data.get("starter") || "random");
    gameState.settings.timerSeconds = Number(data.get("timer") || 30);
    gameState.settings.lightColour = document.getElementById("light-colour-input").value;
    gameState.settings.darkColour = document.getElementById("dark-colour-input").value;
    saveSettings();
    document.getElementById("new-game-dialog").close();
    resetGame(gameState.settings.starterMode);
  }

  function bindControls() {
    const setupDialog = document.getElementById("new-game-dialog");
    const openSetup = () => {
      populateSetupDialog();
      setupDialog.showModal();
    };

    document.getElementById("new-game-button")?.addEventListener("click", openSetup);
    document.getElementById("settings-button")?.addEventListener("click", openSetup);
    document.getElementById("cancel-new-game")?.addEventListener("click", () => setupDialog.close());
    document.getElementById("new-game-form")?.addEventListener("submit", startFromDialog);

    const rulesDialog = document.getElementById("how-to-play-dialog");
    document.getElementById("how-to-play-button")?.addEventListener("click", () => rulesDialog?.showModal());
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindControls();
    resetGame(gameState.settings.starterMode);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("service-worker.js").catch(() => {});
    }
  });

  window.QuartoGame = { state: gameState, resetGame };
})();
