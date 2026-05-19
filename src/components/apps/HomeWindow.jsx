import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ArrowUp, Search } from 'lucide-react'
import useWindowStore from '@/store/windowStore'
import Window from '@/components/window/Window'
import WindowControls from '@/components/window/WindowControls'
import mikdadPhoto from '@/assets/images/mikdad.jpg'
import {
  CONTACT, SOCIAL_LINKS, WORKER_URL, FALLBACK,
  getResponse, useTyping, byCategory, RANDOM_CATEGORIES,
} from '@/data/mikudaAI'

// ── Pre-set suggestions (shown on input focus) ────────────────────────────────

const INPUT_SUGGESTIONS = [
  'Who is Mikdad?',
  'What are his skills?',
  'Is he available for freelance?',
  'Show me an Arabic logo',
  'Show me his projects',
  'How can I contact him?',
]

// ── Sidebar social links ──────────────────────────────────────────────────────

const SIDEBAR_SOCIALS = [
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/ferdousmikdad/', icon: 'in', color: '#0A66C2' },
  { label: 'Behance',   href: 'https://www.behance.net/ferdousmikdad',       icon: 'Bē', color: '#1769FF' },
  { label: 'Dribbble',  href: 'https://dribbble.com/ferdousmikdad/',         icon: '◉',  color: '#EA4C89' },
  { label: 'Instagram', href: 'https://www.instagram.com/ferdousmikdad/',   icon: '✦',  color: '#E1306C' },
]

// ── Bubble components ─────────────────────────────────────────────────────────

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
      <div className="hw-bubble-ai">
        <p className="hw-bubble-text">
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
      {text && (
        <div className="hw-bubble-ai">
          <p className="hw-bubble-text">
            {displayed}
            {isLatest && !done && <span className="mk-cursor" />}
          </p>
        </div>
      )}
      {done && project && (
        <motion.button
          initial={{ opacity: 0, scale: 0.96, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28, delay: 0.08 }}
          className="hw-image-card"
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
          </div>
          <div className="mk-image-footer">
            <span className="mk-image-title">{project.title}</span>
            <span style={{ fontSize: 10, color: 'var(--body)', fontWeight: 500 }}>{project.category}</span>
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
      <div className="hw-bubble-user">
        <p className="hw-bubble-text">{text}</p>
      </div>
    </motion.div>
  )
}

function ThinkingBubble() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="hw-bubble-ai">
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
        <div className="hw-bubble-ai">
          <p className="hw-bubble-text">
            {displayed}
            {isLatest && !done && <span className="mk-cursor" />}
          </p>
        </div>
      )}
      {(!text || done) && (
        <motion.div className="mk-contact-chips" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: text ? 0.1 : 0 }}>
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

