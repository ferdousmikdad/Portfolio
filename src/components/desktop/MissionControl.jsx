import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useWindowStore from '@/store/windowStore'
import { neutralise } from '@/utils/windowSnapshots'
import { hydrateFrames } from '@/utils/genie'
import windowIcon from '@/data/windowIcons'
import TOOLS from '@/data/tools'

/* ── Mission Control ───────────────────────────────────────────────────────
   Every open window pulls back into a grid that does not overlap, and a
   click sends you into one.

   The tiles are DOM clones of the live windows, the same trick the dock's
   minimised thumbnails already use (`windowSnapshots`) — there is no canvas
   library here to rasterise with, and the app's own stylesheet still matches
   the cloned classes, so a clone renders exactly as the window looked.

   The zoom is a FLIP: each tile starts life at its window's real screen rect
   and animates to its slot, so the windows appear to pull back rather than
   cross-fade into a different layout. Exit runs the same thing backwards,
   which is what makes it feel attached to the desktop.                    */

/* A tool window is registered with `title: id` and renamed at render time by
   ToolWindow, so the store's title is the raw id for those. Everything else
   carries a real title, and for a document window that title (`about_me.txt`)
   is exactly what Mission Control should label it with. */
function labelFor(win) {
  if (win.title && win.title !== win.id) return win.title
  return TOOLS.find((t) => t.id === win.id)?.name ?? win.title ?? win.id
}

const TOPBAR = 28
const PAD = 56          // breathing room around the whole grid
const GAP = 26          // between tiles
const LABEL = 30        // room under each tile for its name

function Tile({ win, rect, slot, onPick }) {
  const hostRef = useRef(null)

  useLayoutEffect(() => {
    const host = hostRef.current
    const live = document.querySelector(`[data-window="${win.id}"]`)
    if (!host || !live) return
    const copy = neutralise(live.cloneNode(true), { width: rect.width, height: rect.height })
    host.replaceChildren(copy)
    // A tool's iframe cannot survive the clone; the same helper the dock uses
    // puts a live frame back where the copy came out blank.
    hydrateFrames(copy)
    return () => host.replaceChildren()
  }, [win.id, rect.width, rect.height])

  return (
    <motion.button
      type="button"
      className="mc-tile"
      style={{ width: rect.width, height: rect.height, transformOrigin: 'top left' }}
      initial={{ x: rect.left, y: rect.top, scale: 1, opacity: 1 }}
      animate={{ x: slot.x, y: slot.y, scale: slot.scale, opacity: 1 }}
      exit={{ x: rect.left, y: rect.top, scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      onClick={() => onPick(win.id)}
    >
      <span className="mc-tile__shot" ref={hostRef} />
      <span className="mc-tile__hit" />
      <span
        className="mc-tile__name"
        /* Undo the tile's scale so every label is the same size on screen,
           the way macOS labels them. */
        style={{ transform: `scale(${1 / slot.scale})`, transformOrigin: 'top center' }}
      >
        <img src={windowIcon(win.id)} alt="" width={16} height={16} draggable={false} />
        {labelFor(win)}
      </span>
    </motion.button>
  )
}

export default function MissionControl() {
  const open = useWindowStore((s) => s.missionControl)
  const close = useWindowStore((s) => s.closeMissionControl)
  const toggle = useWindowStore((s) => s.toggleMissionControl)
  const windows = useWindowStore((s) => s.windows)
  const focusWindow = useWindowStore((s) => s.focusWindow)

  const [layout, setLayout] = useState(null)

  // F3 and Escape. F3 is the real shortcut, though macOS itself usually eats
  // it before the page sees it — the Window menu is the reliable way in.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'F3') { e.preventDefault(); toggle() }
      if (e.key === 'Escape' && open) close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, toggle, close])

  // Measure once, at the moment it opens: the tiles need the windows' real
  // rects before the originals are hidden.
  useLayoutEffect(() => {
    if (!open) { setLayout(null); return }

    const live = windows
      .filter((w) => w.isOpen && !w.isMinimized)
      .map((w) => {
        const el = document.querySelector(`[data-window="${w.id}"]`)
        if (!el) return null
        const r = el.getBoundingClientRect()
        return { win: w, rect: { left: r.left, top: r.top, width: r.width, height: r.height } }
      })
      .filter(Boolean)

    if (!live.length) { setLayout({ items: [] }); return }

    const cols = Math.ceil(Math.sqrt(live.length))
    const rows = Math.ceil(live.length / cols)
    const areaW = window.innerWidth - PAD * 2
    const areaH = window.innerHeight - TOPBAR - PAD * 2
    const cellW = (areaW - GAP * (cols - 1)) / cols
    const cellH = (areaH - GAP * (rows - 1)) / rows - LABEL

    const items = live.map((entry, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      // Never scale a window up — a small window enlarged looks broken.
      const scale = Math.min(cellW / entry.rect.width, cellH / entry.rect.height, 1)
      const w = entry.rect.width * scale
      const h = entry.rect.height * scale
      return {
        ...entry,
        slot: {
          // Centre each window inside its own cell.
          x: PAD + col * (cellW + GAP) + (cellW - w) / 2,
          y: TOPBAR + PAD + row * (cellH + LABEL + GAP) + (cellH - h) / 2,
          scale,
        },
      }
    })
    setLayout({ items })
  }, [open, windows])

  const pick = (id) => { focusWindow(id); close() }

  return (
    <AnimatePresence>
      {open && layout && (
        <motion.div
          className="mc"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}
        >
          {layout.items.length === 0 && <p className="mc__empty">No open windows</p>}
          {layout.items.map(({ win, rect, slot }) => (
            <Tile key={win.id} win={win} rect={rect} slot={slot} onPick={pick} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
