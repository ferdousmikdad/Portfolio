import { useState, useEffect } from 'react'
import allProjects from './projects'

export const CONTACT = {
  email: 'ferdousmikdad@gmail.com',
  phone: '+880 1303743742',
}

export const SOCIAL_LINKS = [
  { label: 'Facebook',    handle: 'ferdousmikdad',   href: 'https://www.facebook.com/ferdousmikdad/',                 icon: 'f',  color: '#1877F2' },
  { label: 'Instagram',   handle: '@ferdousmikdad',  href: 'https://www.instagram.com/ferdousmikdad/',                icon: '✦',  color: '#E1306C' },
  { label: 'LinkedIn',    handle: 'ferdousmikdad',   href: 'https://www.linkedin.com/in/ferdousmikdad/',              icon: 'in', color: '#0A66C2' },
  { label: 'YouTube',     handle: '@ferdousmikdad',  href: 'https://www.youtube.com/@ferdousmikdad',                  icon: '▶',  color: '#FF0000' },
  { label: 'YouTube',     handle: '@quickeven_play', href: 'https://www.youtube.com/@quickeven_play',                 icon: '▶',  color: '#FF0000' },
  { label: 'Dribbble',    handle: 'ferdousmikdad',   href: 'https://dribbble.com/ferdousmikdad/',                     icon: '◉',  color: '#EA4C89' },
  { label: 'Behance',     handle: 'ferdousmikdad',   href: 'https://www.behance.net/ferdousmikdad',                   icon: 'Bē', color: '#1769FF' },
  { label: 'Adobe Stock', handle: 'ferdous',         href: 'https://stock.adobe.com/contributor/211436302/ferdous',   icon: 'A',  color: '#FF0000' },
  { label: 'Linktree',    handle: 'ferdousmikdad',   href: 'https://linktr.ee/ferdousmikdad',                         icon: '⬡',  color: '#43E55E' },
]

export const byCategory = (cat) => allProjects.filter((p) => p.category === cat)
export const RANDOM_CATEGORIES = new Set(['landing-pages'])

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

export function fuzzy(text, keywords) {
  const tokens = text.split(/\W+/).filter(w => w.length >= 2)
  return keywords.some(kw => {
    if (text.includes(kw)) return true
    const maxD = kw.length < 4 ? 0 : kw.length < 6 ? 1 : 2
    return tokens.some(tok => editDist(tok, kw) <= maxD)
  })
}

export const isExistenceQ = (t) =>
  /\b(have|has|is|on|use|uses|got|any|does|do you|exist)\b/.test(t)

export const isEmailQ = (t) =>
  /\b(e?mail|gmail|email[\s-]?(address|id)?|mail[\s]?id)\b/.test(t) ||
  fuzzy(t, ['email', 'gmail', 'mail'])

export const isPhoneQ = (t) =>
  /\b(phone|mobile|number|cell|call|whatsapp|contact[\s-]?(no|num|number)|mob(ile)?|ph(one)?[\s.]?no?|ring|dial)\b/.test(t) ||
  fuzzy(t, ['phone', 'mobile', 'number', 'whatsapp'])

export const isPlatformQ = (t) =>
  /\b(youtube|yt|facebook|fb|instagram|insta|ig|linkedin|behance|dribbble|drib|adobe|linktree)\b/.test(t) ||
  fuzzy(t, ['youtube', 'facebook', 'instagram', 'linkedin', 'behance', 'dribbble'])

