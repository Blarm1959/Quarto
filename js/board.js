(function () {
  "use strict";

  function createBoard() {
    const board = document.getElementById("board");
    if (!board) return;

    board.replaceChildren();

    for (let index = 0; index < 16; index += 1) {
      const cell = document.createElement("div");
      const row = Math.floor(index / 4);
      const column = index % 4;

      cell.className = "board-cell";
      cell.dataset.index = String(index);
      cell.dataset.row = String(row);
      cell.dataset.column = String(column);
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", `Empty square, row ${row + 1}, column ${column + 1}`);

      board.appendChild(cell);
    }
  }

  window.QuartoBoard = { createBoard };
})();
