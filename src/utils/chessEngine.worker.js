/* ── Chess opponent ──────────────────────────────────────────────────────────
   Runs in a Web Worker so the page never freezes while it thinks.

   A plain alpha-beta search over chess.js move generation, with a quiescence
   search on captures so it does not blunder into obvious recaptures, MVV-LVA
   move ordering, and the well-known "simplified evaluation" piece-square
   tables. Depth is the difficulty. It is a friendly opponent, not Stockfish:
   it plays sound, sensible chess and can be beaten.

   Message in:  { fen, depth }
   Message out: { move }   (a SAN-free { from, to, promotion } object)       */

import { Chess } from 'chess.js'

const VALUE = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 }

// Piece-square tables from White's side, a8 first (index 0) to h1 (63).
const PST = {
  p: [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5,
      0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
  n: [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30,
      -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
  b: [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10,
      -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
  r: [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5,
      -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
  q: [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5,
      0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
  k: [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30,
      -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20],
}

/* Score from the side to move's point of view. */
function evaluate(game) {
  let score = 0
  const board = game.board()
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = board[r][f]
      if (!sq) continue
      const idx = sq.color === 'w' ? r * 8 + f : (7 - r) * 8 + f
      const v = VALUE[sq.type] + PST[sq.type][idx]
      score += sq.color === 'w' ? v : -v
    }
  }
  return game.turn() === 'w' ? score : -score
}

const MATE = 100000

function order(moves) {
  return moves.sort((a, b) =>
    ((b.captured ? VALUE[b.captured] * 10 - VALUE[b.piece] : 0) + (b.promotion ? 800 : 0)) -
    ((a.captured ? VALUE[a.captured] * 10 - VALUE[a.piece] : 0) + (a.promotion ? 800 : 0)))
}

function quiesce(game, alpha, beta, depth) {
  const stand = evaluate(game)
  if (stand >= beta) return beta
  if (alpha < stand) alpha = stand
  if (depth <= 0) return alpha
  for (const m of order(game.moves({ verbose: true }).filter((x) => x.captured))) {
    game.move(m)
    const s = -quiesce(game, -beta, -alpha, depth - 1)
    game.undo()
    if (s >= beta) return beta
    if (s > alpha) alpha = s
  }
  return alpha
}

function search(game, depth, alpha, beta, ply) {
  if (game.isCheckmate()) return -MATE + ply
  if (game.isDraw() || game.isStalemate()) return 0
  if (depth === 0) return quiesce(game, alpha, beta, 4)
  for (const m of order(game.moves({ verbose: true }))) {
    game.move(m)
    const s = -search(game, depth - 1, -beta, -alpha, ply + 1)
    game.undo()
    if (s >= beta) return beta
    if (s > alpha) alpha = s
  }
  return alpha
}

self.onmessage = ({ data: { fen, depth = 3 } }) => {
  const game = new Chess(fen)
  let best = null, bestScore = -Infinity
  const moves = order(game.moves({ verbose: true }))
  // A little variety between equally good moves, so games do not repeat.
  moves.sort(() => Math.random() - 0.5)
  for (const m of order(moves)) {
    game.move(m)
    const s = -search(game, depth - 1, -Infinity, -bestScore, 1)
    game.undo()
    if (s > bestScore) { bestScore = s; best = m }
  }
  self.postMessage({ move: best && { from: best.from, to: best.to, promotion: best.promotion } })
}
