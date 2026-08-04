(function () {
  "use strict";

  const ATTRIBUTES = ["tall", "round", "dark", "hole"];
  const CENTRES = new Set([5, 6, 9, 10]);
  const CORNERS = new Set([0, 3, 12, 15]);
  const WIN_SCORE = 1000000;
  const DRAW_SCORE = 0;

  function now() {
    return typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
  }

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function shuffled(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const other = Math.floor(Math.random() * (index + 1));
      [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
  }

  function emptyCells(board) {
    const result = [];
    for (let index = 0; index < board.length; index += 1) {
      if (board[index] === null) result.push(index);
    }
    return result;
  }

  function isWinningBoard(board) {
    return Boolean(window.QuartoRules.checkForQuarto(board));
  }

  function winningPlacements(board, pieceId) {
    return emptyCells(board).filter(index => {
      const testBoard = [...board];
      testBoard[index] = pieceId;
      return isWinningBoard(testBoard);
    });
  }

  function pieceBits(pieceId) {
    return Number(pieceId) & 15;
  }

  function commonAttributeCount(pieceIds) {
    if (!pieceIds.length) return 0;
    let allOnes = 15;
    let allZeroes = 15;
    for (const id of pieceIds) {
      const bits = pieceBits(id);
      allOnes &= bits;
      allZeroes &= (~bits) & 15;
    }
    let mask = allOnes | allZeroes;
    let count = 0;
    while (mask) {
      count += mask & 1;
      mask >>= 1;
    }
    return count;
  }

  function lineStrength(board) {
    let score = 0;
    for (const line of window.QuartoRules.WINNING_LINES) {
      const ids = line.map(index => board[index]).filter(id => id !== null);
      if (!ids.length || ids.length === 4) continue;
      const common = commonAttributeCount(ids);
      if (!common) continue;
      const occupied = ids.length;
      const weight = occupied === 3 ? 95 : occupied === 2 ? 16 : 2;
      score += common * weight;
    }
    return score;
  }

  function positionalBonus(index) {
    if (CENTRES.has(index)) return 8;
    if (CORNERS.has(index)) return 3;
    return 1;
  }

  function dangerSummary(board, remainingPieceIds) {
    let dangerousPieces = 0;
    let winningSquares = 0;
    for (const pieceId of remainingPieceIds) {
      const count = winningPlacements(board, pieceId).length;
      if (count > 0) dangerousPieces += 1;
      winningSquares += count;
    }
    return { dangerousPieces, winningSquares };
  }

  function tacticalSafetyScore(summary, totalPieces) {
    const safePieces = Math.max(0, totalPieces - summary.dangerousPieces);
    if (totalPieces > 0 && safePieces === 0) {
      return -250000 - summary.winningSquares * 250;
    }
    return safePieces * 220 - summary.dangerousPieces * 165 - summary.winningSquares * 42;
  }

  function pieceVariety(board, pieceId) {
    const piece = window.QuartoPieces.getPiece(pieceId);
    let score = 0;
    for (const placedId of board) {
      if (placedId === null) continue;
      const placed = window.QuartoPieces.getPiece(placedId);
      for (const attribute of ATTRIBUTES) {
        if (placed[attribute] !== piece[attribute]) score += 1;
      }
    }
    return score;
  }

  function difficultyProfile(level) {
    const clamped = Math.max(1, Math.min(10, Number(level) || 1));
    const profiles = {
      1: { depth: 0, timeMs: 25, nodes: 1500, winChance: .45, safeChance: .25, errorRate: .38, nearBest: 130 },
      2: { depth: 0, timeMs: 35, nodes: 2500, winChance: .68, safeChance: .45, errorRate: .27, nearBest: 95 },
      3: { depth: 1, timeMs: 55, nodes: 5000, winChance: .90, safeChance: .72, errorRate: .17, nearBest: 65 },
      4: { depth: 1, timeMs: 90, nodes: 10000, winChance: 1, safeChance: .88, errorRate: .10, nearBest: 42 },
      5: { depth: 2, timeMs: 150, nodes: 24000, winChance: 1, safeChance: 1, errorRate: .05, nearBest: 24 },
      6: { depth: 2, timeMs: 240, nodes: 50000, winChance: 1, safeChance: 1, errorRate: .02, nearBest: 14 },
      7: { depth: 3, timeMs: 380, nodes: 100000, winChance: 1, safeChance: 1, errorRate: 0, nearBest: 8 },
      8: { depth: 4, timeMs: 650, nodes: 220000, winChance: 1, safeChance: 1, errorRate: 0, nearBest: 3 },
      9: { depth: 5, timeMs: 1100, nodes: 500000, winChance: 1, safeChance: 1, errorRate: 0, nearBest: 0 },
      10: { depth: 6, timeMs: 1800, nodes: 1000000, winChance: 1, safeChance: 1, errorRate: 0, nearBest: 0 }
    };
    return { level: clamped, ...profiles[clamped] };
  }

  function createContext(profile, emptyCount) {
    let maxDepth = profile.depth;
    if (profile.level >= 8 && emptyCount <= 7) maxDepth = emptyCount;
    if (profile.level >= 9 && emptyCount <= 8) maxDepth = emptyCount;
    return {
      profile,
      maxDepth,
      nodes: 0,
      maxNodes: profile.nodes,
      deadline: now() + profile.timeMs,
      aborted: false,
      memo: new Map(),
      bestCompletedDepth: 0
    };
  }

  function shouldAbort(context) {
    context.nodes += 1;
    if (context.nodes > context.maxNodes || now() >= context.deadline) {
      context.aborted = true;
      return true;
    }
    return false;
  }

  function boardKey(board, remainingPieceIds, pieceId, depth) {
    const boardPart = board.map(value => value === null ? "_" : value.toString(16)).join("");
    const piecesPart = [...remainingPieceIds].sort((a, b) => a - b).map(id => id.toString(16)).join("");
    return `${boardPart}|${piecesPart}|${Number(pieceId).toString(16)}|${depth}`;
  }

  function staticScore(board, remainingPieceIds, pieceId) {
    const immediate = winningPlacements(board, pieceId).length;
    if (immediate) return 150000 + immediate * 5000;

    let best = -Infinity;
    for (const index of emptyCells(board)) {
      const nextBoard = [...board];
      nextBoard[index] = pieceId;
      const danger = dangerSummary(nextBoard, remainingPieceIds);
      const score = lineStrength(nextBoard)
        + positionalBonus(index)
        + tacticalSafetyScore(danger, remainingPieceIds.length);
      if (score > best) best = score;
    }
    return Number.isFinite(best) ? best : DRAW_SCORE;
  }

  function orderedPlacements(board, pieceId) {
    return emptyCells(board)
      .map(index => {
        const nextBoard = [...board];
        nextBoard[index] = pieceId;
        return {
          index,
          immediateWin: isWinningBoard(nextBoard),
          order: lineStrength(nextBoard) + positionalBonus(index)
        };
      })
      .sort((a, b) => Number(b.immediateWin) - Number(a.immediateWin) || b.order - a.order);
  }

  function orderedGifts(board, remainingPieceIds) {
    return remainingPieceIds
      .map(pieceId => {
        const wins = winningPlacements(board, pieceId).length;
        return { pieceId, wins, variety: pieceVariety(board, pieceId) };
      })
      .sort((a, b) => a.wins - b.wins || b.variety - a.variety);
  }

  // Returns the score for the player who must place pieceId now. A complete
  // turn is modelled: place the supplied piece, then choose the opponent's
  // next piece. The opponent's result is negated (negamax).
  function search(board, remainingPieceIds, pieceId, depth, alpha, beta, context) {
    if (shouldAbort(context)) return staticScore(board, remainingPieceIds, pieceId);

    const key = boardKey(board, remainingPieceIds, pieceId, depth);
    const cached = context.memo.get(key);
    if (cached !== undefined) return cached;

    const open = emptyCells(board);
    if (!open.length) return DRAW_SCORE;

    const wins = winningPlacements(board, pieceId);
    if (wins.length) return WIN_SCORE + open.length * 100 + depth;
    if (depth <= 0) return staticScore(board, remainingPieceIds, pieceId);

    let best = -Infinity;
    const placements = orderedPlacements(board, pieceId);

    for (const placement of placements) {
      const nextBoard = [...board];
      nextBoard[placement.index] = pieceId;

      if (!remainingPieceIds.length) {
        best = Math.max(best, DRAW_SCORE);
      } else {
        let bestTurn = -Infinity;
        for (const gift of orderedGifts(nextBoard, remainingPieceIds)) {
          const nextRemaining = remainingPieceIds.filter(id => id !== gift.pieceId);
          const value = -search(nextBoard, nextRemaining, gift.pieceId, depth - 1, -beta, -alpha, context);
          if (value > bestTurn) bestTurn = value;
          if (bestTurn > alpha) alpha = bestTurn;
          if (alpha >= beta || context.aborted) break;
        }
        const strategic = lineStrength(nextBoard) * .035 + positionalBonus(placement.index) * .1;
        best = Math.max(best, bestTurn + strategic);
      }

      if (best > alpha) alpha = best;
      if (alpha >= beta || context.aborted) break;
    }

    if (!context.aborted) context.memo.set(key, best);
    return best;
  }

  function evaluatePlacementsAtDepth(board, pieceId, remainingPieceIds, depth, context) {
    const results = [];
    for (const placement of orderedPlacements(board, pieceId)) {
      const nextBoard = [...board];
      nextBoard[placement.index] = pieceId;
      if (placement.immediateWin) {
        results.push({ index: placement.index, score: WIN_SCORE + depth });
        continue;
      }

      let score;
      if (!remainingPieceIds.length) {
        score = DRAW_SCORE;
      } else if (depth <= 0) {
        const danger = dangerSummary(nextBoard, remainingPieceIds);
        score = lineStrength(nextBoard) + positionalBonus(placement.index)
          + tacticalSafetyScore(danger, remainingPieceIds.length);
      } else {
        score = -Infinity;
        for (const gift of orderedGifts(nextBoard, remainingPieceIds)) {
          const nextRemaining = remainingPieceIds.filter(id => id !== gift.pieceId);
          const value = -search(nextBoard, nextRemaining, gift.pieceId, depth - 1, -Infinity, Infinity, context);
          if (value > score) score = value;
          if (context.aborted) break;
        }
        score += lineStrength(nextBoard) * .04 + positionalBonus(placement.index) * .15;
      }
      results.push({ index: placement.index, score });
      if (context.aborted) break;
    }
    return results.sort((a, b) => b.score - a.score);
  }

  function evaluateGiftsAtDepth(board, remainingPieceIds, depth, context) {
    const results = [];
    for (const gift of orderedGifts(board, remainingPieceIds)) {
      const nextRemaining = remainingPieceIds.filter(id => id !== gift.pieceId);
      let score;
      if (depth <= 0) {
        score = -gift.wins * 10000 + gift.variety * .4;
      } else {
        score = -search(board, nextRemaining, gift.pieceId, depth, -Infinity, Infinity, context);
      }
      results.push({ pieceId: gift.pieceId, danger: gift.wins, score });
      if (context.aborted) break;
    }
    return results.sort((a, b) => b.score - a.score || a.danger - b.danger);
  }

  function iterativePlacementSearch(board, pieceId, remainingPieceIds, profile) {
    const context = createContext(profile, emptyCells(board).length);
    let bestResults = evaluatePlacementsAtDepth(board, pieceId, remainingPieceIds, 0, context);
    context.aborted = false;

    for (let depth = 1; depth <= context.maxDepth; depth += 1) {
      const before = context.nodes;
      const results = evaluatePlacementsAtDepth(board, pieceId, remainingPieceIds, depth, context);
      if (context.aborted || !results.length) break;
      bestResults = results;
      context.bestCompletedDepth = depth;
      if (Math.abs(results[0].score) >= WIN_SCORE) break;
      if (context.nodes === before) break;
    }
    return { results: bestResults, context };
  }

  function iterativeGiftSearch(board, remainingPieceIds, profile) {
    const context = createContext(profile, emptyCells(board).length);
    let bestResults = evaluateGiftsAtDepth(board, remainingPieceIds, 0, context);
    context.aborted = false;

    for (let depth = 1; depth <= context.maxDepth; depth += 1) {
      const results = evaluateGiftsAtDepth(board, remainingPieceIds, depth, context);
      if (context.aborted || !results.length) break;
      bestResults = results;
      context.bestCompletedDepth = depth;
    }
    return { results: bestResults, context };
  }

  function chooseWithDifficulty(results, profile, key) {
    if (!results.length) return null;
    if (profile.errorRate > 0 && Math.random() < profile.errorRate) {
      const poolSize = Math.min(results.length, profile.level <= 2 ? 5 : 3);
      return randomItem(results.slice(0, poolSize))[key];
    }

    const bestScore = results[0].score;
    const nearBest = results.filter(item => bestScore - item.score <= profile.nearBest);
    if (nearBest.length <= 1 || profile.level >= 9) return results[0][key];
    return randomItem(nearBest)[key];
  }

  function choosePlacement(board, pieceId, level, remainingPieceIds) {
    const open = emptyCells(board);
    if (!open.length) return null;
    const profile = difficultyProfile(level);
    const wins = winningPlacements(board, pieceId);

    if (wins.length) {
      if (Math.random() < profile.winChance) return randomItem(wins);
      return randomItem(open);
    }

    const remaining = Array.isArray(remainingPieceIds)
      ? [...remainingPieceIds]
      : window.QuartoPieces.PIECES.map(piece => piece.id).filter(id => id !== pieceId && !board.includes(id));

    const searchResult = iterativePlacementSearch(board, pieceId, remaining, profile);
    return chooseWithDifficulty(searchResult.results, profile, "index");
  }

  function choosePiece(board, remainingPieceIds, level) {
    if (!remainingPieceIds.length) return null;
    const profile = difficultyProfile(level);
    const ordered = orderedGifts(board, remainingPieceIds);
    const safe = ordered.filter(item => item.wins === 0);

    if (safe.length && profile.depth === 0 && Math.random() < profile.safeChance) {
      return window.QuartoPieces.getPiece(randomItem(safe.slice(0, Math.min(safe.length, 4))).pieceId);
    }

    if (profile.level <= 2 && Math.random() > profile.safeChance) {
      return window.QuartoPieces.getPiece(randomItem(remainingPieceIds));
    }

    const searchResult = iterativeGiftSearch(board, remainingPieceIds, profile);
    const pieceId = chooseWithDifficulty(searchResult.results, profile, "pieceId");
    return pieceId === null ? null : window.QuartoPieces.getPiece(pieceId);
  }

  window.QuartoAI = {
    choosePlacement,
    choosePiece,
    winningPlacements,
    difficultyProfile,
    _test: {
      emptyCells,
      lineStrength,
      dangerSummary,
      tacticalSafetyScore,
      search,
      iterativePlacementSearch,
      iterativeGiftSearch
    }
  };
})();
