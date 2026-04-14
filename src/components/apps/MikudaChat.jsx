import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ArrowUp } from 'lucide-react'
import useWindowStore from '@/store/windowStore'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'
import allProjects from '@/data/projects'

// ── Contact info ──────────────────────────────────────────────────────────────

const CONTACT = {
  email: 'ferdousmikdad@gmail.com',
  phone: '+880 1303743742',
}

// ── Social links ──────────────────────────────────────────────────────────────

const SOCIAL_LINKS = [
  { label: 'Facebook',    handle: 'ferdousmikdad',       href: 'https://www.facebook.com/ferdousmikdad/',                     icon: 'f',  color: '#1877F2' },
  { label: 'Instagram',   handle: '@ferdousmikdad',      href: 'https://www.instagram.com/ferdousmikdad/',                    icon: '✦',  color: '#E1306C' },
  { label: 'LinkedIn',    handle: 'ferdousmikdad',       href: 'https://www.linkedin.com/in/ferdousmikdad/',                  icon: 'in', color: '#0A66C2' },
  { label: 'YouTube',     handle: '@ferdousmikdad',      href: 'https://www.youtube.com/@ferdousmikdad',                      icon: '▶',  color: '#FF0000' },
  { label: 'YouTube',     handle: '@quickeven_play',     href: 'https://www.youtube.com/@quickeven_play',                     icon: '▶',  color: '#FF0000' },
  { label: 'Dribbble',    handle: 'ferdousmikdad',       href: 'https://dribbble.com/ferdousmikdad/',                         icon: '◉',  color: '#EA4C89' },
  { label: 'Behance',     handle: 'ferdousmikdad',       href: 'https://www.behance.net/ferdousmikdad',                       icon: 'Bē', color: '#1769FF' },
  { label: 'Adobe Stock', handle: 'ferdous',             href: 'https://stock.adobe.com/contributor/211436302/ferdous',       icon: 'A',  color: '#FF0000' },
  { label: 'Linktree',    handle: 'ferdousmikdad',       href: 'https://linktr.ee/ferdousmikdad',                             icon: '⬡',  color: '#43E55E' },
]

// ── Projects by category ──────────────────────────────────────────────────────

const byCategory = (cat) => allProjects.filter((p) => p.category === cat)

// Categories that use random selection instead of sequential
const RANDOM_CATEGORIES = new Set(['landing-pages'])

// ── Knowledge base ────────────────────────────────────────────────────────────
// mediaCategory → show next project image from that category
// isNext        → show next from the last shown category

