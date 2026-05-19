import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { Plus, ArrowUp } from 'lucide-react'
import useWindowStore from '@/store/windowStore'
import useIsMobile from '@/hooks/useIsMobile'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'
import {
  CONTACT, SOCIAL_LINKS, WORKER_URL, FALLBACK, SUGGESTIONS,
  getResponse, useTyping, byCategory, RANDOM_CATEGORIES,
} from '@/data/mikudaAI'

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
        <p className="text-[13px] leading-relaxed mk-bubble-ai-text">
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
        <div className="mk-bubble-ai">
          <p className="text-[13px] leading-relaxed mk-bubble-ai-text">
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
          <p className="text-[13px] leading-relaxed mk-bubble-ai-text">
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
      <div className="mk-bubble-ai">
        <p className="text-[13px] leading-relaxed mk-bubble-ai-text">
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
          {links.map((s, i) => (
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

export default function MikudaChat({ isOpen, onClose, chatRef }) {
  const navigate           = useWindowStore((s) => s.navigate)
  const openProjectPreview = useWindowStore((s) => s.openProjectPreview)
  const isMobile           = useIsMobile()

  const [messages,     setMessages]     = useState([])
  const [input,        setInput]        = useState('')
  const [thinking,     setThinking]     = useState(false)
  const [latestId,     setLatestId]     = useState(null)
  const [keyboardBase, setKeyboardBase] = useState(0)

  const dragControls  = useDragControls()
  const scrollRef     = useRef(null)
  const inputRef      = useRef(null)
  const nextId        = useRef(0)
  const categoryIndex = useRef({})
  const lastCategory  = useRef(null)

  const inChat = messages.length > 0

  useEffect(() => {
    if (isOpen && !isMobile) setTimeout(() => inputRef.current?.focus(), 150)
  }, [isOpen, isMobile])

  useEffect(() => {
    if (!isMobile || !isOpen) { setKeyboardBase(0); return }
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      const kh = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setKeyboardBase(kh)
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      setKeyboardBase(0)
    }
  }, [isMobile, isOpen])

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
        setMessages((prev) => [...prev, { id: aiId, role: 'ai', type: 'image', text: entry.answer || "Here's another one from Mikdad's portfolio:", project }])
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
          ref={chatRef}
          className="mk-window"
          drag={!isMobile}
          dragControls={dragControls}
          dragListener={false}
          dragMomentum={false}
          dragElastic={0}
          initial={{ opacity: 0, y: 24, scale: 0.93 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{    opacity: 0, y: 16, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          onMouseDown={(e) => e.stopPropagation()}
          style={isMobile && keyboardBase > 0 ? { bottom: keyboardBase + 8 } : undefined}
        >
          <div
            className="mk-titlebar"
            onPointerDown={(e) => { e.preventDefault(); dragControls.start(e) }}
            style={{ cursor: isMobile ? 'default' : 'grab' }}
          >
            {isMobile ? (
              <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
                <button
                  onClick={onClose}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 4 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <button className="traffic-light traffic-light-close" onClick={onClose} onPointerDown={(e) => e.stopPropagation()} />
                <div className="traffic-light traffic-light-minimize" style={{ cursor: 'default' }} />
                <div className="traffic-light traffic-light-maximize" style={{ cursor: 'default' }} />
              </>
            )}
          </div>

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
                        <ImageBubble key={msg.id} text={msg.text} project={msg.project} onOpenProject={openProjectPreview} isLatest={msg.id === latestId} />
                      )
                      if (msg.type === 'social') return (
                        <SocialBubble key={msg.id} text={msg.text} filter={msg.socialFilter} isLatest={msg.id === latestId} />
                      )
                      if (msg.type === 'contact') return (
                        <ContactBubble key={msg.id} text={msg.text} contactInfo={msg.contactInfo} isLatest={msg.id === latestId} />
                      )
                      return (
                        <AiBubble key={msg.id} text={msg.text} action={msg.action} actionLabel={msg.actionLabel} onAction={handleAction} isLatest={msg.id === latestId} />
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

          <div className="mk-input-wrap">
            <button className="mk-plus-btn" onClick={inChat ? reset : undefined} title={inChat ? 'New conversation' : ''}>
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
