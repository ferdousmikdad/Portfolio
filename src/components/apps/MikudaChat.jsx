import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ArrowUp } from 'lucide-react'
import useWindowStore from '@/store/windowStore'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'

// ── Knowledge base ────────────────────────────────────────────────────────────

const KB = [
  {
    id: 'greeting',
    test: (t) => /^(hi|hello|hey|sup|yo|greetings|howdy)\b/.test(t),
    answer: "Hey there! I'm Mikuda, Mikdad's AI assistant. Ask me anything about his work, skills, or how to collaborate!",
  },
  {
    id: 'thanks',
    test: (t) => /\bthank(s| you)\b/.test(t),
    answer: "You're welcome! Anything else you'd like to know about Mikdad?",
  },
  {
    id: 'about',
    test: (t) => /\b(who is|about|mikdad|yourself|background|tell me)\b/.test(t),
    answer: "Mikdad is a UI/UX designer and web developer who specialises in interactive websites, modern UI design, branding, and Arabic logo design. He loves building creative experiences.",
  },
  {
    id: 'skills',
    test: (t) => /\b(skill|expertise|good at|speciali[zs]e|tech|stack|what do you do|what can)\b/.test(t),
    answer: "Mikdad's core skills:\n• UI/UX Design\n• Web Development (HTML, CSS, JS, React)\n• Branding & Identity Design\n• Arabic Logo & Calligraphy Design",
  },
  {
    id: 'projects',
    test: (t) => /\b(project|portfolio|work|built|made|created|show|example)\b/.test(t),
    answer: "Mikdad has built a Pac-Man style interactive portfolio, a macOS-inspired multi-window site, landing pages, UI systems, and branding projects. Open the Portfolio to explore!",
    action: 'portfolio',
    actionLabel: 'Open Portfolio →',
  },
  {
    id: 'branding',
    test: (t) => /\b(brand|logo|identity|arabic|calligraph|logotype|mark)\b/.test(t),
    answer: "Mikdad specialises in branding and identity design — including Arabic logo design and calligraphy-based logotypes.",
    action: 'portfolio',
    actionLabel: 'View Branding Work →',
  },
  {
    id: 'services',
    test: (t) => /\b(service|offer|provide|package|price|cost|rate|quote)\b/.test(t),
    answer: "Mikdad offers:\n• Website design & development\n• UI/UX design\n• Branding & logo design\n• Arabic logo & identity design\n\nOpen to freelance and creative projects.",
  },
  {
    id: 'contact',
    test: (t) => /\b(contact|reach|email|message|talk|connect|get in touch|hire)\b/.test(t),
    answer: "You can reach Mikdad at ferdousmikdad@gmail.com — he's always happy to discuss new projects and collaborations!",
  },
  {
    id: 'availability',
    test: (t) => /\b(available|availability|freelance|free|busy|open for|open to)\b/.test(t),
    answer: "Yes! Mikdad is currently open for freelance and creative projects. Send him a message at ferdousmikdad@gmail.com to get started.",
  },
  {
    id: 'web',
    test: (t) => /\b(web|website|react|html|css|javascript|frontend|develop|code)\b/.test(t),
    answer: "Mikdad builds modern interactive websites with HTML, CSS, JavaScript, and React — focused on smooth UX and creative interactions.",
  },
  {
    id: 'ux',
    test: (t) => /\b(ux|ui|design|interface|figma|prototype|wireframe|user experience)\b/.test(t),
    answer: "UI/UX design is central to Mikdad's work. He creates intuitive interfaces, interactive prototypes, and complete design systems.",
  },
]

const FALLBACK = "I'm here to help with questions about Mikdad's work. Try asking about his projects, skills, services, or how to get in touch!"

const SUGGESTIONS = [
  { label: 'How to contact Mikdad', highlight: 'Mikdad' },
  { label: 'Is he available?',       highlight: null },
  { label: 'Show me his projects',   highlight: null },
]

function getResponse(input) {
  const t = input.toLowerCase().trim()
  for (const entry of KB) {
    if (entry.test(t)) return { answer: entry.answer, action: entry.action, actionLabel: entry.actionLabel }
  }
  return { answer: FALLBACK }
}

// ── Typing hook ───────────────────────────────────────────────────────────────

function useTyping(text, active, speed = 16) {
  const [displayed, setDisplayed] = useState(active ? '' : text)
  const [done, setDone]           = useState(!active)

  useEffect(() => {
    if (!active) { setDisplayed(text); setDone(true); return }
    setDisplayed('')
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(id); setDone(true) }
    }, speed)
    return () => clearInterval(id)
  }, [text, active, speed])

  return { displayed, done }
}

// ── Suggestion pill ───────────────────────────────────────────────────────────

function SuggestionPill({ label, highlight, onClick }) {
  if (!highlight) {
    return (
      <button className="mk-pill" onClick={onClick}>
        <span>{label}</span>
      </button>
    )
  }
  const [before, after] = label.split(highlight)
  return (
    <button className="mk-pill" onClick={onClick}>
      <span>{before}<span style={{ color: '#cf0506' }}>{highlight}</span>{after}</span>
    </button>
  )
}

// ── Message bubbles ───────────────────────────────────────────────────────────