const KB = [
  // Greetings
  {
    id: 'greeting',
    test: (t) => /^(hi|hello|hey|sup|yo|greetings|howdy)\b/.test(t),
    answer: "Hey! I'm Mikuda, Mikdad's AI assistant. Ask me anything — or ask to see a logo, branding, or landing page!",
  },
  {
    id: 'thanks',
    test: (t) => /\bthank(s| you)\b/.test(t),
    answer: "You're welcome! Want to see more of Mikdad's work?",
  },

  // ── Media requests ──────────────────────────────────────────────────────────

  // Arabic logo — very broad match so natural language works
  {
    id: 'show-arabic',
    test: (t) => /arabic/.test(t) || (/logo/.test(t) && /arabic|calligraph|arab/.test(t)),
    answer: "Here's an Arabic logo from Mikdad's portfolio:",
    mediaCategory: 'arabic-logo',
  },

  // Brand identity
  {
    id: 'show-brand',
    test: (t) =>
      /brand.*(identity|design|project|work|show|see|want|look)/.test(t) ||
      /(show|see|want|look).*(brand|identity)/.test(t) ||
      /\bbranding\b/.test(t),
    answer: "Here's a brand identity project from Mikdad's portfolio:",
    mediaCategory: 'brand-identity',
  },

  // Logo (generic — runs after arabic + brand so it's the fallback logo)
  {
    id: 'show-logo',
    test: (t) =>
      /(show|see|want|look|give).*(logo|logos)/.test(t) ||
      /(logo|logos).*(show|see|want|look|give|design|work|project)/.test(t) ||
      /^(logo|logos)$/.test(t.trim()),
    answer: "Here's a logo design by Mikdad:",
    mediaCategory: 'logo',
  },

  // Landing page / UI
  {
    id: 'show-landing',
    test: (t) =>
      /landing.*(page|design|show|see|want)/.test(t) ||
      /(show|see|want|look).*(landing|ui|ux|website|web design)/.test(t) ||
      /\b(landing page|ui design|ux design|web design)\b/.test(t),
    answer: "Here's a landing page design by Mikdad:",
    mediaCategory: 'landing-pages',
  },

  // "Next / another / more / show me another"
  {
    id: 'next',
    test: (t) => /\b(next|another|more|different|else|other)\b/.test(t),
    isNext: true,
    answer: "Here's another one:",
  },

  // ── Info responses ──────────────────────────────────────────────────────────

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
    test: (t) => /\b(project|portfolio|work|built|made|created|example|case study)\b/.test(t),
    answer: "Mikdad has built a Pac-Man style interactive portfolio, a macOS-inspired multi-window site, landing pages, UI systems, and branding projects. Want me to show you one?",
    action: 'portfolio',
    actionLabel: 'Open Portfolio →',
  },
  {
    id: 'services',
    test: (t) => /\b(service|offer|provide|package|price|cost|rate|quote)\b/.test(t),
    answer: "Mikdad offers:\n• Website design & development\n• UI/UX design\n• Branding & logo design\n• Arabic logo & identity design\n\nOpen to freelance and creative projects.",
  },
  // Social links — any platform name or "social/links/follow"
  {
    id: 'social',
    test: (t) =>
      /\b(facebook|youtube|instagram|linkedin|behance|dribbble|linktree|adobe.?stock|social|follow|links?|profiles?)\b/.test(t),
    answer: "Here are all of Mikdad's links:",
    socialLinks: true,
  },

  // Exact-match: user types ONLY "email"
  {
    id: 'just-email',
    test: (t) => /^e?mail$/.test(t),
    answer: '',
    contactInfo: { email: true },
  },

  // Exact-match: user types ONLY "phone" / "mobile" / "number" / "call"
  {
    id: 'just-phone',
    test: (t) => /^(phone|mobile|number|call|tel)$/.test(t),
    answer: '',
    contactInfo: { phone: true },
  },

  {
    id: 'contact',
    test: (t) => /\b(contact|reach|email|message|talk|connect|get in touch|hire)\b/.test(t),
    answer: "You can reach Mikdad here:",
    contactInfo: { email: true, phone: true },
  },
  {
    id: 'availability',
    test: (t) => /\b(available|availability|freelance|free|busy|open for|open to)\b/.test(t),
    answer: "Yes! Mikdad is open for freelance and creative projects. Reach him here:",
    contactInfo: { email: true, phone: true },
  },
  {
    id: 'web',
    test: (t) => /\b(web|website|react|html|css|javascript|frontend|develop|code)\b/.test(t),
    answer: "Mikdad builds modern interactive websites with HTML, CSS, JavaScript, and React — focused on smooth UX and creative interactions.",
  },
  {
    id: 'ux',
    test: (t) => /\b(ux|ui|design|interface|figma|prototype|wireframe|user experience)\b/.test(t),
    answer: "UI/UX design is central to Mikdad's work. He creates intuitive interfaces, prototypes, and complete design systems.",
  },
]

const FALLBACK = "I'm here to help! Ask about Mikdad's skills, projects, or say something like \"show me an arabic logo\" or \"show me a landing page\"."

function getResponse(input) {
  const t = input.toLowerCase().trim()
  for (const entry of KB) {
    if (entry.test(t)) return entry
  }
  return { answer: FALLBACK }
}

// ── Suggestions ───────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  { label: 'Show me an Arabic logo', highlight: 'Arabic logo' },
  { label: 'Is he available?',        highlight: null },
  { label: 'Show me his projects',    highlight: null },
]

// ── Typing hook ───────────────────────────────────────────────────────────────

