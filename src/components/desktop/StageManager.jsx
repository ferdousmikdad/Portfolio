import { useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useWindowStore from '@/store/windowStore'
import useSettingsStore from '@/store/settingsStore'
import { neutralise } from '@/utils/windowSnapshots'
import { hydrateFrames } from '@/utils/genie'
import windowIcon from '@/data/windowIcons'
import TOOLS from '@/data/tools'

/* ── Stage Manager ─────────────────────────────────────────────────────────
   One window on the stage, the rest parked down the left edge as live
   thumbnails. Click one and it swaps in; the window you were on goes back to
   the rail.

   The toggle for this has existed in Control Centre and System Settings for a
   while but only ever flipped a flag — the UI was promising a mode that did
   nothing. This is that mode.

   The cards are DOM clones, the same approach Mission Control and the dock's
   minimised tiles use. The windows themselves stay mounted and laid out —
   they are hidden with `visibility`, not `opacity`, because an element below
   opacity 1 becomes a backdrop root and every piece of glass inside it stops
   sampling (see the note in Window.jsx).                                   */

const CARD_W = 132

function labelFor(win) {
  if (win.title && win.title !== win.id) return win.title
  return TOOLS.find((t) => t.id === win.id)?.name ?? win.id
}

function StageCard({ win, onPick }) {
  const hostRef = useRef(null)
  const [size, setSize] = useState({ w: CARD_W, h: 84 })

  useLayoutEffect(() => {
    const host = hostRef.current
    const live = document.querySelector(`[data-window="${win.id}"]`)
    if (!host || !live) return
    const r = live.getBoundingClientRect()
    if (!r.width || !r.height) return

    const scale = CARD_W / r.width
    setSize({ w: CARD_W, h: Math.round(r.height * scale) })

    const copy = neutralise(live.cloneNode(true), { width: r.width, height: r.height })
    copy.style.transformOrigin = 'top left'
    copy.style.transform = `scale(${scale})`
    host.replaceChildren(copy)
    hydrateFrames(copy)
    return () => host.replaceChildren()
    // Re-clone whenever the window's geometry changes, or the card keeps a
    // picture of a window that has since been moved or resized.
  }, [win.id, win.size?.width, win.size?.height, win.position?.x, win.position?.y])

  return (
    <motion.button
      type="button"
      className="stage__card"
      layout
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ type: 'spring', stiffness: 360, damping: 32 }}
      onClick={() => onPick(win.id)}
      title={labelFor(win)}
    >
      <span className="stage__shot" style={{ width: size.w, height: size.h }} ref={hostRef} />
      <span className="stage__label">
        <img src={windowIcon(win.id)} alt="" width={13} height={13} draggable={false} />
        {labelFor(win)}
      </span>
    </motion.button>
  )
}

export default function StageManager() {
  const on = useSettingsStore((s) => s.stageManager)
  const windows = useWindowStore((s) => s.windows)
  const activeWindowId = useWindowStore((s) => s.activeWindowId)
  const focusWindow = useWindowStore((s) => s.focusWindow)

  // Everything open and on screen except whatever is currently on the stage.
  const parked = windows.filter(
    (w) => w.isOpen && !w.isMinimized && w.id !== activeWindowId,
  )

  return (
    <AnimatePresence>
      {on && (
        <motion.div
          className="stage"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        >
          <AnimatePresence mode="popLayout">
            {parked.map((w) => (
              <StageCard key={w.id} win={w} onPick={focusWindow} />
            ))}
          </AnimatePresence>
          {parked.length === 0 && (
            <p className="stage__empty">Only one window open</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
