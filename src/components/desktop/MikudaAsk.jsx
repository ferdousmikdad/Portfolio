/* ── Type to Mikuda ─────────────────────────────────────────────────────────
   Siri's type-to field: the orb on the left, the placeholder filling the
   middle, the dictation mic at the right end.

   It is deliberately not Spotlight. Spotlight is a 62pt capsule floating at
   the top third of the screen; this one is half that height and hangs off the
   menu-bar icon that opened it, right-aligned to it the way every menu-bar
   extra drops its panel. All it holds is the question, which it hands to the
   chat window on Return.                                                    */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import useWindowStore from '@/store/windowStore'
import GlassLayers from '@/components/ui/LiquidGlass'
import siriIconUrl from '@/assets/icons/siri.png?url'

const WIDTH = 320
const GAP   = 6      // the breath Tahoe leaves between the bar and the panel
const EDGE  = 8      // never let it touch the screen edge

/* The dictation mic. Decorative — Siri shows it whether or not you ever press
   it, and there is no microphone behind this one. */
function MicGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
      <path d="M12 17.5V21" />
    </svg>
  )
}

export default function MikudaAsk({ anchorRef }) {
  const [text, setText] = useState('')
  /* Until it is measured the field would flash at the top-left, so it starts
     hidden and the layout effect places it before the first paint. */
  const [at, setAt] = useState(null)
  const inputRef = useRef(null)

  const askMikuda      = useWindowStore((s) => s.askMikuda)
  const closeMikudaAsk = useWindowStore((s) => s.closeMikudaAsk)

  /* Hang off the button: right edges flush, the panel growing leftward. */
  useLayoutEffect(() => {
    const place = () => {
      const el = anchorRef?.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const right = Math.max(EDGE, Math.min(window.innerWidth - r.right, window.innerWidth - WIDTH - EDGE))
      setAt({ top: Math.round(r.bottom + GAP), right: Math.round(right) })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [anchorRef])

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 30)
    return () => clearTimeout(t)
  }, [])

  const submit = () => {
    const q = text.trim()
    if (!q) return
    askMikuda(q)
    setText('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter')  { e.preventDefault(); submit() }
    if (e.key === 'Escape') { e.preventDefault(); closeMikudaAsk() }
  }

  return (
    /* The layer only catches the click that dismisses the field. It sits below
       the menu bar's z-index so the Siri button stays live underneath — a
       second click on it closes rather than reopens. */
    <div className="mikuda-ask-layer" onMouseDown={closeMikudaAsk}>
      <motion.div
        className="mikuda-ask"
        onMouseDown={(e) => e.stopPropagation()}
        style={{ width: WIDTH, ...(at ?? { visibility: 'hidden' }) }}
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        exit={{    opacity: 0, y: -6, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 520, damping: 36 }}
      >
        <GlassLayers small />
        <img src={siriIconUrl} alt="" className="mikuda-ask__orb" draggable={false} />
        <input
          ref={inputRef}
          className="mikuda-ask__input"
          value={text}
          placeholder="Type to Mikuda"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
        />
        <button className="mikuda-ask__mic" onClick={submit} title="Ask Mikuda">
          <MicGlyph />
        </button>
      </motion.div>
    </div>
  )
}