function useTyping(text, active, speed = 15) {
  const [displayed, setDisplayed] = useState(active ? '' : (text || ''))
  const [done,      setDone]      = useState(!active)

  useEffect(() => {
    if (!text) { setDisplayed(''); setDone(true); return }
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

// ── Bubbles ───────────────────────────────────────────────────────────────────

function AiBubble({ text, action, actionLabel, onAction, isLatest }) {
  const { displayed, done } = useTyping(text, isLatest)
  const lines = (displayed || '').split('\n')

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

function ImageBubble({ text, project, onOpenProject, isLatest }) {
  const { displayed, done } = useTyping(text, isLatest)
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className="flex flex-col gap-2"
    >
      {/* Text label */}
      {text && (
        <div className="mk-bubble-ai">
          <p className="text-[13px] leading-relaxed" style={{ color: '#e8e5dc' }}>
            {displayed}
            {isLatest && !done && <span className="mk-cursor" />}
          </p>
        </div>
      )}

      {/* Image card — click opens that project's preview */}
      {done && project && (
        <motion.button
          initial={{ opacity: 0, scale: 0.96, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28, delay: 0.08 }}
          className="mk-image-card"
          onClick={() => onOpenProject(project)}
          title={`Open ${project.title}`}
        >
          <div className="mk-image-wrap">
            {!imgLoaded && <div className="mk-image-skeleton" />}
            <img
              src={project.thumbnail}
              alt={project.title}
              className="mk-image"
              style={{ opacity: imgLoaded ? 1 : 0 }}
              onLoad={() => setImgLoaded(true)}
            />
            <div className="mk-image-overlay">
              <span className="mk-image-overlay-label">Open Project</span>
            </div>
          </div>
          <div className="mk-image-footer">
            <span className="mk-image-title">{project.title}</span>
            <span className="mk-image-tag">{project.category}</span>
          </div>
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
        <div className="mk-dots"><span /><span /><span /></div>
      </div>
    </motion.div>
  )
}

function ContactBubble({ text, contactInfo, isLatest }) {
  const { displayed, done } = useTyping(text || '', isLatest && !!text)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      className="flex flex-col gap-2"
    >
      {text && (
        <div className="mk-bubble-ai">
          <p className="text-[13px] leading-relaxed" style={{ color: '#e8e5dc' }}>
            {displayed}
            {isLatest && !done && <span className="mk-cursor" />}
          </p>
        </div>
      )}
      {(!text || done) && (
        <motion.div
          className="mk-contact-chips"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: text ? 0.1 : 0 }}
        >
          {contactInfo.email && (
            <a href={`mailto:${CONTACT.email}`} className="mk-contact-chip" target="_blank" rel="noreferrer">
              <div className="mk-contact-chip-icon">✉</div>
              <div className="flex flex-col">
                <span className="mk-contact-chip-label">Email</span>
                <span className="mk-contact-chip-value">{CONTACT.email}</span>
              </div>
            </a>
          )}
          {contactInfo.phone && (
            <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="mk-contact-chip" target="_blank" rel="noreferrer">
              <div className="mk-contact-chip-icon">📞</div>
              <div className="flex flex-col">
                <span className="mk-contact-chip-label">Phone</span>
                <span className="mk-contact-chip-value">{CONTACT.phone}</span>
              </div>
            </a>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

function SocialBubble({ text, isLatest }) {
  const { displayed, done } = useTyping(text, isLatest)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      className="flex flex-col gap-2"
    >
      <div className="mk-bubble-ai">
        <p className="text-[13px] leading-relaxed" style={{ color: '#e8e5dc' }}>
          {displayed}
          {isLatest && !done && <span className="mk-cursor" />}
        </p>
      </div>
      {done && (
        <motion.div
          className="mk-contact-chips"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          {SOCIAL_LINKS.map((s, i) => (
            <motion.a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="mk-contact-chip"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + i * 0.04 }}
            >
              <div
                className="mk-contact-chip-icon"
                style={{ background: `${s.color}22`, color: s.color, fontSize: 11, fontWeight: 700, letterSpacing: '-0.3px' }}
              >
                {s.icon}
              </div>
              <div className="flex flex-col">
                <span className="mk-contact-chip-label">{s.label}</span>
                <span className="mk-contact-chip-value">{s.handle}</span>
              </div>
            </motion.a>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

function SuggestionPill({ label, highlight, onClick }) {
  if (!highlight) return <button className="mk-pill" onClick={onClick}>{label}</button>
  const [before, after] = label.split(highlight)
  return (
    <button className="mk-pill" onClick={onClick}>
      {before}<span style={{ color: '#cf0506' }}>{highlight}</span>{after}
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MikudaChat({ isOpen, onClose }) {
  const navigate           = useWindowStore((s) => s.navigate)
  const openProjectPreview = useWindowStore((s) => s.openProjectPreview)

  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [thinking,  setThinking]  = useState(false)
  const [latestId,  setLatestId]  = useState(null)

  const scrollRef       = useRef(null)
  const inputRef        = useRef(null)
  const nextId          = useRef(0)
  // Track current index per category so sequential requests cycle through projects
  const categoryIndex   = useRef({})
  // Remember which category was last shown for "next/another" requests
  const lastCategory    = useRef(null)

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
      const entry = getResponse(trimmed)
      const aiId  = nextId.current++

      // Resolve which category to show
      let resolvedCategory = entry.mediaCategory
      if (entry.isNext) resolvedCategory = lastCategory.current

      let project = null
      if (resolvedCategory) {
        const pool = byCategory(resolvedCategory)
        if (pool.length > 0) {
          const isRandom = RANDOM_CATEGORIES.has(resolvedCategory)
          const idx = isRandom
            ? Math.floor(Math.random() * pool.length)
            : (categoryIndex.current[resolvedCategory] ?? 0) % pool.length
          project = pool[idx]
          if (!isRandom) categoryIndex.current[resolvedCategory] = idx + 1
          lastCategory.current = resolvedCategory
        }
      }

      setThinking(false)

      if (project) {
        setMessages((prev) => [...prev, {
          id: aiId,
          role: 'ai',
          type: 'image',
          text: entry.answer || "Here's another one from Mikdad's portfolio:",
          project,
        }])
      } else if (entry.socialLinks) {
        setMessages((prev) => [...prev, {
          id: aiId,
          role: 'ai',
          type: 'social',
          text: entry.answer,
        }])
      } else if (entry.contactInfo) {
        setMessages((prev) => [...prev, {
          id: aiId,
          role: 'ai',
          type: 'contact',
          text: entry.answer || '',
          contactInfo: entry.contactInfo,
        }])
      } else {
        setMessages((prev) => [...prev, {
          id: aiId,
          role: 'ai',
          type: 'text',
          text: entry.answer || FALLBACK,
          action: entry.action,
          actionLabel: entry.actionLabel,
        }])
      }

      setLatestId(aiId)
    }, 600 + Math.random() * 350)
  }, [input, thinking])

  const reset = () => {
    setMessages([])
    setInput('')
    setThinking(false)
    setLatestId(null)
    nextId.current = 0
    categoryIndex.current = {}
    lastCategory.current = null
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
          {/* Traffic lights */}
          <div className="mk-titlebar">
            <button className="traffic-light traffic-light-close" onClick={onClose} />
            <div className="traffic-light traffic-light-minimize" style={{ cursor: 'default' }} />
            <div className="traffic-light traffic-light-maximize" style={{ cursor: 'default' }} />
          </div>

          {/* Body */}
          <div className="mk-body">
            <AnimatePresence mode="wait">
              {!inChat ? (
                <motion.div
                  key="welcome"
                  className="flex flex-col flex-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <img src={mikdadHeadUrl} alt="Mikuda" className="mk-avatar" />
                  <h2 className="mk-heading">
                    Hey, I'm <span style={{ color: '#cf0506' }}>Mikuda</span>
                  </h2>
                  <p className="mk-subtitle">Ask me anything about<br />Mikdad's work</p>
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
                <motion.div
                  key="chat"
                  className="flex flex-col flex-1 min-h-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <div ref={scrollRef} className="mk-messages window-scroll">
                    {messages.map((msg) => {
                      if (msg.role === 'user') return <UserBubble key={msg.id} text={msg.text} />
                      if (msg.type === 'image') return (
                        <ImageBubble
                          key={msg.id}
                          text={msg.text}
                          project={msg.project}
                          onOpenProject={openProjectPreview}
                          isLatest={msg.id === latestId}
                        />
                      )
                      if (msg.type === 'social') return (
                        <SocialBubble
                          key={msg.id}
                          text={msg.text}
                          isLatest={msg.id === latestId}
                        />
                      )
                      if (msg.type === 'contact') return (
                        <ContactBubble
                          key={msg.id}
                          text={msg.text}
                          contactInfo={msg.contactInfo}
                          isLatest={msg.id === latestId}
                        />
                      )
                      return (
                        <AiBubble
                          key={msg.id}
                          text={msg.text}
                          action={msg.action}
                          actionLabel={msg.actionLabel}
                          onAction={handleAction}
                          isLatest={msg.id === latestId}
                        />
                      )
                    })}
                    <AnimatePresence>
                      {thinking && <ThinkingBubble key="thinking" />}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input bar */}
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
