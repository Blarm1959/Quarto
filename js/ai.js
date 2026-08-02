(function () {
  "use strict";

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function emptyCells(board) {
    return board.map((value, index) => value === null ? index : -1).filter(index => index >= 0);
  }

  function winningPlacements(board, pieceId) {
    return emptyCells(board).filter(index => {
      const testBoard = [...board];
      testBoard[index] = pieceId;
      return Boolean(window.QuartoRules.checkForQuarto(testBoard));
    });
  }

  function linePotential(board, index, pieceId) {
    const testBoard = [...board];
    testBoard[index] = pieceId;
    const piece = window.QuartoPieces.getPiece(pieceId);
    let score = 0;

    for (const line of window.QuartoRules.WINNING_LINES.filter(candidate => candidate.includes(index))) {
      const pieces = line
        .map(cell => testBoard[cell])
        .filter(value => value !== null)
        .map(value => window.QuartoPieces.getPiece(value));
      const occupied = pieces.length;
      if (!occupied) continue;
      for (const attribute of ["tall", "round", "dark", "hole"]) {
        if (pieces.every(other => other[attribute] === piece[attribute])) score += occupied * occupied;
      }
    }

    if ([5, 6, 9, 10].includes(index)) score += 2.5;
    if ([0, 3, 12, 15].includes(index)) score += 1.5;
    return score;
  }

  function choosePlacement(board, pieceId, level) {
    const open = emptyCells(board);
    if (!open.length) return null;

    const wins = winningPlacements(board, pieceId);
    const seesImmediateWin = level >= 4 || Math.random() < level / 10;
    if (wins.length && seesImmediateWin) return randomItem(wins);

    if (level <= 2 && Math.random() < 0.72) return randomItem(open);

    const ranked = open
      .map(index => ({ index, score: linePotential(board, index, pieceId) + Math.random() * (11 - level) }))
      .sort((a, b) => b.score - a.score);

    const candidateCount = level >= 9 ? 1 : level >= 6 ? 2 : level >= 3 ? 4 : ranked.length;
    return randomItem(ranked.slice(0, Math.max(1, candidateCount))).index;
  }

  function dangerCount(board, pieceId) {
    return winningPlacements(board, pieceId).length;
  }

  function choosePiece(board, remainingPieceIds, level) {
    if (!remainingPieceIds.length) return null;
    if (level <= 2 && Math.random() < 0.76) return window.QuartoPieces.getPiece(randomItem(remainingPieceIds));

    const ranked = remainingPieceIds.map(pieceId => {
      const danger = dangerCount(board, pieceId);
      const piece = window.QuartoPieces.getPiece(pieceId);
      let variety = 0;
      for (const placedId of board.filter(value => value !== null)) {
        const placed = window.QuartoPieces.getPiece(placedId);
        variety += ["tall", "round", "dark", "hole"].filter(attribute => placed[attribute] !== piece[attribute]).length;
      }
      return {
        piece,
        score: danger * 100 - variety * 0.08 + Math.random() * (11 - level)
      };
    }).sort((a, b) => a.score - b.score);

    const safe = ranked.filter(item => dangerCount(board, item.piece.id) === 0);
    const pool = safe.length ? safe : ranked;
    const candidateCount = level >= 8 ? 1 : level >= 5 ? 2 : level >= 3 ? 4 : pool.length;
    return randomItem(pool.slice(0, Math.max(1, candidateCount))).piece;
  }

  window.QuartoAI = { choosePlacement, choosePiece };
})();
