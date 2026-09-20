import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

/* ── macOS right-click menu ────────────────────────────────────────────────
   Portalled to <body> for the same reason the dock tooltip is: every surface
   that wants one is its own stacking context, and an inline menu is trapped
   under whatever outranks its host.

   Items are `{ label, onClick, disabled, danger }`, and `{ sep: true }` draws
   a hairline. A disabled item is still drawn — macOS dims "Empty Trash"
   rather than hiding it, and that dimming is how you know the basket is
   already empty before you ever open it.

   `at` is `{ x, y }` at the cursor, or `{ x, y, placement: 'above',
   align: 'center' }` to rise from an anchor instead. Dock menus are the
   second kind: on a Mac they never drop down over the dock, they grow upward
   out of the icon you clicked, centred on it.                               */

const MARGIN = 8   // closest the menu may sit to a viewport edge

export default function ContextMenu({ at, items, onClose }) {
  const ref = useRef(null)
  const [pos, setPos] = useState(at)

  /* Placed before paint, so the menu never flashes at the raw anchor point
     first: measure, apply the placement, then keep it clear of every edge the
     way AppKit does near the bottom of the display. */
  useLayoutEffect(() => {
    if (!at || !ref.current) return
    const r = ref.current.getBoundingClientRect()

    let x = at.align === 'center' ? at.x - r.width  / 2 : at.x
    let y = at.placement === 'above' ? at.y - r.height   : at.y

    x = Math.min(x, window.innerWidth  - MARGIN - r.width)
    y = Math.min(y, window.innerHeight - MARGIN - r.height)

    setPos({ x: Math.max(MARGIN, x), y: Math.max(MARGIN, y) })
  }, [at])

  /* Callers pass `onClose` as an inline arrow, so its identity changes on
     every render of the host. The dock re-renders on every mousemove while
     it magnifies, so keeping `onClose` in the dependency list tore these
     listeners down and rebuilt them dozens of times a second — and Escape
     went unheard. Held in a ref, the subscription happens once per open. */
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])

  useEffect(() => {
    if (!at) return
    const close  = () => closeRef.current?.()
    const onKey  = (e) => { if (e.key === 'Escape') { e.preventDefault(); close() } }
    const onDown = (e) => { if (!ref.current?.contains(e.target)) close() }
    window.addEventListener('keydown', onKey)
    // Capture phase: close before the click reaches whatever is underneath.
    window.addEventListener('mousedown', onDown, true)
    window.addEventListener('contextmenu', onDown, true)
    window.addEventListener('blur', close)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onDown, true)
      window.removeEventListener('contextmenu', onDown, true)
      window.removeEventListener('blur', close)
    }
  }, [at])

  return createPortal(
    <AnimatePresence>
      {at && (
        <motion.div
          ref={ref}
          className="mac-menu"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{    opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            left: pos?.x ?? at.x,
            top:  pos?.y ?? at.y,
            transformOrigin: at.placement === 'above' ? 'bottom center' : 'top left',
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {items.map((item, i) =>
            item.sep ? (
              <div key={`sep-${i}`} className="mac-menu__sep" />
            ) : (
              <button
                key={item.label}
                className="mac-menu__item"
                data-disabled={item.disabled || undefined}
                data-danger={item.danger || undefined}
                disabled={item.disabled}
                onClick={() => { item.onClick?.(); onClose() }}
              >
                <span>{item.label}</span>
                {item.shortcut && <span className="mac-menu__key">{item.shortcut}</span>}
              </button>
            )
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
