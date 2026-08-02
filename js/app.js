(function () {
  "use strict";

  const STORAGE_KEY = "quarto.settings.v0.0.12";
  const DEFAULT_SETTINGS = {
    playerNames: ["Player 1", "Computer"],
    gameMode: "computer",
    difficulty: 5,
    starterMode: "random",
    timerSeconds: 30,
    lightColour: "#2668b2",
    darkColour: "#c83d4b",
    lastStarter: 1
  };

  const gameState = {
    settings: loadSettings(), currentPlayer: 0, receivingPlayer: 1,
    selectedPiece: null, phase: "choose-piece", board: Array(16).fill(null),
    remainingPieceIds: window.QuartoPieces.PIECES.map(piece => piece.id),
    timerRemaining: 30, timerHandle: null, aiHandle: null,
    winner: null, winningCells: [], winningAttributes: []
  };

  function loadSettings() {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const previous = JSON.parse(localStorage.getItem("quarto.settings.v0.0.11") || "{}");
      return { ...DEFAULT_SETTINGS, ...previous, ...current };
    } catch { return { ...DEFAULT_SETTINGS }; }
  }

  function saveSettings() { localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState.settings)); }
  function isComputer(index) { return gameState.settings.gameMode === "computer" && index === 1; }
  function playerName(index) { return isComputer(index) ? "Computer" : (gameState.settings.playerNames[index] || `Player ${index + 1}`); }
  function difficultyName(level) {
    if (level <= 3) return "Beginner";
    if (level <= 7) return "Intermediate";
    return "Expert";
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
  function formatTimer(seconds) { return gameState.settings.timerSeconds ? `00:${String(Math.max(0, seconds)).padStart(2, "0")}` : "∞"; }
  function stopTimer() { if (gameState.timerHandle) clearInterval(gameState.timerHandle); gameState.timerHandle = null; }
  function stopAi() { if (gameState.aiHandle) clearTimeout(gameState.aiHandle); gameState.aiHandle = null; }

  function resetMoveTimer() {
    stopTimer();
    gameState.timerRemaining = gameState.settings.timerSeconds;
    const timer = document.getElementById("timer");
    timer.textContent = formatTimer(gameState.timerRemaining);
    timer.classList.remove("timer--warning", "timer--urgent");
    if (!gameState.settings.timerSeconds || isComputer(gameState.currentPlayer)) return;
    gameState.timerHandle = setInterval(() => {
      gameState.timerRemaining -= 1;
      timer.textContent = formatTimer(gameState.timerRemaining);
      timer.classList.toggle("timer--warning", gameState.timerRemaining <= 10 && gameState.timerRemaining > 5);
      timer.classList.toggle("timer--urgent", gameState.timerRemaining <= 5);
      if (gameState.timerRemaining <= 0) {
        stopTimer();
        document.getElementById("status").textContent = `Time expired for ${playerName(gameState.currentPlayer)} — continue when ready.`;
      }
    }, 1000);
  }

  function phaseInstruction() {
    if (gameState.phase === "place-piece") return `${playerName(gameState.currentPlayer)}: place the selected piece on any empty square.`;
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
      if (won) { state.className = "turn-badge turn-badge--winner"; state.textContent = "Winner"; }
      else { state.className = active ? "turn-badge" : "waiting-label"; state.textContent = active ? (isComputer(index) ? "Thinking…" : gameState.phase === "place-piece" ? "Place the piece" : "Choose a piece") : "Waiting"; }
    }
    document.getElementById("current-piece-for").textContent = gameState.phase === "game-over" ? "Game complete" : gameState.phase === "place-piece" ? `Placed by ${playerName(gameState.currentPlayer)}` : `For ${playerName(gameState.receivingPlayer)}`;
    document.getElementById("current-piece-help").textContent = gameState.phase === "game-over" ? "Start a new game to play again." : gameState.phase === "place-piece" ? `${playerName(gameState.currentPlayer)} places this piece, then chooses the next piece.` : `${playerName(gameState.currentPlayer)} chooses a piece for ${playerName(gameState.receivingPlayer)} to place.`;
  }

  function showEmptyCurrentPiece() {
    const current = document.getElementById("current-piece");
    current.innerHTML = '<div class="empty-piece-message"><span class="empty-piece-icon" aria-hidden="true">?</span><span>No piece selected</span></div>';
  }
  function renderCurrentPiece() {
    if (!gameState.selectedPiece) return showEmptyCurrentPiece();
    const current = document.getElementById("current-piece"); current.replaceChildren();
    const wrap = document.createElement("div"); wrap.className = "current-piece-visual"; wrap.appendChild(window.QuartoPieces.createPieceSvg(gameState.selectedPiece)); current.appendChild(wrap);
    const description = document.createElement("div"); description.className = "selected-description"; description.textContent = window.QuartoPieces.describePiece(gameState.selectedPiece); current.appendChild(description);
  }
  function renderTray() {
    const enabled = gameState.phase === "choose-piece" && !isComputer(gameState.currentPlayer);
    window.QuartoPieces.createRemainingPieces(selectPiece, gameState.remainingPieceIds, enabled);
    const phoneTray = document.getElementById("phone-piece-tray");
    window.QuartoPieces.createRemainingPieces(selectPiece, gameState.remainingPieceIds, enabled, phoneTray);
    document.getElementById("piece-count").textContent = `${gameState.remainingPieceIds.length} remaining`;
    document.getElementById("open-piece-picker").disabled = !enabled;
  }
  function renderBoard() {
    window.QuartoBoard.createBoard(gameState.board, placePiece, gameState.winningCells);
    window.QuartoBoard.setPlacementEnabled(gameState.phase === "place-piece" && !isComputer(gameState.currentPlayer));
  }
  function renderGame() {
    document.body.dataset.phase = gameState.phase;
    document.body.dataset.computerTurn = String(isComputer(gameState.currentPlayer));
    renderPlayers(); renderCurrentPiece(); renderTray(); renderBoard();
  }

  function animatePieceToCurrent(slot) {
    const sourceSvg = slot?.querySelector(".quarto-piece"); const current = document.getElementById("current-piece");
    if (!sourceSvg || !current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sourceRect = sourceSvg.getBoundingClientRect(), targetRect = current.getBoundingClientRect(), clone = sourceSvg.cloneNode(true);
    clone.classList.add("flying-piece"); Object.assign(clone.style,{left:`${sourceRect.left}px`,top:`${sourceRect.top}px`,width:`${sourceRect.width}px`,height:`${sourceRect.height}px`}); document.body.appendChild(clone);
    const targetSize = Math.min(targetRect.width*.62,targetRect.height*.62,220);
    requestAnimationFrame(()=>Object.assign(clone.style,{left:`${targetRect.left+(targetRect.width-targetSize)/2}px`,top:`${targetRect.top+(targetRect.height-targetSize)/2-12}px`,width:`${targetSize}px`,height:`${targetSize}px`,opacity:"0.15"}));
    clone.addEventListener("transitionend",()=>clone.remove(),{once:true});
  }

  function selectPiece(piece, slot) {
    if (gameState.phase !== "choose-piece" || isComputer(gameState.currentPlayer)) return;
    document.getElementById("piece-picker-dialog")?.close();
    completePieceSelection(piece, slot);
  }
  function completePieceSelection(piece, slot) {
    animatePieceToCurrent(slot); gameState.selectedPiece = piece;
    gameState.remainingPieceIds = gameState.remainingPieceIds.filter(id => id !== piece.id);
    gameState.currentPlayer = gameState.receivingPlayer; gameState.receivingPlayer = gameState.currentPlayer === 0 ? 1 : 0; gameState.phase = "place-piece";
    renderGame(); resetMoveTimer(); document.getElementById("status").textContent = phaseInstruction(); scheduleComputerTurn();
  }
  function placePiece(index) {
    if (gameState.phase !== "place-piece" || !gameState.selectedPiece || gameState.board[index] !== null || isComputer(gameState.currentPlayer)) return;
    completePlacement(index);
  }
  function completePlacement(index) {
    gameState.board[index] = gameState.selectedPiece.id; gameState.selectedPiece = null;
    const result = window.QuartoRules.checkForQuarto(gameState.board);
    if (result) {
      gameState.phase="game-over"; gameState.winner=gameState.currentPlayer; gameState.winningCells=result.line; gameState.winningAttributes=result.attributes; stopTimer();
      renderGame(); document.getElementById("status").textContent=`${playerName(gameState.winner)} wins (${formatWinningAttributes(result.attributes)})`; return;
    }
    if (gameState.board.every(value=>value!==null)) {
      gameState.phase="game-over"; stopTimer(); renderGame(); document.getElementById("status").textContent="The game is a draw."; return;
    }
    gameState.phase="choose-piece"; gameState.receivingPlayer=gameState.currentPlayer===0?1:0;
    renderGame(); resetMoveTimer(); document.getElementById("status").textContent=phaseInstruction(); scheduleComputerTurn();
  }

  function scheduleComputerTurn() {
    stopAi();
    if (gameState.phase === "game-over" || !isComputer(gameState.currentPlayer)) return;
    document.getElementById("status").textContent = `Computer is thinking — level ${gameState.settings.difficulty} ${difficultyName(gameState.settings.difficulty)}.`;
    gameState.aiHandle = setTimeout(() => {
      if (gameState.phase === "place-piece") {
        const index = window.QuartoAI.choosePlacement(gameState.board, gameState.selectedPiece.id, gameState.settings.difficulty);
        if (index !== null) completePlacement(index);
      } else {
        const piece = window.QuartoAI.choosePiece(gameState.board, gameState.remainingPieceIds, gameState.settings.difficulty);
        if (piece) completePieceSelection(piece, null);
      }
    }, 650);
  }

  function resetGame(starterMode = gameState.settings.starterMode) {
    stopTimer(); stopAi(); applyTheme();
    const starter=chooseStarter(starterMode); gameState.settings.lastStarter=starter; saveSettings();
    Object.assign(gameState,{currentPlayer:starter,receivingPlayer:starter===0?1:0,selectedPiece:null,phase:"choose-piece",board:Array(16).fill(null),remainingPieceIds:window.QuartoPieces.PIECES.map(piece=>piece.id),winner:null,winningCells:[],winningAttributes:[]});
    renderGame(); resetMoveTimer(); document.getElementById("status").textContent=phaseInstruction(); scheduleComputerTurn();
  }

  function updateSetupMode() {
    const mode = document.querySelector('input[name="gameMode"]:checked')?.value || "computer";
    document.getElementById("difficulty-field").hidden = mode !== "computer";
    document.getElementById("player-2-field").hidden = mode === "computer";
  }
  function updateDifficultyLabel() {
    const level=Number(document.getElementById("difficulty-input").value);
    document.getElementById("difficulty-name").textContent=`Level ${level} · ${difficultyName(level)}`;
  }
  function populateSetupDialog() {
    document.getElementById("player-1-input").value=gameState.settings.playerNames[0]||"Player 1";
    document.getElementById("player-2-input").value=gameState.settings.playerNames[1]||"Player 2";
    document.querySelector(`input[name="gameMode"][value="${gameState.settings.gameMode}"]`)?.click();
    document.querySelector(`input[name="starter"][value="${gameState.settings.starterMode}"]`)?.click();
    document.querySelector(`input[name="timer"][value="${gameState.settings.timerSeconds}"]`)?.click();
    document.getElementById("difficulty-input").value=String(gameState.settings.difficulty);
    document.getElementById("light-colour-input").value=gameState.settings.lightColour;
    document.getElementById("dark-colour-input").value=gameState.settings.darkColour;
    updateSetupMode(); updateDifficultyLabel();
  }
  function startFromDialog(event) {
    event.preventDefault(); const data=new FormData(event.currentTarget);
    gameState.settings.gameMode=String(data.get("gameMode")||"computer");
    gameState.settings.difficulty=Number(data.get("difficulty")||5);
    gameState.settings.playerNames=[document.getElementById("player-1-input").value.trim()||"Player 1",document.getElementById("player-2-input").value.trim()||"Player 2"];
    gameState.settings.starterMode=String(data.get("starter")||"random"); gameState.settings.timerSeconds=Number(data.get("timer")||30);
    gameState.settings.lightColour=document.getElementById("light-colour-input").value; gameState.settings.darkColour=document.getElementById("dark-colour-input").value;
    saveSettings(); document.getElementById("new-game-dialog").close(); resetGame(gameState.settings.starterMode);
  }
  async function renderApplicationVersion() {
    const element=document.getElementById("app-version");
    try { const response=await fetch("package.json",{cache:"no-store"}); const info=await response.json(); element.textContent=`Version ${info.version}`; } catch { element.textContent="Quarto"; }
  }
  function bindControls() {
    const setup=document.getElementById("new-game-dialog"); const openSetup=()=>{populateSetupDialog();setup.showModal();};
    document.getElementById("new-game-button")?.addEventListener("click",openSetup); document.getElementById("settings-button")?.addEventListener("click",openSetup);
    document.getElementById("cancel-new-game")?.addEventListener("click",()=>setup.close()); document.getElementById("new-game-form")?.addEventListener("submit",startFromDialog);
    document.querySelectorAll('input[name="gameMode"]').forEach(input=>input.addEventListener("change",updateSetupMode));
    document.getElementById("difficulty-input")?.addEventListener("input",updateDifficultyLabel);
    document.getElementById("how-to-play-button")?.addEventListener("click",()=>document.getElementById("how-to-play-dialog")?.showModal());
    document.getElementById("open-piece-picker")?.addEventListener("click",()=>document.getElementById("piece-picker-dialog")?.showModal());
  }

  document.addEventListener("DOMContentLoaded",()=>{ bindControls(); renderApplicationVersion(); resetGame(gameState.settings.starterMode); if("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js").catch(()=>{}); });
  window.QuartoGame={state:gameState,resetGame};
})();