export const KB = [
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
  {
    id: 'show-arabic',
    test: (t) =>
      /arabic/.test(t) ||
      (/logo/.test(t) && /arabic|calligraph|arab/.test(t)) ||
      fuzzy(t, ['arabic', 'calligraphy', 'arab']),
    answer: "Here's an Arabic logo from Mikdad's portfolio:",
    mediaCategory: 'arabic-logo',
  },
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
  {
    id: 'next',
    test: (t) =>
      /\b(next|another|more|different|else|other)\b/.test(t) ||
      fuzzy(t, ['next', 'another', 'more']),
    isNext: true,
    answer: "Here's another one:",
  },
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
  {
    id: 'link-youtube',
    test: (t) => /\b(youtube|yt)\b/.test(t) || fuzzy(t, ['youtube']),
    answer: (t) => isExistenceQ(t) ? "Yes! Mikdad has two YouTube channels. Here they are:" : "Here are Mikdad's YouTube channels:",
    socialLinks: true,
    socialFilter: ['YouTube'],
  },
  {
    id: 'link-facebook',
    test: (t) => /\b(facebook|fb)\b/.test(t) || fuzzy(t, ['facebook']),
    answer: (t) => isExistenceQ(t) ? "Yes! Mikdad is on Facebook. Here's his profile:" : "Here's Mikdad's Facebook:",
    socialLinks: true,
    socialFilter: ['Facebook'],
  },
  {
    id: 'link-instagram',
    test: (t) => /\b(instagram|insta|ig)\b/.test(t) || fuzzy(t, ['instagram']),
    answer: (t) => isExistenceQ(t) ? "Yes! Mikdad is on Instagram. Here's his profile:" : "Here's Mikdad's Instagram:",
    socialLinks: true,
    socialFilter: ['Instagram'],
  },
  {
    id: 'link-linkedin',
    test: (t) => /\b(linkedin|linked in|lnkd)\b/.test(t) || fuzzy(t, ['linkedin']),
    answer: (t) => isExistenceQ(t) ? "Yes! Mikdad is on LinkedIn. Here's his profile:" : "Here's Mikdad's LinkedIn:",
    socialLinks: true,
    socialFilter: ['LinkedIn'],
  },
  {
    id: 'link-behance',
    test: (t) => /\bbehance\b/.test(t) || fuzzy(t, ['behance']),
    answer: (t) => isExistenceQ(t) ? "Yes! Mikdad has a Behance portfolio. Here it is:" : "Here's Mikdad's Behance:",
    socialLinks: true,
    socialFilter: ['Behance'],
  },
  {
    id: 'link-dribbble',
    test: (t) => /\b(dribbble|drib)\b/.test(t) || fuzzy(t, ['dribbble']),
    answer: (t) => isExistenceQ(t) ? "Yes! Mikdad is on Dribbble. Here's his profile:" : "Here's Mikdad's Dribbble:",
    socialLinks: true,
    socialFilter: ['Dribbble'],
  },
  {
    id: 'link-adobe',
    test: (t) => /\badobe.?(stock)?\b/.test(t) || fuzzy(t, ['adobe', 'stock']),
    answer: (t) => isExistenceQ(t) ? "Yes! Mikdad contributes to Adobe Stock. Here's his profile:" : "Here's Mikdad's Adobe Stock profile:",
    socialLinks: true,
    socialFilter: ['Adobe Stock'],
  },
  {
    id: 'link-linktree',
    test: (t) => /\blinktree\b/.test(t) || fuzzy(t, ['linktree']),
    answer: (t) => isExistenceQ(t) ? "Yes! Mikdad has a Linktree with all his links in one place:" : "Here's Mikdad's Linktree (all links in one place):",
    socialLinks: true,
    socialFilter: ['Linktree'],
  },
  {
    id: 'social',
    test: (t) => /\b(social|follow|links?|profiles?)\b/.test(t) || fuzzy(t, ['social', 'follow', 'profile']),
    answer: "Here are all of Mikdad's links:",
    socialLinks: true,
    socialFilter: null,
  },
  {
    id: 'email-only',
    test: (t) => isEmailQ(t) && !isPhoneQ(t),
    answer: (t) => isExistenceQ(t) ? "Yes! You can email Mikdad here:" : "Here's Mikdad's email address:",
    contactInfo: { email: true },
  },
  {
    id: 'phone-only',
    test: (t) => isPhoneQ(t) && !isEmailQ(t),
    answer: (t) => isExistenceQ(t) ? "Yes! Here's Mikdad's phone number:" : "Here's Mikdad's phone number:",
    contactInfo: { phone: true },
  },
  {
    id: 'contact-both',
    test: (t) => isEmailQ(t) && isPhoneQ(t),
    answer: "Here are Mikdad's contact details:",
    contactInfo: { email: true, phone: true },
  },
  {
    id: 'contact',
    test: (t) =>
      (/\b(contact|reach|get in touch|hire|connect|talk|message|work with|collab)\b/.test(t) ||
       fuzzy(t, ['contact', 'reach', 'hire', 'connect', 'collab'])) &&
      !isEmailQ(t) && !isPhoneQ(t),
    answer: "You can reach Mikdad here:",
    contactInfo: { email: true, phone: true },
  },
  {
    id: 'availability',
    test: (t) =>
      /\b(available|availability|freelance|free|busy|open for|open to|for hire|taking)\b/.test(t) ||
      fuzzy(t, ['available', 'freelance', 'availability']),
    answer: "Yes! Mikdad is open for freelance and creative projects. Reach him here:",
    contactInfo: { email: true, phone: true },
  },
  {
    id: 'web',
    test: (t) =>
      /\b(web|website|react|html|css|javascript|frontend|develop|code)\b/.test(t) ||
      fuzzy(t, ['website', 'react', 'html', 'javascript', 'frontend', 'develop']),
    answer: "Mikdad builds modern interactive websites with HTML, CSS, JavaScript, and React — focused on smooth UX and creative interactions.",
  },
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

export const WORKER_URL = 'https://delicate-lab-1163.mikdadtaqi2024.workers.dev'
export const FALLBACK = "I'm here to help! Ask about Mikdad's skills, projects, or say something like \"show me an arabic logo\" or \"show me a landing page\"."

export function getResponse(input) {
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

export const SUGGESTIONS = [
  { label: 'Show me an Arabic logo', highlight: 'Arabic logo' },
  { label: 'Is he available?',       highlight: null },
  { label: 'Show me his projects',   highlight: null },
]

export function useTyping(text, active, speed = 15) {
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