function SocialBubble({ text, filter, isLatest }) {
  const { displayed, done } = useTyping(text, isLatest)
  const links = filter ? SOCIAL_LINKS.filter((s) => filter.includes(s.label)) : SOCIAL_LINKS

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      className="flex flex-col gap-2"
    >
      <div className="hw-bubble-ai">
        <p className="hw-bubble-text">
          {displayed}
          {isLatest && !done && <span className="mk-cursor" />}
        </p>
      </div>
      {done && (
        <motion.div className="mk-contact-chips" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          {links.map((s, i) => (
            <motion.a
              key={s.href} href={s.href} target="_blank" rel="noreferrer"
              className="mk-contact-chip"
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + i * 0.04 }}
            >
              <div className="mk-contact-chip-icon" style={{ background: `${s.color}22`, color: s.color, fontSize: 11, fontWeight: 700, letterSpacing: '-0.3px' }}>
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

// ── Chat panel (right side) ───────────────────────────────────────────────────

function ChatPanel() {
  const navigate           = useWindowStore((s) => s.navigate)
  const openProjectPreview = useWindowStore((s) => s.openProjectPreview)

  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [thinking,  setThinking]  = useState(false)
  const [latestId,  setLatestId]  = useState(null)
  const [focused,   setFocused]   = useState(false)

  const scrollRef     = useRef(null)
  const inputRef      = useRef(null)
  const nextId        = useRef(0)
  const categoryIndex = useRef({})
  const lastCategory  = useRef(null)

  const inChat = messages.length > 0

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 200)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const mo = new MutationObserver(() => { el.scrollTop = el.scrollHeight })
    mo.observe(el, { childList: true, subtree: true, characterData: true })
    return () => mo.disconnect()
  }, [])

  const sendMessage = useCallback(async (text) => {
    const trimmed = typeof text === 'string' ? text.trim() : input.trim()
    if (!trimmed || thinking) return

    const uid = nextId.current++
    setMessages((prev) => [...prev, { id: uid, role: 'user', text: trimmed }])
    setInput('')
    setThinking(true)

    const entry = getResponse(trimmed)

    if (entry.isAiFallback) {
      try {
        const res  = await fetch(`${WORKER_URL}/mikuda`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed }),
        })
        const data = await res.json()
        const aiId = nextId.current++
        setThinking(false)
        setMessages((prev) => [...prev, { id: aiId, role: 'ai', type: 'text', text: data.reply || FALLBACK }])
        setLatestId(aiId)
      } catch {
        const aiId = nextId.current++
        setThinking(false)
        setMessages((prev) => [...prev, { id: aiId, role: 'ai', type: 'text', text: FALLBACK }])
        setLatestId(aiId)
      }
      return
    }

    setTimeout(() => {
      const aiId = nextId.current++

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
        setMessages((prev) => [...prev, { id: aiId, role: 'ai', type: 'image', text: entry.answer || "Here's another one:", project }])
      } else if (entry.socialLinks) {
        setMessages((prev) => [...prev, { id: aiId, role: 'ai', type: 'social', text: entry.answer, socialFilter: entry.socialFilter ?? null }])
      } else if (entry.contactInfo) {
        setMessages((prev) => [...prev, { id: aiId, role: 'ai', type: 'contact', text: entry.answer || '', contactInfo: entry.contactInfo }])
      } else {
        setMessages((prev) => [...prev, { id: aiId, role: 'ai', type: 'text', text: entry.answer || FALLBACK, action: entry.action, actionLabel: entry.actionLabel }])
      }

      setLatestId(aiId)
    }, 600 + Math.random() * 350)
  }, [input, thinking])

  const reset = () => {
    setMessages([]); setInput(''); setThinking(false); setLatestId(null)
    nextId.current = 0; categoryIndex.current = {}; lastCategory.current = null
  }

  const handleAction = (page) => navigate(page)
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  // Refocus input after transition between welcome ↔ chat
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 240)
    return () => clearTimeout(t)
  }, [inChat])

  const showSuggestions = focused && !input.trim() && !inChat

  const inputBar = (
    <div className="hw-input-row" style={{ position: 'relative' }}>
      {/* Suggestion dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            className="hw-suggest-dropdown"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          >
            {INPUT_SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="hw-suggest-item"
                onMouseDown={() => { setFocused(false); sendMessage(s) }}
              >
                <Search size={12} className="hw-suggest-icon" />
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hw-input-bar">
        <button className="mk-plus-btn" onClick={inChat ? reset : undefined} title={inChat ? 'New conversation' : ''}>
          <Plus size={14} />
        </button>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Ask me anything about Mikdad…"
          className="hw-input"
          onMouseDown={(e) => e.stopPropagation()}
        />
        <AnimatePresence>
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
        </AnimatePresence>
      </div>
    </div>
  )

  return (
    <div className="hw-chat-panel">
      <AnimatePresence mode="wait">

        {/* ── Welcome: input perfectly centred ── */}
        {!inChat && (
          <motion.div
            key="welcome"
            className="hw-welcome-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <div className="hw-welcome-text">
              <h1 className="hw-welcome-heading">
                Hey, I'm <span style={{ color: '#cf0506' }}>Mikuda</span>
              </h1>
              <p className="hw-welcome-sub">
                Ask me anything about Mikdad's work, skills, or projects.
              </p>
            </div>
            <motion.div
              style={{ width: '100%' }}
              animate={{ paddingLeft: input ? 0 : 40, paddingRight: input ? 0 : 40 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              {inputBar}
            </motion.div>
          </motion.div>
        )}

        {/* ── Chat: messages above, input at bottom ── */}
        {inChat && (
          <motion.div
            key="chat"
            className="hw-chat-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div ref={scrollRef} className="hw-messages window-scroll">
              {messages.map((msg) => {
                if (msg.role === 'user') return <UserBubble key={msg.id} text={msg.text} />
                if (msg.type === 'image') return <ImageBubble key={msg.id} text={msg.text} project={msg.project} onOpenProject={openProjectPreview} isLatest={msg.id === latestId} />
                if (msg.type === 'social') return <SocialBubble key={msg.id} text={msg.text} filter={msg.socialFilter} isLatest={msg.id === latestId} />
                if (msg.type === 'contact') return <ContactBubble key={msg.id} text={msg.text} contactInfo={msg.contactInfo} isLatest={msg.id === latestId} />
                return <AiBubble key={msg.id} text={msg.text} action={msg.action} actionLabel={msg.actionLabel} onAction={handleAction} isLatest={msg.id === latestId} />
              })}
              <AnimatePresence>
                {thinking && <ThinkingBubble key="thinking" />}
              </AnimatePresence>
            </div>
            {inputBar}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function HomeWindow() {
  const sidebarContent = ({ onClose, onMinimize, onMaximize }) => (
    <div style={{ width: 220, padding: '6px 0 6px 6px', height: '100%', boxSizing: 'border-box' }}>
      <div
        style={{
          background: '#1B1B1B',
          border: '1px solid #404040',
          borderRadius: 18,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Traffic lights */}
        <div style={{ height: 40, display: 'flex', alignItems: 'center', padding: '0 12px', flexShrink: 0 }}>
          <WindowControls onClose={onClose} onMinimize={onMinimize} onMaximize={onMaximize} />
        </div>

        {/* Profile content */}
        <div className="hw-sidebar-scroll">
          <img src={mikdadPhoto} alt="Mikdad" className="hw-profile-photo" draggable={false} />

          <p className="hw-profile-name">Ferdous Mikdad</p>
          <p className="hw-profile-role">UI/UX Designer &amp; Web Developer</p>

          <span className="hw-available-badge">
            <span className="hw-available-dot" />
            Available for projects
          </span>

          <div className="hw-sidebar-divider" />

          <p className="hw-sidebar-bio">
            Designing digital experiences that blend creativity with usability. 5+ years in branding, web design, and creative development.
          </p>

          <div className="hw-social-links">
            {SIDEBAR_SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="hw-social-icon-btn" title={s.label}
                style={{ background: `${s.color}18`, color: s.color }}>
                {s.icon}
              </a>
            ))}
            <a href={`mailto:${CONTACT.email}`} className="hw-social-icon-btn" title="Email me"
              style={{ background: 'rgba(207,5,6,0.12)', color: '#cf0506' }}>
              ✉
            </a>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Window id="home" title="Mikuda" sidebarContent={sidebarContent} hideTitleBar={false}>
      <ChatPanel />
    </Window>
  )
}
