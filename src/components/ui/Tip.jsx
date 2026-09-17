import { useCallback, useRef, useState } from 'react'
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
 */
export default function Tip({ label, placement = 'bottom', children }) {
  const ref = useRef(null)
  const [at, setAt] = useState(null)

  const show = useCallback(() => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setAt({ cx: r.left + r.width / 2, top: r.top, bottom: r.bottom })
  }, [])

  const hide = useCallback(() => setAt(null), [])

  if (!label) return children

  const gap = TIP_DEPTH + 6

  return (
    <>
      <span
        ref={ref}
        className="tip-anchor"
        onMouseEnter={show}
        onMouseLeave={hide}
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
