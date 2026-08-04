(function () {
  "use strict";

  const WINNING_LINES = [
    [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
    [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
    [0, 5, 10, 15], [3, 6, 9, 12]
  ];

  const WINNING_SQUARES = [
    [0, 1, 4, 5], [1, 2, 5, 6], [2, 3, 6, 7],
    [4, 5, 8, 9], [5, 6, 9, 10], [6, 7, 10, 11],
    [8, 9, 12, 13], [9, 10, 13, 14], [10, 11, 14, 15]
  ];

  const FEATURES = [
    {
      key: "colour",
      tests: [
        { name: "Dark", matches: piece => piece.dark === true },
        { name: "Light", matches: piece => piece.dark === false }
      ]
    },
    {
      key: "height",
      tests: [
        { name: "Tall", matches: piece => piece.tall === true },
        { name: "Short", matches: piece => piece.tall === false }
      ]
    },
    {
      key: "shape",
      tests: [
        { name: "Round", matches: piece => piece.round === true },
        { name: "Square", matches: piece => piece.round === false }
      ]
    },
    {
      key: "hollow",
      tests: [
        { name: "Hole", matches: piece => piece.hole === true },
        { name: "Solid", matches: piece => piece.hole === false }
      ]
    }
  ];

  let configuration = { winningFeatures: 4, allow2x2: false };

  function configure(options = {}) {
    configuration = {
      winningFeatures: Math.max(1, Math.min(4, Number(options.winningFeatures) || 4)),
      allow2x2: options.allow2x2 === true
    };
    return getConfiguration();
  }

  function getConfiguration() {
    return { ...configuration };
  }

  function getActiveFeatures() {
    return FEATURES.slice(0, configuration.winningFeatures);
  }

  function getActiveBitMask() {
    // Piece IDs encode: tall=8, round=4, dark=2, hole=1.
    const masks = [2, 8, 4, 1];
    return masks.slice(0, configuration.winningFeatures).reduce((mask, bit) => mask | bit, 0);
  }

  function getWinningPatterns() {
    return configuration.allow2x2 ? [...WINNING_LINES, ...WINNING_SQUARES] : WINNING_LINES;
  }

  function checkLine(board, line) {
    const pieceIds = line.map(index => board[index]);
    if (pieceIds.some(pieceId => pieceId === null || pieceId === undefined)) return null;
    const pieces = pieceIds.map(pieceId => window.QuartoPieces.getPiece(pieceId));
    if (pieces.some(piece => !piece)) return null;
    const attributes = getActiveFeatures()
      .flatMap(feature => feature.tests)
      .filter(test => pieces.every(test.matches))
      .map(test => test.name);
    return attributes.length ? {
      line: [...line],
      attributes,
      pattern: WINNING_SQUARES.some(square => square.every((cell, index) => cell === line[index])) ? "square" : "line"
    } : null;
  }

  function checkForQuarto(board) {
    for (const line of getWinningPatterns()) {
      const result = checkLine(board, line);
      if (result) return result;
    }
    return null;
  }

  window.QuartoRules = {
    WINNING_LINES, WINNING_SQUARES, FEATURES,
    configure, getConfiguration, getActiveFeatures, getActiveBitMask, getWinningPatterns,
    checkLine, checkForQuarto
  };
})();
