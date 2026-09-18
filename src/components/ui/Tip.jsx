import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DockTip, { TIP_H, TIP_DEPTH } from '@/components/dock/DockTip'

/**
 * Wraps a control in the dock's glass bubble.
 *
 *   <Tip label="Search"><button …/></Tip>
 *
 * The bubble is rendered through a portal on `document.body` rather than
 * inside the control. Every surface that wants a tooltip — the top bar at
 * z 50, the dock at 45, the side rail at 30 — is its own stacking context, so
 * an inline bubble is trapped under whatever outranks its host. Portalled and
 * fixed-positioned, it clears all of them.
 *
 * `placement` is which side of the control the bubble sits on; the tail always
 * points back at it.
 *
 * `open` forces the bubble up with no hover. macOS drops the hover delay the
 * moment a drag starts — the dock labels its drop targets immediately, because
 * you are no longer browsing the dock, you are aiming at it.
 */
export default function Tip({ label, placement = 'bottom', open = false, hidden = false, children }) {
  const ref = useRef(null)
  const [at, setAt] = useState(null)

  const show = useCallback(() => {
    const el = ref.current
    // A menu has taken over the control: macOS drops the label when one opens.
    if (!el || hidden) return
    const r = el.getBoundingClientRect()
    const next = { cx: r.left + r.width / 2, top: r.top, bottom: r.bottom }
    // Compared, not just assigned: the forced-open path re-measures every
    // frame, and a fresh object each time would re-render the portal for
    // nothing while the tile is standing still.
    setAt((prev) =>
      prev && prev.cx === next.cx && prev.top === next.top && prev.bottom === next.bottom
        ? prev
        : next
    )
  }, [hidden])

  const hide = useCallback(() => setAt(null), [])

  // Forced open: keep measuring for as long as it stays forced. A dock tile
  // magnifies while a drag crosses it, so a position taken once at the start
  // leaves the label sitting over the icon instead of above it.
  useEffect(() => {
    if (hidden) { hide(); return }
    if (!open)  { hide(); return }
    let frame = 0
    const tick = () => { show(); frame = requestAnimationFrame(tick) }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [open, hidden, show, hide])

  if (!label) return children

  const gap = TIP_DEPTH + 6

  return (
    <>
      <span
        ref={ref}
        className="tip-anchor"
        onMouseEnter={show}
        onMouseLeave={() => { if (!open) hide() }}
        onFocusCapture={show}
        onBlurCapture={hide}
      >
        {children}
      </span>

      {createPortal(
        <AnimatePresence>
          {at && (
            <motion.span
              className="dock-tip"
              initial={{ opacity: 0, y: placement === 'top' ? 4 : -4, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{    opacity: 0, y: placement === 'top' ? 3 : -3, x: '-50%' }}
              transition={{ duration: 0.13 }}
              style={{
                position: 'fixed',
                left: at.cx,
                height: TIP_H,
                ...(placement === 'top'
                  ? { top: at.top - gap - TIP_H }
                  : { top: at.bottom + gap }),
              }}
            >
              <DockTip label={label} placement={placement} />
            </motion.span>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}
