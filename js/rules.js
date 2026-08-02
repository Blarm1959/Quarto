(function () {
  "use strict";

  const WINNING_LINES = [
    [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
    [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
    [0, 5, 10, 15],
    [3, 6, 9, 12]
  ];

  const ATTRIBUTE_TESTS = [
    { name: "Tall", matches: piece => piece.tall === true },
    { name: "Short", matches: piece => piece.tall === false },
    { name: "Round", matches: piece => piece.round === true },
    { name: "Square", matches: piece => piece.round === false },
    { name: "Dark", matches: piece => piece.dark === true },
    { name: "Light", matches: piece => piece.dark === false },
    { name: "Hole", matches: piece => piece.hole === true },
    { name: "Solid", matches: piece => piece.hole === false }
  ];

  function checkLine(board, line) {
    const pieceIds = line.map(index => board[index]);
    if (pieceIds.some(pieceId => pieceId === null || pieceId === undefined)) return null;
    const pieces = pieceIds.map(pieceId => window.QuartoPieces.getPiece(pieceId));
    if (pieces.some(piece => !piece)) return null;
    const attributes = ATTRIBUTE_TESTS.filter(test => pieces.every(test.matches)).map(test => test.name);
    return attributes.length ? { line: [...line], attributes } : null;
  }

  function checkForQuarto(board) {
    for (const line of WINNING_LINES) {
      const result = checkLine(board, line);
      if (result) return result;
    }
    return null;
  }

  window.QuartoRules = { WINNING_LINES, ATTRIBUTE_TESTS, checkLine, checkForQuarto };
})();
