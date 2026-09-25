import { create } from 'zustand'
import { Chess } from 'chess.js'

/* ── Chess game state ────────────────────────────────────────────────────────
   The game lives here, not in the window, so the menu bar's Game and Moves
   menus — where the real Chess app keeps New Game and Take Back Move — can
   act on it. The visitor plays White; the computer plays Black.           */

const useChessStore = create((set, get) => ({
  game: new Chess(),
  version: 0,            // bumped on every change so subscribers re-render
  gameNo: 1,
  thinking: false,
  hint: null,            // { from, to } while a hint is showing
  level: 3,              // search depth: 2 easy, 3 normal, 4 hard

  touch: () => set((s) => ({ version: s.version + 1 })),

  move: (m) => {
    const { game } = get()
    try { game.move(m) } catch { return false }
    set((s) => ({ version: s.version + 1, hint: null }))
    return true
  },
  setThinking: (thinking) => set({ thinking }),
  setHint: (hint) => set({ hint }),
  setLevel: (level) => set({ level }),

  /* Show Hint: ask the engine what it would play for White, and mark it. */
  showHint: () => {
    const { game, thinking } = get()
    if (thinking || game.turn() !== 'w' || game.isGameOver()) return
    const w = new Worker(new URL('../utils/chessEngine.worker.js', import.meta.url), { type: 'module' })
    const fen = game.fen()
    w.onmessage = ({ data }) => {
      w.terminate()
      if (get().game.fen() === fen && data.move) set({ hint: { from: data.move.from, to: data.move.to } })
    }
    w.postMessage({ fen, depth: 3 })
  },

  newGame: () => set((s) => ({ game: new Chess(), version: s.version + 1, gameNo: s.gameNo + 1, thinking: false, hint: null })),

  /* Take back the last full move — the computer's reply and the visitor's
     move before it — so it is the visitor's turn again. */
  takeBack: () => {
    const { game, thinking } = get()
    if (thinking) return
    game.undo()
    if (game.turn() === 'b') game.undo()
    set((s) => ({ version: s.version + 1, hint: null }))
  },
}))

export default useChessStore
