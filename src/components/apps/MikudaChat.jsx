import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { Plus, ArrowUp } from 'lucide-react'
import useWindowStore from '@/store/windowStore'
import useIsMobile from '@/hooks/useIsMobile'
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

// ── Shared helpers ────────────────────────────────────────────────────────────

// Levenshtein edit distance between two strings
function editDist(a, b) {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i])
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[a.length][b.length]
}

// Returns true if the text fuzzy-contains any of the keywords.
// Tolerance: 0 typos for <4-char words, 1 for 4-5 chars, 2 for 6+ chars.
function fuzzy(text, keywords) {
  const tokens = text.split(/\W+/).filter(w => w.length >= 2)
  return keywords.some(kw => {
    if (text.includes(kw)) return true
    const maxD = kw.length < 4 ? 0 : kw.length < 6 ? 1 : 2
    return tokens.some(tok => editDist(tok, kw) <= maxD)
  })
}

// Detects "does/is/has/have/got/any" existence-check phrasing
const isExistenceQ = (t) =>
  /\b(have|has|is|on|use|uses|got|any|does|do you|exist)\b/.test(t)

// Detects email-related words (regex + fuzzy for typos like "emal", "maill", "gmial")
const isEmailQ = (t) =>
  /\b(e?mail|gmail|email[\s-]?(address|id)?|mail[\s]?id)\b/.test(t) ||
  fuzzy(t, ['email', 'gmail', 'mail'])

// Detects phone-related words (regex + fuzzy for "nmbber", "phoen", "watsapp", etc.)
const isPhoneQ = (t) =>
  /\b(phone|mobile|number|cell|call|whatsapp|contact[\s-]?(no|num|number)|mob(ile)?|ph(one)?[\s.]?no?|ring|dial)\b/.test(t) ||
  fuzzy(t, ['phone', 'mobile', 'number', 'whatsapp'])

