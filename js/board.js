(function () {
  "use strict";

  function createBoard(boardState = Array(16).fill(null), onPlace, winningCells = [], previewCell = null) {
    const board = document.getElementById("board");
    if (!board) return;
    const winningSet = new Set(winningCells);
    board.replaceChildren();
    for (let index = 0; index < 16; index += 1) {
      const cell = document.createElement("button");
      const row = Math.floor(index / 4);
      const column = index % 4;
      const pieceId = boardState[index];
      cell.type = "button";
      cell.className = "board-cell";
      cell.dataset.index = String(index);
      cell.dataset.row = String(row);
      cell.dataset.column = String(column);
      cell.setAttribute("role", "gridcell");
      if (winningSet.has(index)) cell.classList.add("board-cell--winner");
      if (index === previewCell) cell.classList.add("board-cell--ai-target");
      if (pieceId === null) {
        cell.setAttribute("aria-label", `Empty square, row ${row + 1}, column ${column + 1}`);
        cell.addEventListener("click", () => onPlace?.(index, cell));
      } else {
        const piece = window.QuartoPieces.getPiece(pieceId);
        cell.classList.add("board-cell--occupied");
        cell.disabled = true;
        cell.setAttribute("aria-label", `${window.QuartoPieces.describePiece(piece)}, row ${row + 1}, column ${column + 1}`);
        const wrap = document.createElement("div");
        wrap.className = "board-piece";
        wrap.appendChild(window.QuartoPieces.createPieceSvg(piece));
        cell.appendChild(wrap);
      }
      board.appendChild(cell);
    }
  }

  function setPlacementEnabled(enabled) {
    document.getElementById("board")?.classList.toggle("board--place-enabled", enabled);
  }

  window.QuartoBoard = { createBoard, setPlacementEnabled };
})();
