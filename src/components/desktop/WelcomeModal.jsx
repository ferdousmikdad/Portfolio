import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassLayers from '@/components/ui/LiquidGlass'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'

/* ── Welcome card ──────────────────────────────────────────────────────────
   Laid out on AppKit's dialog grammar, the same one MacAlert follows: a
   narrow column, the icon above the text, a bold one-line title, dimmer body
   copy under it, and the default button last. The difference is the
   material — an NSAlert is opaque because it interrupts a task, while this
   is a greeting laid over the desktop, so it is glass.                     */

const STORAGE_KEY = 'portfolio-welcomed-v1'
const TEXT =
  'This portfolio is built like a macOS desktop — it looks and feels best in ' +
  'full screen. Click "Fit Window" to enter full screen, or press Esc at any ' +
  'time to exit.'

export default function WelcomeModal() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem(STORAGE_KEY)) setShow(true)
  }, [])

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1')
    setShow(false)
  }

  const fitWindow = () => {
    document.documentElement.requestFullscreen?.().catch(() => {})
    dismiss()
  }

  // The card offers "press Esc to skip", so Esc has to actually skip it.
  // Return commits the default button, the way a real dialog behaves.
  useEffect(() => {
    if (!show) return
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); dismiss() }
      if (e.key === 'Enter')  { e.preventDefault(); fitWindow() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="welcome__scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) dismiss() }}
        >
          <motion.div
            className="welcome"
            role="dialog"
            aria-modal="true"
            aria-label="Welcome"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32, delay: 0.06 }}
          >
            <GlassLayers />

            <button className="welcome__close" onClick={dismiss} aria-label="Close">
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none"
                   stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M1 1l8 8M9 1l-8 8" />
              </svg>
            </button>

            <img className="welcome__icon" src={mikdadHeadUrl} alt="" draggable={false} />
            <p className="welcome__title">Hey</p>
            <p className="welcome__body">{TEXT}</p>

            {/* No autoFocus: focusing on mount paints the focus ring immediately,
                and with a red accent that reads as a doubled border rather than
                a highlight. Return is handled on the window instead, so the
                keyboard still commits the default button. */}
            <button className="welcome__btn" data-default="true" onClick={fitWindow}>
              Fit Window
            </button>

            <p className="welcome__hint">or press Esc to skip</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
