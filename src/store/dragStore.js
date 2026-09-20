import { create } from 'zustand'

/* ── One drag in flight, wherever it started ───────────────────────────────
   A desktop icon drags by moving itself; a Finder row drags a translucent
   copy of itself under the cursor. Both need the same two answers — is a drag
   happening, and is the pointer over the Trash — so that lives here rather
   than in either of them. The dock reads `overTrash` to light its basket and
   to hold the Trash label open, which is what macOS does the moment a drag
   starts: the tooltip appears with no hover delay because you are no longer
   browsing, you are aiming.                                                 */

// macOS accepts a drop that lands near the basket, not only dead on it.
const SLOP = 12

/* Drop targets are found by attribute rather than registered, so a target can
   appear anywhere — the dock's basket, a pane inside Finder — without the
   drag knowing anything about it. First match wins. */
const TARGETS = [
  ['trash',   '[data-trash-tile]'],
  ['airdrop', '[data-airdrop-target]'],
]

function hitTarget(point) {
  for (const [name, selector] of TARGETS) {
    const el = document.querySelector(selector)
    if (!el) continue
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) continue          // present but not on screen
    if (
      point.x >= r.left - SLOP && point.x <= r.right  + SLOP &&
      point.y >= r.top  - SLOP && point.y <= r.bottom + SLOP
    ) return name
  }
  return null
}

const useDragStore = create((set, get) => ({
  /* The file being dragged: { id, name, kind, icon, size, origin }. */
  payload:   null,
  /* Pointer position, for hosts that draw their own ghost. */
  point:     null,
  /* Whether that pointer is currently over the dock's Trash. */
  overTrash: false,
  /* …or over an AirDrop target, wherever one happens to be mounted. */
  overAirDrop: false,
  /* True only for drags that draw the shared ghost (Finder rows). Desktop
     icons move themselves, so they opt out. */
  ghost:     false,

  begin: (payload, point, { ghost = false } = {}) =>
    set({ payload, point: point ?? null, overTrash: false, overAirDrop: false, ghost }),

  move: (point) => {
    if (!get().payload) return
    const hit = hitTarget(point)
    set({ point, overTrash: hit === 'trash', overAirDrop: hit === 'airdrop' })
  },

  /* Ends the drag and says what it landed on:
     `{ payload, target: 'trash' | 'airdrop' | null }`. */
  end: () => {
    const { payload, overTrash, overAirDrop } = get()
    const target = overTrash ? 'trash' : overAirDrop ? 'airdrop' : null
    set({ payload: null, point: null, overTrash: false, overAirDrop: false, ghost: false })
    return { payload, target }
  },

  cancel: () => set({
    payload: null, point: null, overTrash: false, overAirDrop: false, ghost: false,
  }),
}))

export default useDragStore