// Detects any platform name (regex with abbreviations + fuzzy for typos)
const isPlatformQ = (t) =>
  /\b(youtube|yt|facebook|fb|instagram|insta|ig|linkedin|behance|dribbble|drib|adobe|linktree)\b/.test(t) ||
  fuzzy(t, ['youtube', 'facebook', 'instagram', 'linkedin', 'behance', 'dribbble'])

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

  // Arabic logo
  {
    id: 'show-arabic',
    test: (t) =>
      /arabic/.test(t) ||
      (/logo/.test(t) && /arabic|calligraph|arab/.test(t)) ||
      fuzzy(t, ['arabic', 'calligraphy', 'arab']),
    answer: "Here's an Arabic logo from Mikdad's portfolio:",
    mediaCategory: 'arabic-logo',
  },

  // Brand identity
  {
    id: 'show-brand',
    test: (t) =>
      /brand.*(identity|design|project|work|show|see|want|look)/.test(t) ||
      /(show|see|want|look).*(brand|identity)/.test(t) ||
      /\bbranding\b/.test(t) ||
      fuzzy(t, ['brand', 'branding', 'identity']),
    answer: "Here's a brand identity project from Mikdad's portfolio:",
    mediaCategory: 'brand-identity',
  },

  // Logo (generic — after arabic + brand)
  {
    id: 'show-logo',
    test: (t) =>
      /(show|see|want|look|give|display).*(logo)/.test(t) ||
      /(logo).*(show|see|want|look|give|design|work|project)/.test(t) ||
      /^(logo|logos?)$/.test(t.trim()) ||
      (fuzzy(t, ['logo']) && !fuzzy(t, ['arabic', 'brand', 'landing', 'ui', 'ux'])),
    answer: "Here's a logo design by Mikdad:",
    mediaCategory: 'logo',
  },

  // Landing page / UI/UX
  {
    id: 'show-landing',
    test: (t) =>
      /landing.*(page|design|show|see|want)/.test(t) ||
      /(show|see|want|look).*(landing|ui|ux|website|web design)/.test(t) ||
      /\b(landing page|ui design|ux design|web design)\b/.test(t) ||
      fuzzy(t, ['landing', 'webpage']),
    answer: "Here's a landing page design by Mikdad:",
    mediaCategory: 'landing-pages',
  },

  // Next / another / more
  {
    id: 'next',
    test: (t) =>
      /\b(next|another|more|different|else|other)\b/.test(t) ||
      fuzzy(t, ['next', 'another', 'more']),
    isNext: true,
    answer: "Here's another one:",
  },

  // ── Info responses ──────────────────────────────────────────────────────────

  {
    id: 'about',
    test: (t) =>
      (/\b(about mikdad|about ferdous|mikdad|yourself|background|introduce)\b/.test(t) ||
       /who is (mikdad|ferdous|he)/.test(t) ||
       /tell me (about|more) (him|mikdad|ferdous|yourself)/.test(t) ||
       fuzzy(t, ['mikdad'])) &&
      !isPlatformQ(t) && !isEmailQ(t) && !isPhoneQ(t),
    answer: "Mikdad is a UI/UX designer and web developer who specialises in interactive websites, modern UI design, branding, and Arabic logo design. He loves building creative experiences.",
  },
  {
    id: 'skills',
    test: (t) =>
      /\b(skill|expertise|good at|speciali[zs]e|tech|stack|what do you do|what can)\b/.test(t) ||
      fuzzy(t, ['skill', 'skills', 'expertise', 'specialize', 'specialise']),
    answer: "Mikdad's core skills:\n• UI/UX Design\n• Web Development (HTML, CSS, JS, React)\n• Branding & Identity Design\n• Arabic Logo & Calligraphy Design",
  },
  {
    id: 'projects',
    test: (t) =>
      (/\b(project|portfolio|work|built|made|created|example|case study)\b/.test(t) ||
       fuzzy(t, ['project', 'portfolio', 'work'])) &&
      !isPlatformQ(t),
    answer: "Mikdad has built a Pac-Man style interactive portfolio, a macOS-inspired multi-window site, landing pages, UI systems, and branding projects. Want me to show you one?",
    action: 'portfolio',
    actionLabel: 'Open Portfolio →',
  },
  {
    id: 'services',
    test: (t) =>
      /\b(service|offer|provide|package|price|cost|rate|quote|charge)\b/.test(t) ||
      fuzzy(t, ['service', 'price', 'offer', 'package', 'quote']),
    answer: "Mikdad offers:\n• Website design & development\n• UI/UX design\n• Branding & logo design\n• Arabic logo & identity design\n\nOpen to freelance and creative projects.",
  },

  // ── Social links — specific platforms ──────────────────────────────────────

  {
    id: 'link-youtube',
    test: (t) =>
      /\b(youtube|yt)\b/.test(t) ||
      fuzzy(t, ['youtube']),
    answer: (t) => isExistenceQ(t)
      ? "Yes! Mikdad has two YouTube channels. Here they are:"
      : "Here are Mikdad's YouTube channels:",
    socialLinks: true,
    socialFilter: ['YouTube'],
  },
  {
    id: 'link-facebook',
    test: (t) =>
      /\b(facebook|fb)\b/.test(t) ||
      fuzzy(t, ['facebook']),
    answer: (t) => isExistenceQ(t)
      ? "Yes! Mikdad is on Facebook. Here's his profile:"
      : "Here's Mikdad's Facebook:",
    socialLinks: true,
    socialFilter: ['Facebook'],
  },
  {
    id: 'link-instagram',
    test: (t) =>
      /\b(instagram|insta|ig)\b/.test(t) ||
      fuzzy(t, ['instagram']),
    answer: (t) => isExistenceQ(t)
      ? "Yes! Mikdad is on Instagram. Here's his profile:"
      : "Here's Mikdad's Instagram:",
    socialLinks: true,
    socialFilter: ['Instagram'],
  },
  {
    id: 'link-linkedin',
    test: (t) =>
      /\b(linkedin|linked in|lnkd)\b/.test(t) ||
      fuzzy(t, ['linkedin']),
    answer: (t) => isExistenceQ(t)
      ? "Yes! Mikdad is on LinkedIn. Here's his profile:"
      : "Here's Mikdad's LinkedIn:",
    socialLinks: true,
    socialFilter: ['LinkedIn'],
  },
  {
    id: 'link-behance',
    test: (t) =>
      /\bbehance\b/.test(t) ||
      fuzzy(t, ['behance']),
    answer: (t) => isExistenceQ(t)
      ? "Yes! Mikdad has a Behance portfolio. Here it is:"
      : "Here's Mikdad's Behance:",
    socialLinks: true,
    socialFilter: ['Behance'],
  },
  {
    id: 'link-dribbble',
    test: (t) =>
      /\b(dribbble|drib)\b/.test(t) ||
      fuzzy(t, ['dribbble']),
    answer: (t) => isExistenceQ(t)
      ? "Yes! Mikdad is on Dribbble. Here's his profile:"
      : "Here's Mikdad's Dribbble:",
    socialLinks: true,
    socialFilter: ['Dribbble'],
  },
  {
    id: 'link-adobe',
    test: (t) =>
      /\badobe.?(stock)?\b/.test(t) ||
      fuzzy(t, ['adobe', 'stock']),
    answer: (t) => isExistenceQ(t)
      ? "Yes! Mikdad contributes to Adobe Stock. Here's his profile:"
      : "Here's Mikdad's Adobe Stock profile:",
    socialLinks: true,
    socialFilter: ['Adobe Stock'],
  },
  {
    id: 'link-linktree',
    test: (t) =>
      /\blinktree\b/.test(t) ||
      fuzzy(t, ['linktree']),
    answer: (t) => isExistenceQ(t)
      ? "Yes! Mikdad has a Linktree with all his links in one place:"
      : "Here's Mikdad's Linktree (all links in one place):",
    socialLinks: true,
    socialFilter: ['Linktree'],
  },
  // Generic — show all links
  {
    id: 'social',
    test: (t) =>
      /\b(social|follow|links?|profiles?)\b/.test(t) ||
      fuzzy(t, ['social', 'follow', 'profile']),
    answer: "Here are all of Mikdad's links:",
    socialLinks: true,
    socialFilter: null,
  },

  // ── Contact: email only ──────────────────────────────────────────────────────
  {
    id: 'email-only',
    test: (t) => isEmailQ(t) && !isPhoneQ(t),
    answer: (t) =>
      isExistenceQ(t)
        ? "Yes! You can email Mikdad here:"
        : "Here's Mikdad's email address:",
    contactInfo: { email: true },
  },

  // ── Contact: phone only ──────────────────────────────────────────────────────
  {
    id: 'phone-only',
    test: (t) => isPhoneQ(t) && !isEmailQ(t),
    answer: (t) =>
      isExistenceQ(t)
        ? "Yes! Here's Mikdad's phone number:"
        : "Here's Mikdad's phone number:",
    contactInfo: { phone: true },
  },

  // ── Contact: both email + phone ──────────────────────────────────────────────
  {
    id: 'contact-both',
    test: (t) => isEmailQ(t) && isPhoneQ(t),
    answer: "Here are Mikdad's contact details:",
    contactInfo: { email: true, phone: true },
  },

  // ── Contact: general reach / hire / connect ──────────────────────────────────
  {
    id: 'contact',
    test: (t) =>
      (/\b(contact|reach|get in touch|hire|connect|talk|message|work with|collab)\b/.test(t) ||
       fuzzy(t, ['contact', 'reach', 'hire', 'connect', 'collab'])) &&
      !isEmailQ(t) && !isPhoneQ(t),
    answer: "You can reach Mikdad here:",
    contactInfo: { email: true, phone: true },
  },

  // ── Availability / freelance ─────────────────────────────────────────────────
  {
    id: 'availability',
    test: (t) =>
      /\b(available|availability|freelance|free|busy|open for|open to|for hire|taking)\b/.test(t) ||
      fuzzy(t, ['available', 'freelance', 'availability']),
    answer: "Yes! Mikdad is open for freelance and creative projects. Reach him here:",
    contactInfo: { email: true, phone: true },
  },

  // ── Web dev ──────────────────────────────────────────────────────────────────
  {
    id: 'web',
    test: (t) =>
      /\b(web|website|react|html|css|javascript|frontend|develop|code)\b/.test(t) ||
      fuzzy(t, ['website', 'react', 'html', 'javascript', 'frontend', 'develop']),
    answer: "Mikdad builds modern interactive websites with HTML, CSS, JavaScript, and React — focused on smooth UX and creative interactions.",
  },

  // ── UI/UX design ─────────────────────────────────────────────────────────────
  {
    id: 'ux',
    test: (t) =>
      /\b(ux|ui design|ui\/ux|interface design|figma|prototype|wireframe|user experience)\b/.test(t) ||
      /mikdad.*(design|ux|ui)/.test(t) ||
      /(design|ux|ui).*(mikdad|ferdous|his|your|portfolio)/.test(t) ||
      fuzzy(t, ['figma', 'prototype', 'wireframe']),
    answer: "UI/UX design is central to Mikdad's work. He creates intuitive interfaces, prototypes, and complete design systems.",
  },
]

