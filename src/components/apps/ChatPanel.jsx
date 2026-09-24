import { Fragment, useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useWindowStore from '@/store/windowStore'
import SFSymbol from '@/components/ui/SFSymbol'
import useMikuda from '@/hooks/useMikuda'
import { CONTACT, SOCIAL_LINKS } from '@/data/mikudaAI'

/* Mikuda's chat, drawn as a Messages conversation. The Home window hosts one
   of these per conversation in its sidebar; Finder shows a single one under
   its Home favourite. Each mount keeps its own thread, the way two Finder
   windows on the same folder each keep their own selection.

   Messages does not stream text in, so neither does this: the typing bubble
   holds until the whole reply is ready, then the reply lands at once. */

export const GREETING = "Hey, I'm Mikuda 👋 Ask me anything about Mikdad's work, skills or projects — or click + for ideas."

const SUGGESTIONS = [
  'Who is Mikdad?',
  'What are his skills?',
  'Is he available for freelance?',
  'Show me an Arabic logo',
  'Show me his projects',
  'How can I contact him?',
]

const clock = (d) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
const label  = (slug) => slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
const hostOf = (href) => href.replace(/^(https?:\/\/(www\.)?|mailto:|tel:)/, '').replace(/\/$/, '')

// ── Bubbles ───────────────────────────────────────────────────────────────────

/* One bubble. `tail` is set on the last bubble of a run from one sender —
   the only one Messages draws the tail on. */
function Bubble({ out, tail, children, className = '' }) {
  return (
    <div className={`msg-bubble ${out ? 'msg-bubble--out' : 'msg-bubble--in'}${tail ? ' msg-bubble--tail' : ''} ${className}`}>
      {children}
    </div>
  )
}

/* A link with a preview: the grey footer carrying a title and the site it
   points at, with an image above it when there is one. Messages draws every
   shared URL this way, so the portfolio pieces, social profiles and in-site
   shortcuts all come through as the same kind of card. */
function LinkBubble({ href, onClick, image, title, sub, tail }) {
  const [loaded, setLoaded] = useState(false)
  const Tag = href ? 'a' : 'button'
  return (
    <Tag
      className={`msg-link${tail ? ' msg-bubble--tail' : ''}`}
      {...(href ? { href, target: '_blank', rel: 'noreferrer' } : { onClick })}
    >
      {image && (
        <span className="msg-link__image">
          {!loaded && <span className="msg-link__skeleton" />}
          <img src={image} alt="" onLoad={() => setLoaded(true)} style={{ opacity: loaded ? 1 : 0 }} draggable={false} />
        </span>
      )}
      <span className="msg-link__footer">
        <span className="msg-link__title">{title}</span>
        {sub && <span className="msg-link__sub">{sub}</span>}
      </span>
    </Tag>
  )
}

/* Everything one message contributes, flattened to a list of bubbles so
   runs and tails can be worked out across message boundaries. */
function bubblesFor(msg, { onAction, onOpenProject }) {
  if (msg.role === 'user') return [{ out: true, node: <p>{msg.text}</p> }]

  const list = []
  if (msg.text) list.push({ node: <p>{msg.text}</p> })

  if (msg.type === 'image' && msg.project) {
    list.push({
      link: true,
      node: (tail) => (
        <LinkBubble tail={tail} image={msg.project.thumbnail} title={msg.project.title}
          sub={label(msg.project.category)} onClick={() => onOpenProject(msg.project)} />
      ),
    })
  }
  if (msg.type === 'social') {
    const links = msg.socialFilter ? SOCIAL_LINKS.filter((s) => msg.socialFilter.includes(s.label)) : SOCIAL_LINKS
    links.forEach((s) => list.push({
      link: true,
      node: (tail) => <LinkBubble tail={tail} href={s.href} title={`${s.label} · ${s.handle}`} sub={hostOf(s.href)} />,
    }))
  }
  if (msg.type === 'contact') {
    if (msg.contactInfo?.email) list.push({
      link: true,
      node: (tail) => <LinkBubble tail={tail} href={`mailto:${CONTACT.email}`} title="Email" sub={CONTACT.email} />,
    })
    if (msg.contactInfo?.phone) list.push({
      link: true,
      node: (tail) => <LinkBubble tail={tail} href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} title="Phone" sub={CONTACT.phone} />,
    })
  }
  if (msg.action) {
    list.push({
      link: true,
      node: (tail) => <LinkBubble tail={tail} title={msg.actionLabel} sub="Click to open" onClick={() => onAction(msg.action)} />,
    })
  }
  return list
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export default function ChatPanel({ active = true, starter, greeting = true, onActivity }) {
  const navigate           = useWindowStore((s) => s.navigate)
  const openProjectPreview = useWindowStore((s) => s.openProjectPreview)

  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState('')
  const [thinking, setThinking] = useState(false)
  const [menu,     setMenu]     = useState(false)
  const [opened]                = useState(() => new Date())
  const { ask }                 = useMikuda()

  const scrollRef     = useRef(null)
  const inputRef      = useRef(null)
  const nextId        = useRef(0)
  const starterSent   = useRef(false)

  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => inputRef.current?.focus(), 200)
    return () => clearTimeout(t)
  }, [active])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const mo = new MutationObserver(() => { el.scrollTop = el.scrollHeight })
    mo.observe(el, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [])

  /* Report the newest line to whoever lists this conversation. */
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (!last || !onActivity) return
    const preview = last.text || (last.project ? last.project.title : last.actionLabel) || ''
    onActivity({ preview, at: last.at })
  }, [messages, onActivity])

  const push = (msg) => setMessages((prev) => [...prev, { id: nextId.current++, at: new Date(), ...msg }])

  const sendMessage = useCallback(async (text) => {
    const trimmed = typeof text === 'string' ? text.trim() : input.trim()
    if (!trimmed || thinking) return

    setMenu(false)
    push({ role: 'user', text: trimmed })
    setInput('')
    setThinking(true)
    const reply = await ask(trimmed)
    setThinking(false)
    push({ role: 'ai', ...reply })
  }, [input, thinking, ask])

  /* A conversation opened from the sidebar asks its question the first time
     it is shown, so the thread arrives already answered. */
  useEffect(() => {
    if (!active || !starter || starterSent.current) return
    starterSent.current = true
    sendMessage(starter)
  }, [active, starter, sendMessage])

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
    if (e.key === 'Escape') setMenu(false)
  }

  // Flatten to bubbles, then mark the last of every run for its tail.
  const bubbles = []
  if (greeting) bubbles.push({ key: 'greeting', node: <p>{GREETING}</p> })
  messages.forEach((m) => {
    bubblesFor(m, { onAction: navigate, onOpenProject: openProjectPreview })
      .forEach((b, i) => bubbles.push({ ...b, key: `${m.id}-${i}` }))
  })
  if (thinking) bubbles.push({ key: 'typing', typing: true })
  bubbles.forEach((b, i) => {
    const next = bubbles[i + 1]
    b.tail  = !next || !!next.out !== !!b.out
    b.first = i === 0 || !!bubbles[i - 1].out !== !!b.out
  })
  // The receipt sits under the newest bubble you sent, however much has been said since.
  const lastOutKey = [...bubbles].reverse().find((b) => b.out)?.key
  
  return (
    <div className="msg-panel">
      <div ref={scrollRef} className="msg-scroll window-scroll">
        <div className="msg-thread">
          <p className="msg-stamp"><b>iMessage</b><br />Today {clock(messages[0]?.at ?? opened)}</p>

          {bubbles.map((b) => (
            <Fragment key={b.key}>
            <motion.div
              className={`msg-row ${b.out ? 'msg-row--out' : 'msg-row--in'}${b.first ? ' msg-row--first' : ''}`}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 520, damping: 34 }}
              style={{ transformOrigin: b.out ? 'bottom right' : 'bottom left' }}
            >
              {b.typing ? (
                <Bubble tail className="msg-typing"><span /><span /><span /></Bubble>
              ) : b.link ? (
                b.node(b.tail)
              ) : (
                <Bubble out={b.out} tail={b.tail}>{b.node}</Bubble>
              )}
            </motion.div>
            {b.key === lastOutKey && (
              <p className="msg-receipt">{thinking ? 'Delivered' : 'Read'}</p>
            )}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="msg-compose">
        <AnimatePresence>
          {menu && (
            <motion.div
              className="msg-menu"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 2, transition: { duration: 0.1 } }}
              transition={{ duration: 0.14 }}
            >
              {SUGGESTIONS.map((s) => (
                <button key={s} className="msg-menu__item" onMouseDown={(e) => { e.preventDefault(); sendMessage(s) }}>
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          className="msg-round"
          title="Suggested questions"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => { setMenu((v) => !v); inputRef.current?.focus() }}
        >
          <SFSymbol name="plus" size={13} />
        </button>

        <div className="msg-field">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); setMenu(false) }}
            onKeyDown={onKeyDown}
            onBlur={() => setMenu(false)}
            placeholder="iMessage"
            className="msg-input"
            onMouseDown={(e) => e.stopPropagation()}
          />
          {input.trim() ? (
            <button className="msg-send" onClick={() => sendMessage()} disabled={thinking} title="Send">
              <SFSymbol name="arrow.up" size={11} />
            </button>
          ) : (
            <SFSymbol name="waveform" size={15} className="msg-field__wave" />
          )}
        </div>

        <button
          className="msg-round"
          title="Emoji"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => { setInput((v) => `${v}👋`); inputRef.current?.focus() }}
        >
          <SFSymbol name="face.smiling" size={16} />
        </button>
      </div>
    </div>
  )
}
