(function () {
  "use strict";

  const STORAGE_KEY = "quarto.settings.v0.0.7";
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
    phase: "choose-piece",
    board: Array(16).fill(null),
    remainingPieceIds: window.QuartoPieces.PIECES.map(piece => piece.id),
    timerRemaining: 30,
    timerHandle: null,
    winner: null,
    winningCells: [],
    winningAttributes: []
  };

  function loadSettings() {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const previous = JSON.parse(localStorage.getItem("quarto.settings.v0.0.4") || "{}");
      return { ...DEFAULT_SETTINGS, ...previous, ...current };
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
    if (!gameState.settings.timerSeconds) return "∞";
    return `00:${String(Math.max(0, seconds)).padStart(2, "0")}`;
  }

  function stopTimer() {
    if (gameState.timerHandle) window.clearInterval(gameState.timerHandle);
    gameState.timerHandle = null;
  }

  function resetMoveTimer() {
    stopTimer();
    gameState.timerRemaining = gameState.settings.timerSeconds;
    const timer = document.getElementById("timer");
    timer.textContent = formatTimer(gameState.timerRemaining);
    timer.classList.remove("timer--warning", "timer--urgent");

    if (!gameState.settings.timerSeconds) return;

    gameState.timerHandle = window.setInterval(() => {
      gameState.timerRemaining -= 1;
      timer.textContent = formatTimer(gameState.timerRemaining);
      timer.classList.toggle("timer--warning", gameState.timerRemaining <= 10 && gameState.timerRemaining > 5);
      timer.classList.toggle("timer--urgent", gameState.timerRemaining <= 5);
      if (gameState.timerRemaining <= 0) {
        stopTimer();
        document.getElementById("status").textContent =
          `Time expired for ${playerName(gameState.currentPlayer)} — continue when ready.`;
      }
    }, 1000);
  }

  function phaseInstruction() {
    if (gameState.phase === "place-piece") {
      return `${playerName(gameState.currentPlayer)}: place the selected piece on any empty square.`;
    }
    return `${playerName(gameState.currentPlayer)}: choose any piece for ${playerName(gameState.receivingPlayer)}.`;
  }

  function formatWinningAttributes(attributes) {
    if (attributes.length === 1) return `4 ${attributes[0]} pieces`;
    if (attributes.length === 2) return `4 ${attributes[0]} & 4 ${attributes[1]} pieces`;
    return attributes.map((attribute,index) => index === attributes.length - 1 ? `& 4 ${attribute} pieces` : `4 ${attribute}`).join(", ");
  }

  function renderPlayers() {
    for (let index = 0; index < 2; index += 1) {
      const card = document.getElementById(`player-card-${index + 1}`);
      const name = document.getElementById(`player-name-${index + 1}`);
      const state = document.getElementById(`player-state-${index + 1}`);
      const active = gameState.phase !== "game-over" && index === gameState.currentPlayer;
      const won = gameState.phase === "game-over" && index === gameState.winner;
      name.textContent = playerName(index);
      card.classList.toggle("player-card--active", active);
      card.classList.toggle("player-card--winner", won);
      if (won) {
        state.className = "turn-badge turn-badge--winner";
        state.textContent = "Winner";
      } else {
        state.className = active ? "turn-badge" : "waiting-label";
        state.textContent = active ? (gameState.phase === "place-piece" ? "Placing the piece" : "Choosing a piece") : "Waiting";
      }
    }

    const forText = gameState.phase === "game-over"
      ? "Game complete"
      : gameState.phase === "place-piece"
        ? `Placed by ${playerName(gameState.currentPlayer)}`
        : `For ${playerName(gameState.receivingPlayer)}`;
    document.getElementById("current-piece-for").textContent = forText;
    document.getElementById("current-piece-help").textContent = gameState.phase === "game-over"
      ? "Start a new game to play again."
      : gameState.phase === "place-piece"
        ? `${playerName(gameState.currentPlayer)} places this piece, then chooses the next piece.`
        : `${playerName(gameState.currentPlayer)} chooses a piece for ${playerName(gameState.receivingPlayer)} to place.`;
  }

  function showEmptyCurrentPiece() {
    const current = document.getElementById("current-piece");
    current.replaceChildren();
    const message = document.createElement("div");
    message.className = "empty-piece-message";
    message.innerHTML = '<span class="empty-piece-icon" aria-hidden="true">?</span><span>No piece selected</span>';
    current.appendChild(message);
  }

  function animatePieceToCurrent(slot) {
    const sourceSvg = slot.querySelector(".quarto-piece");
    const current = document.getElementById("current-piece");
    if (!sourceSvg || !current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sourceRect = sourceSvg.getBoundingClientRect();
    const targetRect = current.getBoundingClientRect();
    const clone = sourceSvg.cloneNode(true);
    clone.classList.add("flying-piece");
    Object.assign(clone.style, {
      left: `${sourceRect.left}px`, top: `${sourceRect.top}px`,
      width: `${sourceRect.width}px`, height: `${sourceRect.height}px`
    });
    document.body.appendChild(clone);

    const targetSize = Math.min(targetRect.width * 0.62, targetRect.height * 0.62, 220);
    requestAnimationFrame(() => {
      clone.style.left = `${targetRect.left + (targetRect.width - targetSize) / 2}px`;
      clone.style.top = `${targetRect.top + (targetRect.height - targetSize) / 2 - 12}px`;
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

  function renderTray() {
    const enabled = gameState.phase === "choose-piece";
    window.QuartoPieces.createRemainingPieces(selectPiece, gameState.remainingPieceIds, enabled);
    document.getElementById("piece-count").textContent =
      `${gameState.remainingPieceIds.length} remaining`;
  }

  function renderBoard() {
    window.QuartoBoard.createBoard(gameState.board, placePiece, gameState.winningCells);
    window.QuartoBoard.setPlacementEnabled(gameState.phase === "place-piece");
  }

  function renderGame() {
    document.body.dataset.phase = gameState.phase;
    renderPlayers();
    renderCurrentPiece();
    renderTray();
    renderBoard();
  }

  function selectPiece(piece, slot) {
    if (gameState.phase !== "choose-piece") return;

    animatePieceToCurrent(slot);
    gameState.selectedPiece = piece;
    gameState.remainingPieceIds = gameState.remainingPieceIds.filter(id => id !== piece.id);
    gameState.currentPlayer = gameState.receivingPlayer;
    gameState.receivingPlayer = gameState.currentPlayer === 0 ? 1 : 0;
    gameState.phase = "place-piece";

    renderGame();
    resetMoveTimer();
    document.getElementById("status").textContent = phaseInstruction();
  }

  function placePiece(index, cell) {
    if (gameState.phase !== "place-piece" || !gameState.selectedPiece || gameState.board[index] !== null) return;
    gameState.board[index] = gameState.selectedPiece.id;
    cell.classList.add("board-cell--landing");
    gameState.selectedPiece = null;

    const result = window.QuartoRules.checkForQuarto(gameState.board);
    if (result) {
      gameState.phase = "game-over";
      gameState.winner = gameState.currentPlayer;
      gameState.winningCells = result.line;
      gameState.winningAttributes = result.attributes;
      stopTimer();
      renderGame();
      document.getElementById("status").textContent = `${playerName(gameState.winner)} wins (${formatWinningAttributes(result.attributes)})`;
      return;
    }

    gameState.phase = "choose-piece";
    gameState.receivingPlayer = gameState.currentPlayer === 0 ? 1 : 0;
    renderGame();
    resetMoveTimer();
    if (gameState.board.every(value => value !== null)) {
      stopTimer();
      gameState.phase = "game-over";
      renderGame();
      document.getElementById("status").textContent = "The game is a draw.";
      return;
    }
    document.getElementById("status").textContent = phaseInstruction();
  }

  function resetGame(starterMode = gameState.settings.starterMode) {
    gameState.currentPlayer = chooseStarter(starterMode);
    gameState.receivingPlayer = gameState.currentPlayer === 0 ? 1 : 0;
    gameState.settings.lastStarter = gameState.currentPlayer;
    gameState.selectedPiece = null;
    gameState.phase = "choose-piece";
    gameState.board = Array(16).fill(null);
    gameState.remainingPieceIds = window.QuartoPieces.PIECES.map(piece => piece.id);
    gameState.winner = null;
    gameState.winningCells = [];
    gameState.winningAttributes = [];
    saveSettings();

    applyTheme();
    renderGame();
    resetMoveTimer();
    document.getElementById("status").textContent =
      `${playerName(gameState.currentPlayer)} starts: choose any piece for ${playerName(gameState.receivingPlayer)}.`;
  }

  function populateSetupDialog() {
    document.getElementById("player-1-input").value = gameState.settings.playerNames[0];
    document.getElementById("player-2-input").value = gameState.settings.playerNames[1];
    document.getElementById("light-colour-input").value = gameState.settings.lightColour;
    document.getElementById("dark-colour-input").value = gameState.settings.darkColour;
    document.querySelector(`input[name="starter"][value="${gameState.settings.starterMode}"]`)?.click();
    document.querySelector(`input[name="timer"][value="${gameState.settings.timerSeconds}"]`)?.click();
  }

  function startFromDialog(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
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


  async function renderApplicationVersion() {
    const versionElement = document.getElementById("app-version");
    if (!versionElement) return;

    try {
      const response = await fetch("package.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const packageInfo = await response.json();
      const version = String(packageInfo.version || "").trim();

      versionElement.textContent = version
        ? `Version ${version}`
        : "Quarto";
    } catch {
      versionElement.textContent = "Quarto";
    }
  }

  function bindControls() {
    const setupDialog = document.getElementById("new-game-dialog");
    const openSetup = () => { populateSetupDialog(); setupDialog.showModal(); };
    document.getElementById("new-game-button")?.addEventListener("click", openSetup);
    document.getElementById("settings-button")?.addEventListener("click", openSetup);
    document.getElementById("cancel-new-game")?.addEventListener("click", () => setupDialog.close());
    document.getElementById("new-game-form")?.addEventListener("submit", startFromDialog);
    const rulesDialog = document.getElementById("how-to-play-dialog");
    document.getElementById("how-to-play-button")?.addEventListener("click", () => rulesDialog?.showModal());
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindControls();
    renderApplicationVersion();
    resetGame(gameState.settings.starterMode);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });

  window.QuartoGame = { state: gameState, resetGame };
})();
