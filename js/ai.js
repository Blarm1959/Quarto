(function () {
  "use strict";

  const ATTRIBUTES = ["tall", "round", "dark", "hole"];
  const CENTRES = new Set([5, 6, 9, 10]);
  const CORNERS = new Set([0, 3, 12, 15]);
  const WIN_SCORE = 100000;

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

  function linePotential(board, index, pieceId) {
    const testBoard = [...board];
    testBoard[index] = pieceId;
    const piece = window.QuartoPieces.getPiece(pieceId);
    let score = 0;

    for (const line of window.QuartoRules.WINNING_LINES) {
      if (!line.includes(index)) continue;
      const pieces = line
        .map(cell => testBoard[cell])
        .filter(value => value !== null)
        .map(value => window.QuartoPieces.getPiece(value));
      if (!pieces.length) continue;

      for (const attribute of ATTRIBUTES) {
        const same = pieces.every(other => other[attribute] === pieces[0][attribute]);
        if (same) score += pieces.length * pieces.length * 1.8;
      }
    }

    if (CENTRES.has(index)) score += 3;
    if (CORNERS.has(index)) score += 1.5;
    return score;
  }

  function placementRisk(boardAfterPlacement, remainingPieceIds) {
    let dangerousPieces = 0;
    let totalWinningSquares = 0;
    for (const pieceId of remainingPieceIds) {
      const count = winningPlacements(boardAfterPlacement, pieceId).length;
      if (count) dangerousPieces += 1;
      totalWinningSquares += count;
    }
    return dangerousPieces * 30 + totalWinningSquares * 8;
  }

  function pieceVariety(board, pieceId) {
    const piece = window.QuartoPieces.getPiece(pieceId);
    let score = 0;
    for (const placedId of board) {
      if (placedId === null) continue;
      const placed = window.QuartoPieces.getPiece(placedId);
      score += ATTRIBUTES.filter(attribute => placed[attribute] !== piece[attribute]).length;
    }
    return score;
  }

  function difficultyProfile(level) {
    const clamped = Math.max(1, Math.min(10, Number(level) || 1));
    const profiles = {
      1: { winChance: .35, safeChance: .20, searchDepth: 0, nodes: 0, candidates: 10 },
      2: { winChance: .60, safeChance: .38, searchDepth: 0, nodes: 0, candidates: 8 },
      3: { winChance: .85, safeChance: .62, searchDepth: 0, nodes: 0, candidates: 6 },
      4: { winChance: 1, safeChance: .82, searchDepth: 0, nodes: 0, candidates: 4 },
      5: { winChance: 1, safeChance: 1, searchDepth: 1, nodes: 12000, candidates: 3 },
      6: { winChance: 1, safeChance: 1, searchDepth: 1, nodes: 24000, candidates: 2 },
      7: { winChance: 1, safeChance: 1, searchDepth: 2, nodes: 45000, candidates: 2 },
      8: { winChance: 1, safeChance: 1, searchDepth: 2, nodes: 90000, candidates: 1 },
      9: { winChance: 1, safeChance: 1, searchDepth: 3, nodes: 180000, candidates: 1 },
      10: { winChance: 1, safeChance: 1, searchDepth: 4, nodes: 320000, candidates: 1 }
    };
    return { level: clamped, ...profiles[clamped] };
  }

  function createSearchContext(profile, emptyCount) {
    let depth = profile.searchDepth;
    if (profile.level >= 9 && emptyCount <= 7) depth = emptyCount;
    if (profile.level === 10 && emptyCount <= 8) depth = emptyCount;
    return {
      depth,
      nodes: 0,
      maxNodes: profile.nodes,
      deadline: performance.now() + (profile.level >= 9 ? 700 : profile.level >= 7 ? 350 : 180),
      memo: new Map(),
      aborted: false
    };
  }

  function boardKey(board, remainingPieceIds, pieceId, depth) {
    return `${board.map(value => value === null ? "_" : value.toString(16)).join("")}|${remainingPieceIds.map(id => id.toString(16)).join("")}|${pieceId.toString(16)}|${depth}`;
  }

  function shouldAbort(context) {
    context.nodes += 1;
    if (context.nodes > context.maxNodes || performance.now() > context.deadline) {
      context.aborted = true;
      return true;
    }
    return false;
  }

  function staticPositionScore(board, remainingPieceIds, pieceId) {
    const wins = winningPlacements(board, pieceId);
    if (wins.length) return 4500 + wins.length * 500;

    let best = -Infinity;
    for (const index of emptyCells(board)) {
      const after = [...board];
      after[index] = pieceId;
      const risk = placementRisk(after, remainingPieceIds);
      best = Math.max(best, linePotential(board, index, pieceId) - risk * .35);
    }
    return Number.isFinite(best) ? best : 0;
  }

  // Negamax over complete Quarto turns: place the supplied piece, then choose
  // the piece the opponent must place. This models both strategic decisions.
  function search(board, remainingPieceIds, pieceId, depth, alpha, beta, context) {
    if (shouldAbort(context)) return staticPositionScore(board, remainingPieceIds, pieceId);

    const key = boardKey(board, remainingPieceIds, pieceId, depth);
    const cached = context.memo.get(key);
    if (cached !== undefined) return cached;

    const open = emptyCells(board);
    if (!open.length) return 0;

    const immediateWins = winningPlacements(board, pieceId);
    if (immediateWins.length) return WIN_SCORE + depth * 100 + open.length;
    if (depth <= 0) return staticPositionScore(board, remainingPieceIds, pieceId);

    let best = -Infinity;
    const placements = open
      .map(index => ({ index, score: linePotential(board, index, pieceId) }))
      .sort((a, b) => b.score - a.score);

    for (const placement of placements) {
      const nextBoard = [...board];
      nextBoard[placement.index] = pieceId;
      if (!remainingPieceIds.length) {
        best = Math.max(best, 0);
        continue;
      }

      const gifts = remainingPieceIds
        .map(id => ({ id, danger: winningPlacements(nextBoard, id).length, variety: pieceVariety(nextBoard, id) }))
        .sort((a, b) => a.danger - b.danger || b.variety - a.variety);

      let bestGift = -Infinity;
      for (const gift of gifts) {
        const nextRemaining = remainingPieceIds.filter(id => id !== gift.id);
        const score = -search(nextBoard, nextRemaining, gift.id, depth - 1, -beta, -alpha, context);
        bestGift = Math.max(bestGift, score);
        alpha = Math.max(alpha, score);
        if (alpha >= beta || context.aborted) break;
      }
      best = Math.max(best, bestGift + placement.score * .04);
      alpha = Math.max(alpha, best);
      if (alpha >= beta || context.aborted) break;
    }

    context.memo.set(key, best);
    return best;
  }

  function searchPlacement(board, pieceId, remainingPieceIds, profile) {
    const context = createSearchContext(profile, emptyCells(board).length);
    const candidates = [];

    for (const index of emptyCells(board)) {
      const nextBoard = [...board];
      nextBoard[index] = pieceId;
      if (isWinningBoard(nextBoard)) return { index, score: WIN_SCORE, context };

      let score;
      if (!remainingPieceIds.length || context.depth <= 0) {
        score = linePotential(board, index, pieceId) - placementRisk(nextBoard, remainingPieceIds);
      } else {
        let bestGift = -Infinity;
        const gifts = remainingPieceIds
          .map(id => ({ id, danger: winningPlacements(nextBoard, id).length }))
          .sort((a, b) => a.danger - b.danger);
        for (const gift of gifts) {
          const nextRemaining = remainingPieceIds.filter(id => id !== gift.id);
          const value = -search(nextBoard, nextRemaining, gift.id, context.depth - 1, -Infinity, Infinity, context);
          bestGift = Math.max(bestGift, value);
          if (context.aborted) break;
        }
        score = bestGift + linePotential(board, index, pieceId) * .05;
      }
      candidates.push({ index, score });
      if (context.aborted) break;
    }

    candidates.sort((a, b) => b.score - a.score);
    return { ...(candidates[0] || { index: null, score: 0 }), context };
  }

  function searchGift(board, remainingPieceIds, profile) {
    const context = createSearchContext(profile, emptyCells(board).length);
    const candidates = [];

    for (const pieceId of remainingPieceIds) {
      const danger = winningPlacements(board, pieceId).length;
      let score;
      if (context.depth <= 0) {
        score = -danger * 1000 + pieceVariety(board, pieceId) * .15;
      } else {
        const nextRemaining = remainingPieceIds.filter(id => id !== pieceId);
        score = -search(board, nextRemaining, pieceId, context.depth, -Infinity, Infinity, context);
      }
      candidates.push({ pieceId, danger, score });
      if (context.aborted) break;
    }

    candidates.sort((a, b) => b.score - a.score || a.danger - b.danger);
    return { ...(candidates[0] || { pieceId: null, score: 0 }), context };
  }

  function choosePlacement(board, pieceId, level, remainingPieceIds) {
    const open = emptyCells(board);
    if (!open.length) return null;
    const profile = difficultyProfile(level);
    const wins = winningPlacements(board, pieceId);

    if (wins.length && Math.random() < profile.winChance) return randomItem(wins);
    if (profile.level <= 2 && Math.random() > profile.safeChance) return randomItem(open);

    const remaining = Array.isArray(remainingPieceIds)
      ? [...remainingPieceIds]
      : window.QuartoPieces.PIECES.map(piece => piece.id).filter(id => id !== pieceId && !board.includes(id));

    if (profile.searchDepth > 0) {
      const result = searchPlacement(board, pieceId, remaining, profile);
      if (result.index !== null) return result.index;
    }

    const ranked = open
      .map(index => {
        const nextBoard = [...board];
        nextBoard[index] = pieceId;
        return {
          index,
          score: linePotential(board, index, pieceId) - placementRisk(nextBoard, remaining) * (profile.level >= 5 ? 1 : .35) + Math.random() * (11 - profile.level) * 3
        };
      })
      .sort((a, b) => b.score - a.score);

    return randomItem(ranked.slice(0, Math.max(1, profile.candidates))).index;
  }

  function choosePiece(board, remainingPieceIds, level) {
    if (!remainingPieceIds.length) return null;
    const profile = difficultyProfile(level);

    if (profile.level <= 2 && Math.random() > profile.safeChance) {
      return window.QuartoPieces.getPiece(randomItem(remainingPieceIds));
    }

    const analysed = remainingPieceIds.map(pieceId => ({
      pieceId,
      danger: winningPlacements(board, pieceId).length,
      variety: pieceVariety(board, pieceId)
    }));
    const safe = analysed.filter(item => item.danger === 0);

    if (safe.length && Math.random() < profile.safeChance && profile.searchDepth === 0) {
      safe.sort((a, b) => b.variety - a.variety);
      const choice = randomItem(safe.slice(0, Math.max(1, profile.candidates)));
      return window.QuartoPieces.getPiece(choice.pieceId);
    }

    if (profile.searchDepth > 0) {
      const result = searchGift(board, remainingPieceIds, profile);
      if (result.pieceId !== null) return window.QuartoPieces.getPiece(result.pieceId);
    }

    analysed.sort((a, b) => a.danger - b.danger || b.variety - a.variety);
    const pool = analysed.slice(0, Math.max(1, profile.candidates));
    return window.QuartoPieces.getPiece(randomItem(pool).pieceId);
  }

  window.QuartoAI = {
    choosePlacement,
    choosePiece,
    winningPlacements,
    difficultyProfile
  };
})();