function AiBubble({ text, action, actionLabel, onAction, isLatest }) {
  const { displayed, done } = useTyping(text, isLatest)
  const lines = displayed.split('\n')

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      className="flex flex-col gap-2"
    >
      <div className="mk-bubble-ai">
        <p className="text-[13px] leading-relaxed" style={{ color: '#e8e5dc' }}>
          {lines.map((line, i) => (
            <span key={i}>{line}{i < lines.length - 1 && <br />}</span>
          ))}
          {isLatest && !done && <span className="mk-cursor" />}
        </p>
      </div>
      {done && action && (
        <motion.button
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onAction(action)}
          className="mk-action-btn"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  )
}

function UserBubble({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      className="flex justify-end"
    >
      <div className="mk-bubble-user">
        <p className="text-[13px] leading-relaxed">{text}</p>
      </div>
    </motion.div>
  )
}

function ThinkingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="mk-bubble-ai">
        <div className="mk-dots">
          <span /><span /><span />
        </div>
      </div>
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MikudaChat({ isOpen, onClose }) {
  const navigate = useWindowStore((s) => s.navigate)

  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [thinking,  setThinking]  = useState(false)
  const [latestId,  setLatestId]  = useState(null)

  const scrollRef = useRef(null)
  const inputRef  = useRef(null)
  const nextId    = useRef(0)

  const inChat = messages.length > 0

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150)
  }, [isOpen])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, thinking])

  const sendMessage = useCallback((text) => {
    const trimmed = typeof text === 'string' ? text.trim() : input.trim()
    if (!trimmed || thinking) return

    const uid = nextId.current++
    setMessages((prev) => [...prev, { id: uid, role: 'user', text: trimmed }])
    setInput('')
    setThinking(true)

    setTimeout(() => {
      const res  = getResponse(trimmed)
      const aiId = nextId.current++
      setThinking(false)
      setMessages((prev) => [...prev, { id: aiId, role: 'ai', text: res.answer, action: res.action, actionLabel: res.actionLabel }])
      setLatestId(aiId)
    }, 700 + Math.random() * 400)
  }, [input, thinking])

  const reset = () => {
    setMessages([])
    setInput('')
    setThinking(false)
    setLatestId(null)
    nextId.current = 0
  }

  const handleAction = (page) => { navigate(page); onClose() }
  const onKeyDown    = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="mk-window"
          initial={{ opacity: 0, y: 24, scale: 0.93 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{    opacity: 0, y: 16, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* ── Traffic lights ─────────────────────────────────────────── */}
          <div className="mk-titlebar">
            <button className="traffic-light traffic-light-close" onClick={onClose} />
            <div className="traffic-light traffic-light-minimize" style={{ cursor: 'default' }} />
            <div className="traffic-light traffic-light-maximize" style={{ cursor: 'default' }} />
          </div>

          {/* ── Body ───────────────────────────────────────────────────── */}
          <div className="mk-body">

            <AnimatePresence mode="wait">
              {!inChat ? (
                /* ── Welcome screen ───────────────────────────────────── */
                <motion.div
                  key="welcome"
                  className="flex flex-col flex-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  {/* Avatar */}
                  <img src={mikdadHeadUrl} alt="Mikuda" className="mk-avatar" />

                  {/* Heading */}
                  <h2 className="mk-heading">
                    Hey, I'm <span style={{ color: '#cf0506' }}>Mikuda</span>
                  </h2>

                  {/* Subtitle */}
                  <p className="mk-subtitle">Ask me anything about<br />Mikdad's work</p>

                  {/* Suggestion pills */}
                  <div className="mk-pills">
                    {SUGGESTIONS.map((s) => (
                      <SuggestionPill
                        key={s.label}
                        label={s.label}
                        highlight={s.highlight}
                        onClick={() => sendMessage(s.label)}
                      />
                    ))}
                  </div>
                </motion.div>

              ) : (
                /* ── Chat screen ──────────────────────────────────────── */
                <motion.div
                  key="chat"
                  className="flex flex-col flex-1 min-h-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <div ref={scrollRef} className="mk-messages window-scroll">
                    {messages.map((msg) =>
                      msg.role === 'user' ? (
                        <UserBubble key={msg.id} text={msg.text} />
                      ) : (
                        <AiBubble
                          key={msg.id}
                          text={msg.text}
                          action={msg.action}
                          actionLabel={msg.actionLabel}
                          onAction={handleAction}
                          isLatest={msg.id === latestId}
                        />
                      )
                    )}
                    <AnimatePresence>
                      {thinking && <ThinkingBubble key="thinking" />}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* ── Input bar ──────────────────────────────────────────────── */}
          <div className="mk-input-wrap">
            <button
              className="mk-plus-btn"
              onClick={inChat ? reset : undefined}
              title={inChat ? 'New conversation' : ''}
            >
              <Plus size={14} />
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask anything"
              className="mk-input"
              onMouseDown={(e) => e.stopPropagation()}
            />
            {input.trim() && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="mk-send-btn"
                onClick={() => sendMessage()}
                disabled={thinking}
              >
                <ArrowUp size={13} />
              </motion.button>
            )}
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  )
}
