(function () {
  "use strict";

  const STORAGE_KEY = "quarto.settings.v0.1.18";
  const DEFAULT_SETTINGS = {
    playerNames: ["Player 1", "Computer"],
    gameMode: "computer",
    difficulty: 5,
    starterMode: "random",
    timerSeconds: 30,
    lastStarter: 1,
    soundEffects: true,
    animations: true
  };

  const gameState = {
    settings: loadSettings(), currentPlayer: 0, receivingPlayer: 1,
    selectedPiece: null, phase: "choose-piece", board: Array(16).fill(null),
    remainingPieceIds: window.QuartoPieces.PIECES.map(piece => piece.id),
    timerRemaining: 30, timerHandle: null, aiHandle: null,
    winner: null, winningCells: [], winningAttributes: [], chooseTurnId: 0,
    aiStage: null, aiPreviewPieceId: null, aiPreviewCell: null
  };

  function loadSettings() {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const previous14 = JSON.parse(localStorage.getItem("quarto.settings.v0.1.5") || localStorage.getItem("quarto.settings.v0.1.4") || localStorage.getItem("quarto.settings.v0.1.3") || localStorage.getItem("quarto.settings.v0.1.2") || "{}");
      const previous10 = JSON.parse(localStorage.getItem("quarto.settings.v0.1.0") || "{}");
      const previous20 = JSON.parse(localStorage.getItem("quarto.settings.v0.0.20") || "{}");
      const previous19 = JSON.parse(localStorage.getItem("quarto.settings.v0.0.14") || "{}");
      const previous013 = JSON.parse(localStorage.getItem("quarto.settings.v0.0.13") || "{}");
      const previous12 = JSON.parse(localStorage.getItem("quarto.settings.v0.0.12") || "{}");
      const previous11 = JSON.parse(localStorage.getItem("quarto.settings.v0.0.11") || "{}");
      return { ...DEFAULT_SETTINGS, ...previous11, ...previous12, ...previous19, ...previous20, ...previous10, ...previous14, ...current };
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
  function difficultyDescription(level) {
    if (level === 1) return "A true beginner: legal moves, simple ideas and believable missed chances.";
    if (level <= 3) return "A learning opponent that increasingly notices wins and dangerous pieces.";
    if (level <= 4) return "A casual player that takes immediate wins and usually avoids obvious gifts.";
    if (level <= 6) return "A reliable tactical player that sees wins, threats and safer piece choices.";
    if (level <= 8) return "A strong opponent that searches complete place-and-gift turns ahead.";
    return "Expert search with deeper look-ahead and exact endgame analysis where practical.";
  }

  let audioContext = null;
  let autoOpenedPickerTurnId = -1;
  function playTone(kind) {
    if (!gameState.settings.soundEffects) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const presets = {
        select: [520, .045, "sine"], place: [330, .06, "triangle"], win: [660, .16, "sine"]
      };
      const [frequency, duration, type] = presets[kind] || presets.select;
      oscillator.type = type; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.08, audioContext.currentTime + .01);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + duration + .02);
      if (kind === "win") window.setTimeout(() => playTone("select"), 120);
    } catch {}
  }

  function applyMotionPreference() {
    document.body.classList.toggle("animations-disabled", !gameState.settings.animations);
  }
  function chooseStarter(mode) {
    if (mode === "0" || mode === "1") return Number(mode);
    if (mode === "alternate") return gameState.settings.lastStarter === 0 ? 1 : 0;
    return Math.random() < 0.5 ? 0 : 1;
  }
  function applyTheme() {
    const appearance = window.QuartoPieces.configureAppearance(gameState.settings);
    const help = document.getElementById("piece-attributes-help");
    if (help) help.textContent = `Each piece is tall or short, round or square, ${appearance.colourAName.toLowerCase()} or ${appearance.colourBName.toLowerCase()}, and solid or hollow.`;
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
  function displayAttribute(attribute) {
    const [colourA, colourB] = window.QuartoPieces.getColourNames();
    if (attribute === "Light") return colourA;
    if (attribute === "Dark") return colourB;
    if (attribute === "Hole") return "Hollow";
    return attribute;
  }
  function formatWinningAttributes(attributes) {
    const displayed = attributes.map(displayAttribute);
    if (displayed.length === 1) return `4 ${displayed[0].toLowerCase()} pieces`;
    if (displayed.length === 2) return `4 ${displayed[0].toLowerCase()} & 4 ${displayed[1].toLowerCase()} pieces`;
    return displayed.map((attribute,index) => index === displayed.length - 1 ? `& 4 ${attribute.toLowerCase()} pieces` : `4 ${attribute.toLowerCase()}`).join(", ");
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
      else { state.className = active ? "turn-badge" : "waiting-label"; state.textContent = active ? (isComputer(index) ? (gameState.aiStage === "preview-place" ? "Placing…" : gameState.aiStage === "preview-choice" ? "Choosing…" : "Thinking…") : gameState.phase === "place-piece" ? "Place the piece" : "Choose a piece") : "Waiting"; }
    }
    document.getElementById("current-piece-for").textContent = gameState.phase === "game-over" ? "Game complete" : gameState.phase === "place-piece" ? `Placed by ${playerName(gameState.currentPlayer)}` : `For ${playerName(gameState.receivingPlayer)}`;
    document.getElementById("current-piece-help").textContent = gameState.phase === "game-over" ? (gameState.winner === null ? "The board is full. Press Play again when you are ready." : `${formatWinningAttributes(gameState.winningAttributes)}. The winning line remains highlighted.`) : gameState.phase === "place-piece" ? `${playerName(gameState.currentPlayer)} places this piece, then chooses the next piece.` : `${playerName(gameState.currentPlayer)} chooses a piece for ${playerName(gameState.receivingPlayer)} to place.`;
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
    window.QuartoPieces.createRemainingPieces(selectPiece, gameState.remainingPieceIds, enabled, null, gameState.aiPreviewPieceId);
    const phoneTray = document.getElementById("phone-piece-tray");
    window.QuartoPieces.createRemainingPieces(selectPiece, gameState.remainingPieceIds, enabled, phoneTray, gameState.aiPreviewPieceId);
    document.getElementById("piece-count").textContent = `${gameState.remainingPieceIds.length} remaining`;
    document.getElementById("open-piece-picker").disabled = !enabled;
  }
  function renderBoard() {
    window.QuartoBoard.createBoard(gameState.board, placePiece, gameState.winningCells, gameState.aiPreviewCell);
    window.QuartoBoard.setPlacementEnabled(gameState.phase === "place-piece" && !isComputer(gameState.currentPlayer));
  }
  function renderPhoneTurnDock() {
    const dock = document.getElementById("phone-turn-dock");
    const preview = document.getElementById("phone-current-piece");
    const title = document.getElementById("phone-turn-title");
    const detail = document.getElementById("phone-turn-detail");
    const action = document.getElementById("phone-turn-action");
    if (!dock || !preview || !title || !detail || !action) return;

    const computerTurn = isComputer(gameState.currentPlayer) && gameState.phase !== "game-over";
    preview.replaceChildren();
    dock.dataset.mode = gameState.phase;

    if (gameState.phase === "game-over") {
      title.textContent = gameState.winner === null ? "Game complete" : `${playerName(gameState.winner)} wins`;
      detail.textContent = gameState.winner === null ? "The board is full. Press Play again." : `${formatWinningAttributes(gameState.winningAttributes)} · Press Play again when ready.`;
      action.hidden = true;
      preview.hidden = true;
      return;
    }

    if (computerTurn) {
      title.textContent = gameState.aiStage === "preview-place" ? "Computer is placing" : gameState.aiStage === "preview-choice" ? "Computer chose your piece" : "Computer is thinking";
      detail.textContent = gameState.aiStage === "preview-place" ? "Watch the highlighted square" : gameState.aiStage === "preview-choice" ? "The highlighted piece is coming to you" : `Level ${gameState.settings.difficulty} · ${difficultyName(gameState.settings.difficulty)}`;
      action.hidden = true;
      if (gameState.aiStage === "preview-choice" && gameState.aiPreviewPieceId !== null) {
        const chosenPiece = window.QuartoPieces.getPiece(gameState.aiPreviewPieceId);
        if (chosenPiece) preview.appendChild(window.QuartoPieces.createPieceSvg(chosenPiece));
        preview.hidden = false;
      } else {
        preview.hidden = true;
      }
      return;
    }

    if (gameState.phase === "choose-piece") {
      title.textContent = `${playerName(gameState.currentPlayer)}, choose a piece`;
      detail.textContent = `For ${playerName(gameState.receivingPlayer)} · ${gameState.remainingPieceIds.length} remaining`;
      action.textContent = "Choose";
      action.hidden = false;
      preview.hidden = true;
      return;
    }

    title.textContent = `${playerName(gameState.currentPlayer)}, place this piece`;
    detail.textContent = window.QuartoPieces.describePiece(gameState.selectedPiece);
    action.hidden = true;
    preview.hidden = false;
    if (gameState.selectedPiece) preview.appendChild(window.QuartoPieces.createPieceSvg(gameState.selectedPiece));
  }

  function maybeAutoOpenPiecePicker() {
    if (gameState.phase !== "choose-piece" || isComputer(gameState.currentPlayer)) return;
    if (!window.matchMedia("(max-width: 740px)").matches) return;
    if (autoOpenedPickerTurnId === gameState.chooseTurnId) return;

    window.requestAnimationFrame(() => {
      if (gameState.phase !== "choose-piece" || isComputer(gameState.currentPlayer)) return;
      if (autoOpenedPickerTurnId === gameState.chooseTurnId) return;
      const dialog = document.getElementById("piece-picker-dialog");
      if (!dialog || dialog.open || document.querySelector("dialog[open]")) return;
      autoOpenedPickerTurnId = gameState.chooseTurnId;
      dialog.showModal();
    });
  }

  function renderGame() {
    document.body.dataset.phase = gameState.phase;
    document.body.dataset.computerTurn = String(isComputer(gameState.currentPlayer));
    const replayButton = document.getElementById("new-game-button");
    if (replayButton) {
      const finished = gameState.phase === "game-over";
      replayButton.textContent = finished ? "Play again" : "New game";
      replayButton.classList.toggle("button--play-again", finished);
      replayButton.setAttribute("aria-label", finished ? "Play again with the same settings" : "Start a new game with the same settings");
    }
    const status = document.getElementById("status");
    status?.classList.toggle("status-message--winner", gameState.phase === "game-over" && gameState.winner !== null);
    status?.classList.toggle("status-message--draw", gameState.phase === "game-over" && gameState.winner === null);
    renderPlayers(); renderCurrentPiece(); renderTray(); renderBoard(); renderPhoneTurnDock(); schedulePhoneLayoutUpdate(); maybeAutoOpenPiecePicker();
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
    gameState.aiStage = null; gameState.aiPreviewPieceId = null; gameState.aiPreviewCell = null;
    animatePieceToCurrent(slot); playTone("select"); gameState.selectedPiece = piece;
    gameState.remainingPieceIds = gameState.remainingPieceIds.filter(id => id !== piece.id);
    gameState.currentPlayer = gameState.receivingPlayer; gameState.receivingPlayer = gameState.currentPlayer === 0 ? 1 : 0; gameState.phase = "place-piece";
    renderGame(); resetMoveTimer(); document.getElementById("status").textContent = phaseInstruction(); scheduleComputerTurn();
  }
  function placePiece(index) {
    if (gameState.phase !== "place-piece" || !gameState.selectedPiece || gameState.board[index] !== null || isComputer(gameState.currentPlayer)) return;
    completePlacement(index);
  }
  function completePlacement(index) {
    gameState.aiStage = null; gameState.aiPreviewPieceId = null; gameState.aiPreviewCell = null;
    gameState.board[index] = gameState.selectedPiece.id; gameState.selectedPiece = null; playTone("place");
    const result = window.QuartoRules.checkForQuarto(gameState.board);
    if (result) {
      gameState.phase="game-over"; gameState.winner=gameState.currentPlayer; gameState.winningCells=result.line; gameState.winningAttributes=result.attributes; stopTimer();
      const resultText = `${playerName(gameState.winner)} wins (${formatWinningAttributes(result.attributes)})`;
      stopAi(); renderGame(); document.getElementById("status").textContent=`Quarto! ${resultText}.`; playTone("win"); return;
    }
    if (gameState.board.every(value=>value!==null)) {
      gameState.phase="game-over"; stopTimer(); stopAi(); renderGame(); document.getElementById("status").textContent="Draw — the board is full with no Quarto."; return;
    }
    gameState.phase="choose-piece"; gameState.receivingPlayer=gameState.currentPlayer===0?1:0; gameState.chooseTurnId += 1;
    renderGame(); resetMoveTimer(); document.getElementById("status").textContent=phaseInstruction(); scheduleComputerTurn();
  }

  function computerThinkingDelay() {
    const level = Math.max(1, Math.min(10, Number(gameState.settings.difficulty) || 1));
    const base = 320 + level * 55;
    return base + Math.floor(Math.random() * 260);
  }

  function scheduleComputerTurn() {
    stopAi();
    if (gameState.phase === "game-over" || !isComputer(gameState.currentPlayer)) return;
    gameState.aiStage = "thinking";
    gameState.aiPreviewPieceId = null;
    gameState.aiPreviewCell = null;
    renderGame();
    document.getElementById("status").textContent = `Computer is thinking — level ${gameState.settings.difficulty} ${difficultyName(gameState.settings.difficulty)}.`;

    gameState.aiHandle = setTimeout(() => {
      if (gameState.phase === "game-over" || !isComputer(gameState.currentPlayer)) return;
      const previewDelay = gameState.settings.animations === false ? 180 : 620;

      if (gameState.phase === "place-piece") {
        const index = window.QuartoAI.choosePlacement(gameState.board, gameState.selectedPiece.id, gameState.settings.difficulty, gameState.remainingPieceIds);
        if (index === null) return;
        gameState.aiStage = "preview-place";
        gameState.aiPreviewCell = index;
        renderGame();
        document.getElementById("status").textContent = "Computer has chosen where to place the piece.";
        gameState.aiHandle = setTimeout(() => completePlacement(index), previewDelay);
      } else {
        const piece = window.QuartoAI.choosePiece(gameState.board, gameState.remainingPieceIds, gameState.settings.difficulty);
        if (!piece) return;
        gameState.aiStage = "preview-choice";
        gameState.aiPreviewPieceId = piece.id;
        renderGame();
        document.getElementById("status").textContent = `Computer chose the ${window.QuartoPieces.describePiece(piece)} piece for you.`;
        const highlightedSlot = document.querySelector(`.piece-slot[data-piece-id="${piece.id}"]`);
        gameState.aiHandle = setTimeout(() => completePieceSelection(piece, highlightedSlot), previewDelay);
      }
    }, computerThinkingDelay());
  }

  function resetGame(starterMode = gameState.settings.starterMode) {
    stopTimer(); stopAi(); applyTheme(); applyMotionPreference();
    const starter=chooseStarter(starterMode); gameState.settings.lastStarter=starter; saveSettings();
    Object.assign(gameState,{currentPlayer:starter,receivingPlayer:starter===0?1:0,selectedPiece:null,phase:"choose-piece",board:Array(16).fill(null),remainingPieceIds:window.QuartoPieces.PIECES.map(piece=>piece.id),winner:null,winningCells:[],winningAttributes:[],chooseTurnId:gameState.chooseTurnId+1,aiStage:null,aiPreviewPieceId:null,aiPreviewCell:null});
    autoOpenedPickerTurnId = -1;
    renderGame(); resetMoveTimer(); document.getElementById("status").textContent=phaseInstruction(); scheduleComputerTurn();
  }

  let wizardStep = 0;
  function updateSetupMode() {
    const mode = document.querySelector('input[name="gameMode"]:checked')?.value || "computer";
    document.getElementById("difficulty-field").hidden = mode !== "computer";
    document.getElementById("player-2-field").hidden = mode === "computer";
    updateSetupSummary();
  }
  function updateDifficultyLabel() {
    const level=Number(document.getElementById("difficulty-input").value);
    document.getElementById("difficulty-name").textContent=`Level ${level} · ${difficultyName(level)}`;
    document.getElementById("difficulty-description").textContent=difficultyDescription(level);
    updateSetupSummary();
  }
  function showWizardStep(step) {
    wizardStep=Math.max(0,Math.min(2,step));
    document.querySelectorAll("[data-wizard-step]").forEach(section=>{
      const active=Number(section.dataset.wizardStep)===wizardStep;
      section.hidden=!active; section.classList.toggle("wizard-step--active",active);
    });
    document.querySelectorAll("[data-step-indicator]").forEach(indicator=>{
      const value=Number(indicator.dataset.stepIndicator);
      indicator.classList.toggle("wizard-progress-step--active",value===wizardStep);
      indicator.classList.toggle("wizard-progress-step--complete",value<wizardStep);
    });
    document.getElementById("wizard-back").hidden=wizardStep===0;
    document.getElementById("wizard-next").hidden=wizardStep===2;
    document.getElementById("wizard-start").hidden=wizardStep!==2;
    if (wizardStep===2) updateSetupSummary();
  }
  function updateSetupSummary() {
    const summary=document.getElementById("setup-summary"); if(!summary) return;
    const mode=document.querySelector('input[name="gameMode"]:checked')?.value || "computer";
    const level=Number(document.getElementById("difficulty-input")?.value||5);
    const timer=Number(document.querySelector('input[name="timer"]:checked')?.value||30);
    const player1=document.getElementById("player-1-input")?.value.trim()||"Player 1";
    const opponent=mode==="computer" ? `Computer · Level ${level}` : (document.getElementById("player-2-input")?.value.trim()||"Player 2");
    summary.innerHTML=`<strong>${player1} vs ${opponent}</strong><span>${timer ? `${timer}-second turns` : "No move timer"}</span>`;
  }
  function startNewGameWithCurrentSettings(event) {
    event?.preventDefault();
    event?.stopPropagation();
    const setup = document.getElementById("new-game-dialog");
    if (setup?.open) setup.close();
    resetGame(gameState.settings.starterMode);
  }

  function populateSetupDialog() {
    document.getElementById("player-1-input").value=gameState.settings.playerNames[0]||"Player 1";
    document.getElementById("player-2-input").value=gameState.settings.playerNames[1]||"Player 2";
    document.querySelector(`input[name="gameMode"][value="${gameState.settings.gameMode}"]`)?.click();
    document.querySelector(`input[name="starter"][value="${gameState.settings.starterMode}"]`)?.click();
    document.querySelector(`input[name="timer"][value="${gameState.settings.timerSeconds}"]`)?.click();
    document.getElementById("difficulty-input").value=String(gameState.settings.difficulty);
    document.getElementById("sound-effects-input").checked=gameState.settings.soundEffects!==false;
    document.getElementById("animations-input").checked=gameState.settings.animations!==false;
    updateSetupMode(); updateDifficultyLabel(); showWizardStep(0);
  }
  function startFromDialog(event) {
    event.preventDefault(); const data=new FormData(event.currentTarget);
    gameState.settings.gameMode=String(data.get("gameMode")||"computer");
    gameState.settings.difficulty=Number(data.get("difficulty")||5);
    gameState.settings.playerNames=[document.getElementById("player-1-input").value.trim()||"Player 1",document.getElementById("player-2-input").value.trim()||"Player 2"];
    gameState.settings.starterMode=String(data.get("starter")||"random"); gameState.settings.timerSeconds=Number(data.get("timer")||30);
    gameState.settings.soundEffects=document.getElementById("sound-effects-input").checked;
    gameState.settings.animations=document.getElementById("animations-input").checked;
    saveSettings(); document.getElementById("new-game-dialog").close(); resetGame(gameState.settings.starterMode);
  }
  async function renderApplicationVersion() {
    const element=document.getElementById("app-version");
    const helpVersion=document.getElementById("help-version");
    if (!element && !helpVersion) return;
    const showVersion=(version, commit="", builtAt="")=>{
      const cleanVersion=String(version || "0.1.18").replace(/^v/i, "");
      if (element) {
        element.textContent=`Version ${cleanVersion}${commit}`;
        element.title=builtAt ? `Published ${new Date(builtAt).toLocaleString()}` : "";
      }
      if (helpVersion) helpVersion.textContent=`Quarto · v${cleanVersion}`;
    };
    try {
      const response=await fetch("build-info.json",{cache:"no-store"});
      if (!response.ok) throw new Error("No deployed build information");
      const info=await response.json();
      const commit=info.commit ? ` · ${String(info.commit).slice(0,7)}` : "";
      showVersion(info.version, commit, info.builtAt);
      return;
    } catch {}
    try {
      const response=await fetch("package.json",{cache:"no-store"});
      const info=await response.json();
      showVersion(info.version);
    } catch { showVersion("0.1.18"); }
  }

  let deferredInstallPrompt = null;
  function setInstallButtonsVisible(visible) {
    ["install-app-button","install-app-action"].forEach(id => {
      const button=document.getElementById(id); if (button) button.hidden=!visible;
    });
  }
  async function installApplication() {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt=null; setInstallButtonsVisible(false);
  }
  function showUpdateBanner(registration) {
    const banner=document.getElementById("pwa-update-banner");
    if (!banner || !registration.waiting) return;
    banner.hidden=false;
    document.getElementById("pwa-update-button")?.addEventListener("click",()=>registration.waiting?.postMessage({type:"SKIP_WAITING"}),{once:true});
    document.getElementById("pwa-update-dismiss")?.addEventListener("click",()=>banner.hidden=true,{once:true});
  }
  async function registerPwa() {
    window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();deferredInstallPrompt=event;setInstallButtonsVisible(true);});
    window.addEventListener("appinstalled",()=>{deferredInstallPrompt=null;setInstallButtonsVisible(false);});
    if (!("serviceWorker" in navigator)) return;
    try {
      const registration=await navigator.serviceWorker.register("service-worker.js",{scope:"./"});
      if (registration.waiting) showUpdateBanner(registration);
      registration.addEventListener("updatefound",()=>{
        const worker=registration.installing;
        worker?.addEventListener("statechange",()=>{if(worker.state==="installed" && navigator.serviceWorker.controller) showUpdateBanner(registration);});
      });
      let refreshing=false;
      navigator.serviceWorker.addEventListener("controllerchange",()=>{if(!refreshing){refreshing=true;location.reload();}});
    } catch (error) { console.warn("Quarto service worker registration failed",error); }
  }

  let phoneLayoutFrame = 0;
  let phoneLayoutTimer = 0;

  function visibleViewportHeight() {
    const visualHeight = window.visualViewport?.height;
    return Math.max(0, Math.round(visualHeight || window.innerHeight || document.documentElement.clientHeight));
  }

  function updatePhoneLayout() {
    cancelAnimationFrame(phoneLayoutFrame);
    phoneLayoutFrame = requestAnimationFrame(() => {
      const root = document.documentElement;
      const viewportHeight = visibleViewportHeight();
      root.style.setProperty("--app-viewport-height", `${viewportHeight}px`);

      const phonePortrait = window.matchMedia("(max-width: 740px) and (orientation: portrait)").matches;
      if (!phonePortrait) {
        root.style.removeProperty("--phone-board-size");
        return;
      }

      const shell = document.querySelector(".app-shell");
      const header = document.querySelector(".app-header");
      const dock = document.getElementById("phone-turn-dock");
      const players = document.querySelector(".player-strip");
      const actions = document.querySelector(".action-bar");
      if (!shell || !header || !dock || !players || !actions) return;

      const shellStyle = getComputedStyle(shell);
      const shellPadding = parseFloat(shellStyle.paddingTop) + parseFloat(shellStyle.paddingBottom);
      const fixedHeight = header.offsetHeight + dock.offsetHeight + players.offsetHeight + actions.offsetHeight;
      const verticalGaps = 18;
      const heightAvailable = Math.floor(viewportHeight - shellPadding - fixedHeight - verticalGaps);
      const widthAvailable = Math.floor(shell.clientWidth);
      const boardSize = Math.max(220, Math.min(widthAvailable, heightAvailable));
      root.style.setProperty("--phone-board-size", `${boardSize}px`);
    });
  }

  function schedulePhoneLayoutUpdate() {
    updatePhoneLayout();
    clearTimeout(phoneLayoutTimer);
    phoneLayoutTimer = window.setTimeout(updatePhoneLayout, 120);
    window.setTimeout(updatePhoneLayout, 360);
  }

  function bindPhoneViewport() {
    window.addEventListener("resize", schedulePhoneLayoutUpdate, { passive: true });
    window.addEventListener("orientationchange", schedulePhoneLayoutUpdate, { passive: true });
    window.addEventListener("pageshow", schedulePhoneLayoutUpdate, { passive: true });
    window.visualViewport?.addEventListener("resize", schedulePhoneLayoutUpdate, { passive: true });
    window.visualViewport?.addEventListener("scroll", schedulePhoneLayoutUpdate, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) schedulePhoneLayoutUpdate();
    });
  }

  function bindControls() {
    const setup=document.getElementById("new-game-dialog");
    const openSetup=(event)=>{
      event?.preventDefault();
      event?.stopPropagation();
      populateSetupDialog();
      setup.showModal();
    };
    document.getElementById("new-game-button")?.addEventListener("click",startNewGameWithCurrentSettings);
    document.getElementById("settings-button")?.addEventListener("click",openSetup);
    document.getElementById("cancel-new-game")?.addEventListener("click",()=>setup.close()); document.getElementById("new-game-form")?.addEventListener("submit",startFromDialog);
    document.querySelectorAll('input[name="gameMode"]').forEach(input=>input.addEventListener("change",updateSetupMode));
    document.getElementById("difficulty-input")?.addEventListener("input",updateDifficultyLabel);
    document.getElementById("wizard-next")?.addEventListener("click",()=>showWizardStep(wizardStep+1));
    document.getElementById("wizard-back")?.addEventListener("click",()=>showWizardStep(wizardStep-1));
    document.querySelectorAll('#new-game-form input').forEach(input=>input.addEventListener("change",updateSetupSummary));
    document.querySelectorAll('#new-game-form input[type="text"]').forEach(input=>input.addEventListener("input",updateSetupSummary));
    document.getElementById("how-to-play-button")?.addEventListener("click",()=>document.getElementById("how-to-play-dialog")?.showModal());
    document.getElementById("open-piece-picker")?.addEventListener("click",()=>document.getElementById("piece-picker-dialog")?.showModal());
    document.getElementById("phone-turn-action")?.addEventListener("click",()=>{
      if (gameState.phase === "choose-piece" && !isComputer(gameState.currentPlayer)) document.getElementById("piece-picker-dialog")?.showModal();
    });
    document.getElementById("install-app-button")?.addEventListener("click",installApplication);
    document.getElementById("install-app-action")?.addEventListener("click",installApplication);
  }

  document.addEventListener("DOMContentLoaded",()=>{
    bindControls();
    bindPhoneViewport();
    renderApplicationVersion();
    resetGame(gameState.settings.starterMode);
    registerPwa();
    schedulePhoneLayoutUpdate();
  });
  window.QuartoGame={state:gameState,resetGame};
})();
