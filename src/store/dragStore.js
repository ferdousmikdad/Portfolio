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

function trashRect() {
  const el = document.querySelector('[data-trash-tile]')
  return el ? el.getBoundingClientRect() : null
}

function isOverTrash(point) {
  const r = trashRect()
  if (!r) return false
  return (
    point.x >= r.left - SLOP && point.x <= r.right  + SLOP &&
    point.y >= r.top  - SLOP && point.y <= r.bottom + SLOP
  )
}

const useDragStore = create((set, get) => ({
  /* The file being dragged: { id, name, kind, icon, size, origin }. */
  payload:   null,
  /* Pointer position, for hosts that draw their own ghost. */
  point:     null,
  /* Whether that pointer is currently over the dock's Trash. */
  overTrash: false,
  /* True only for drags that draw the shared ghost (Finder rows). Desktop
     icons move themselves, so they opt out. */
  ghost:     false,

  begin: (payload, point, { ghost = false } = {}) =>
    set({ payload, point: point ?? null, overTrash: false, ghost }),

  move: (point) => {
    if (!get().payload) return
    set({ point, overTrash: isOverTrash(point) })
  },

  /* Ends the drag and reports the payload if it was dropped on the Trash,
     so a caller can do `const hit = end(); if (hit) trashItem(hit)`. */
  end: () => {
    const { payload, overTrash } = get()
    set({ payload: null, point: null, overTrash: false, ghost: false })
    return overTrash ? payload : null
  },

  cancel: () => set({ payload: null, point: null, overTrash: false, ghost: false }),
}))

export default useDragStore