const WORKER_URL = 'https://delicate-lab-1163.mikdadtaqi2024.workers.dev'
const FALLBACK = "I'm here to help! Ask about Mikdad's skills, projects, or say something like \"show me an arabic logo\" or \"show me a landing page\"."

function getResponse(input) {
  const t = input.toLowerCase().trim()
  for (const entry of KB) {
    if (entry.test(t)) {
      return {
        ...entry,
        answer: typeof entry.answer === 'function' ? entry.answer(t) : entry.answer,
      }
    }
  }
  return { answer: FALLBACK, isAiFallback: true }
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
      {/* Text label */}
      {text && (
        <div className="mk-bubble-ai">
          <p className="text-[13px] leading-relaxed mk-bubble-ai-text">
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

  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [thinking,  setThinking]  = useState(false)
  const [latestId,  setLatestId]  = useState(null)

  const dragControls    = useDragControls()
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

    // ── AI fallback — no KB match ──────────────────────────────────────────
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

    // ── KB match — existing simulated delay ───────────────────────────────
    setTimeout(() => {
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
          socialFilter: entry.socialFilter ?? null,
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
          ref={chatRef}
          className="mk-window"
          drag
          dragControls={dragControls}
          dragListener={false}
          dragMomentum={false}
          dragElastic={0}
          initial={{ opacity: 0, y: 24, scale: 0.93 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{    opacity: 0, y: 16, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Titlebar — drag handle on desktop, close icon on mobile */}
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
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <button
                  className="traffic-light traffic-light-close"
                  onClick={onClose}
                  onPointerDown={(e) => e.stopPropagation()}
                />
                <div className="traffic-light traffic-light-minimize" style={{ cursor: 'default' }} />
                <div className="traffic-light traffic-light-maximize" style={{ cursor: 'default' }} />
              </>
            )}
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
                          filter={msg.socialFilter}
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
