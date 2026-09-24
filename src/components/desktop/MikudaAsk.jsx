/* ── Type to Mikuda ─────────────────────────────────────────────────────────
   Siri's type-to field, and Siri's way of answering: the reply lands in a
   glass box directly under the field rather than in a window somewhere else.

   Measured off Tahoe Siri at 2x: a 43pt capsule 343pt wide, filled a dark
   blue-slate (#243B4E) with a lighter hairline rim (#41607C); the answer box
   6pt below it at the same width, the same fill, a ~22pt radius, and the
   answer set large (15pt) in a soft grey-white. Each new question replaces
   the answer, the way Siri shows only its latest.

   The box fades in under the field and resizes for each new answer. While
   Mikuda is thinking the field's rim runs with the Apple Intelligence glow;
   when an answer lands, a white glow sweeps once round the answer box's rim
   and fades.                                                              */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import useWindowStore from '@/store/windowStore'
import useMikuda from '@/hooks/useMikuda'
import GlassLayers from '@/components/ui/LiquidGlass'
import SFSymbol from '@/components/ui/SFSymbol'
import { CONTACT, SOCIAL_LINKS } from '@/data/mikudaAI'
import siriIconUrl from '@/assets/icons/siri.png?url'

const WIDTH = 344
const GAP   = 6      // the breath Tahoe leaves between the bar and the panel
const EDGE  = 8      // never let it touch the screen edge

const hostOf = (href) => href.replace(/^(https?:\/\/(www\.)?|mailto:|tel:)/, '').replace(/\/$/, '')
const label  = (slug) => slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

/* The dictation mic. Siri shows it whether or not you ever press it; here it
   sends what is typed. */
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

// ── What goes in the answer box ───────────────────────────────────────────────

function Row({ href, onClick, title, sub }) {
  const Tag = href ? 'a' : 'button'
  return (
    <Tag className="mikuda-reply__row" {...(href ? { href, target: '_blank', rel: 'noreferrer' } : { onClick })}>
      <span className="mikuda-reply__row-text">
        <span className="mikuda-reply__row-title">{title}</span>
        {sub && <span className="mikuda-reply__row-sub">{sub}</span>}
      </span>
      <SFSymbol name="chevron.right" size={11} className="mikuda-reply__row-chev" />
    </Tag>
  )
}

function Answer({ reply, onProject, onAction }) {
  const links = reply.type === 'social'
    ? (reply.socialFilter ? SOCIAL_LINKS.filter((s) => reply.socialFilter.includes(s.label)) : SOCIAL_LINKS)
    : []
  return (
    <>
      {reply.text && <p className="mikuda-reply__text">{reply.text}</p>}

      {reply.type === 'image' && reply.project && (
        <button className="mikuda-reply__project" onClick={() => onProject(reply.project)}>
          <img src={reply.project.thumbnail} alt="" draggable={false} />
          <span className="mikuda-reply__project-foot">
            <span className="mikuda-reply__row-title">{reply.project.title}</span>
            <span className="mikuda-reply__row-sub">{label(reply.project.category)}</span>
          </span>
        </button>
      )}

      {links.length > 0 && (
        <div className="mikuda-reply__rows">
          {links.map((s) => <Row key={s.href} href={s.href} title={`${s.label} · ${s.handle}`} sub={hostOf(s.href)} />)}
        </div>
      )}

      {reply.type === 'contact' && (
        <div className="mikuda-reply__rows">
          {reply.contactInfo?.email && <Row href={`mailto:${CONTACT.email}`} title="Email" sub={CONTACT.email} />}
          {reply.contactInfo?.phone && <Row href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} title="Phone" sub={CONTACT.phone} />}
        </div>
      )}

      {reply.action && (
        <button className="mikuda-reply__action" onClick={() => onAction(reply.action)}>
          {reply.actionLabel}
        </button>
      )}
    </>
  )
}

// ── Field + answer ────────────────────────────────────────────────────────────

export default function MikudaAsk({ anchorRef }) {
  const [text,     setText]     = useState('')
  const [thinking, setThinking] = useState(false)
  const [reply,    setReply]    = useState(null)
  /* Until it is measured the field would flash at the top-left, so it starts
     hidden and the layout effect places it before the first paint. */
  const [at, setAt] = useState(null)
  const inputRef = useRef(null)
  const asked    = useRef(0)

  const closeMikudaAsk     = useWindowStore((s) => s.closeMikudaAsk)
  const navigate           = useWindowStore((s) => s.navigate)
  const openProjectPreview = useWindowStore((s) => s.openProjectPreview)
  const { ask } = useMikuda()

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

  const submit = async () => {
    const q = text.trim()
    if (!q || thinking) return
    const turn = ++asked.current
    setText('')
    setThinking(true)
    const r = await ask(q)
    if (turn !== asked.current) return
    setThinking(false)
    setReply({ ...r, id: turn })
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter')  { e.preventDefault(); submit() }
    if (e.key === 'Escape') { e.preventDefault(); closeMikudaAsk() }
  }

  const openProject = (p) => { closeMikudaAsk(); openProjectPreview(p) }
  const runAction   = (page) => { closeMikudaAsk(); navigate(page) }

  return (
    /* The layer only catches the click that dismisses the field. It sits below
       the menu bar's z-index so the Siri button stays live underneath — a
       second click on it closes rather than reopens. */
    <div className="mikuda-ask-layer" onMouseDown={closeMikudaAsk}>
      <div
        className="mikuda-ask-stack"
        onMouseDown={(e) => e.stopPropagation()}
        style={{ width: WIDTH, ...(at ?? { visibility: 'hidden' }) }}
      >
        <motion.div
          className={`mikuda-ask${thinking ? ' mikuda-ask--thinking' : ''}`}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{    opacity: 0, y: -6, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 520, damping: 36 }}
        >
          <GlassLayers small />
          <span className="mikuda-ask__glow" aria-hidden />
          <img src={siriIconUrl} alt="" className="mikuda-ask__orb" draggable={false} />
          <input
            ref={inputRef}
            className="mikuda-ask__input"
            value={text}
            placeholder={thinking ? 'Thinking…' : reply ? 'Ask something else' : 'Type to Mikuda'}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
          />
          <button className="mikuda-ask__mic" onClick={submit} title="Ask Mikuda">
            <MicGlyph />
          </button>
        </motion.div>

        {reply && (
          <motion.div
            layout
            className="mikuda-reply"
            style={{ borderRadius: 22 }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              default: { duration: 0.2, ease: 'easeOut' },
              layout: { type: 'spring', stiffness: 380, damping: 30 },
            }}
          >
            <GlassLayers small />
            {/* Keyed to the answer, so each new one replays the sweep. */}
            <span key={`glow-${reply.id}`} className="mikuda-reply__glow" aria-hidden />
            <motion.div
              key={reply.id}
              layout="position"
              className="mikuda-reply__body"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: 0.05 }}
            >
              <Answer reply={reply} onProject={openProject} onAction={runAction} />
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
