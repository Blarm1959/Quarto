"use strict";

const fs = require("fs");
const vm = require("vm");
const path = require("path");

const root = path.resolve(__dirname, "..");
const context = {
  window: {},
  console,
  performance: { now: () => Date.now() },
  Math,
  Date,
  setTimeout,
  clearTimeout
};
context.window.window = context.window;
vm.createContext(context);
for (const file of ["js/pieces.js", "js/rules.js", "js/ai.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
}

const { QuartoAI, QuartoRules } = context.window;
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function remainingFor(board, currentPiece = null) {
  const used = new Set(board.filter(id => id !== null));
  if (currentPiece !== null) used.add(currentPiece);
  return Array.from({ length: 16 }, (_, id) => id).filter(id => !used.has(id));
}

// Immediate win: pieces 0, 1, 2 share short, square and blue; piece 3 wins at cell 3.
{
  const board = [0, 1, 2, null, ...Array(12).fill(null)];
  const remaining = remainingFor(board, 3);
  for (const level of [4, 7, 10]) {
    const move = QuartoAI.choosePlacement(board, 3, level, remaining);
    assert(move === 3, `Level ${level} missed an immediate win (picked ${move})`);
  }
}

// Safe gift: only ensure strong AI never hands over a piece with an immediate winning square
// when a safe alternative exists.
{
  const board = [0, 1, 2, null, ...Array(12).fill(null)];
  const remaining = remainingFor(board);
  const safeExists = remaining.some(id => QuartoAI.winningPlacements(board, id).length === 0);
  assert(safeExists, "Test position must contain at least one safe gift");
  for (const level of [6, 8, 10]) {
    const piece = QuartoAI.choosePiece(board, remaining, level);
    assert(piece && remaining.includes(piece.id), `Level ${level} returned an illegal gift`);
    assert(QuartoAI.winningPlacements(board, piece.id).length === 0, `Level ${level} handed over an immediate winning piece`);
  }
}


// Tactical placement: strong levels must not choose a square that leaves every
// remaining piece as an immediate winning gift when safer placements exist.
{
  const board = [4, null, 14, 2, null, 12, 6, 15, 10, 9, null, null, null, null, null, null];
  const current = 3;
  const remaining = [7, 1, 5, 0, 8, 11, 13];
  for (const level of [5, 6, 7, 8, 9, 10]) {
    const move = QuartoAI.choosePlacement(board, current, level, remaining);
    const nextBoard = [...board];
    nextBoard[move] = current;
    const danger = QuartoAI._test.dangerSummary(nextBoard, remaining);
    assert(danger.dangerousPieces < remaining.length,
      `Level ${level} chose a forced-loss placement at ${move}`);
  }
}

// Legality over a set of deterministic mid-game positions.
{
  const positions = [
    [0, null, 5, null, null, 10, null, null, null, null, 15, null, null, null, null, null],
    [0, 6, null, null, 9, null, 3, null, null, 12, null, null, null, null, null, null],
    [null, 1, null, 14, 4, null, null, null, null, 11, null, null, 8, null, null, null]
  ];
  for (const board of positions) {
    const available = remainingFor(board);
    const current = available[0];
    const remaining = available.slice(1);
    for (let level = 1; level <= 10; level += 1) {
      const move = QuartoAI.choosePlacement(board, current, level, remaining);
      assert(Number.isInteger(move) && board[move] === null, `Level ${level} returned illegal placement ${move}`);
      const gift = QuartoAI.choosePiece(board, available, level);
      assert(gift && available.includes(gift.id), `Level ${level} returned illegal gift`);
    }
  }
}

// Rules regression: known winning and non-winning lines.
{
  const winBoard = [0, 1, 2, 3, ...Array(12).fill(null)];
  assert(Boolean(QuartoRules.checkForQuarto(winBoard)), "Known Quarto line was not detected");
  const noWin = [0, 7, 10, 13, ...Array(12).fill(null)];
  assert(!QuartoRules.checkForQuarto(noWin), "False Quarto detected");
}

console.log("AI and rules tests passed.");
