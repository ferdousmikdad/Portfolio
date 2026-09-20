import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useWindowStore from '@/store/windowStore'

/* ── Screen saver ──────────────────────────────────────────────────────────
   The greeting macOS shows when a Mac has been sitting untouched — "hello"
   cycling through languages over black.

   Apple draws theirs as a handwriting stroke animation. That needs authored
   path data per language, which is a lot of glyph work for a screen saver, so
   this uses type instead and gets its life from the transition: each greeting
   rises in, holds, and drifts out, one at a time.

   The languages are the ones this portfolio actually touches — English,
   Bengali and Arabic are all present in the work itself — rather than a
   generic list.                                                            */

const GREETINGS = [
  { text: 'hello',    lang: 'en' },
  { text: 'হ্যালো',     lang: 'bn' },
  { text: 'مرحبا',     lang: 'ar', rtl: true },
  { text: 'नमस्ते',      lang: 'hi' },
  { text: 'bonjour',  lang: 'fr' },
  { text: '你好',      lang: 'zh' },
  { text: 'こんにちは', lang: 'ja' },
  { text: 'hola',     lang: 'es' },
  { text: 'привет',   lang: 'ru' },
]

const IDLE_MS  = 45_000   // how long the desk sits untouched first
const HOLD_MS  = 2_600    // each greeting's turn

export default function ScreenSaver() {
  const active = useWindowStore((s) => s.screenSaver)
  const start = useWindowStore((s) => s.startScreenSaver)
  const stop = useWindowStore((s) => s.stopScreenSaver)
  const [i, setI] = useState(0)
  const timer = useRef(null)

  /* Idle watch. Every one of these events counts as "still here", and the
     clock restarts. Passive listeners: this must not cost anything on a
     surface the visitor is actively scrolling. */
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart']
    const reset = () => {
      clearTimeout(timer.current)
      timer.current = setTimeout(start, IDLE_MS)
    }
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset()
    return () => {
      clearTimeout(timer.current)
      events.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [start])

  /* Any input at all wakes it — that is the whole contract of a screen
     saver, and a visitor who has to hunt for the way out is being punished
     for looking away. */
  useEffect(() => {
    if (!active) return
    setI(0)
    const wake = () => stop()
    const events = ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart']
    events.forEach((e) => window.addEventListener(e, wake, { passive: true }))
    const cycle = setInterval(() => setI((n) => (n + 1) % GREETINGS.length), HOLD_MS)
    return () => {
      clearInterval(cycle)
      events.forEach((e) => window.removeEventListener(e, wake))
    }
  }, [active, stop])

  const g = GREETINGS[i]

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="saver"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={g.text}
              className="saver__word"
              lang={g.lang}
              dir={g.rtl ? 'rtl' : 'ltr'}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -22 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {g.text}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
