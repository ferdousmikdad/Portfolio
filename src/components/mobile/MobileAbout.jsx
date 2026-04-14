import { useState } from 'react'
import { motion } from 'framer-motion'
import mikdadPhoto from '@/assets/images/mikdad.jpg'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'

const SOCIALS = [
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/ferdousmikdad/' },
  { label: 'Instagram', href: 'https://www.instagram.com/ferdousmikdad/' },
  { label: 'YouTube',   href: 'https://www.youtube.com/@ferdousmikdad' },
  { label: 'Email',     href: 'mailto:ferdousmikdad@gmail.com' },
]

const QA = [
  {
    id: 'who',
    q: 'Who are you?',
    answer: (
      <img src={mikdadPhoto} alt="Mikdad" className="about-answer-photo" />
    ),
    answer2: (
      <p>
        I'm <span className="text-brand font-medium">Ferdous Mikdad</span>, a designer &amp;
        developer building simple, usable digital products.
      </p>
    ),
  },
  {
    id: 'what',
    q: 'What do you do?',
    answer: (
      <p>
        UI/UX design, branding, motion design, and front-end development. I turn complex
        problems into clean, intuitive interfaces.
      </p>
    ),
  },
  {
    id: 'bg',
    q: "What's your background?",
    answer: (
      <p>
        5+ years in design. Started with print &amp; branding, moved into digital products.
        Self-taught developer — comfortable from Figma to React.
      </p>
    ),
  },
  {
    id: 'tools',
    q: 'What tools do you use?',
    answer: (
      <p>
        Figma, After Effects, Framer, React, Tailwind. Also into generative tools and
        building my own design utilities.
      </p>
    ),
  },
  {
    id: 'work',
    q: 'Want to work together?',
    answer: (
      <p>
        Reach out at{' '}
        <span className="text-brand font-medium">ferdousmikdad@gmail.com</span>. Open to
        freelance projects, collaborations, and full-time roles.
      </p>
    ),
  },
]

export default function MobileAbout() {
  const [openIds, setOpenIds] = useState(new Set(['who']))

  const toggle = (id) =>
    setOpenIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div style={{ minHeight: '100svh', padding: '60px 0 80px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 24, marginBottom: 8, borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <img
              src={mikdadHeadUrl}
              alt="Mikdad"
              className="about-avatar"
              style={{ width: 80, height: 80, objectFit: 'contain' }}
            />
            <span className="about-hey-bubble">Hey!</span>
          </div>

          <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--body)', opacity: 0.5, textTransform: 'uppercase' }}>
            @ferdousmikdad
          </p>
          <h1 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--headline)', fontFamily: "'SF Pro Display', sans-serif" }}>
            About Me
          </h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="social-badge">
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Q&A conversation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 16 }}>
          {QA.map((item, i) => {
            const isOpen = openIds.has(item.id)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                {/* Question (right-aligned) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, paddingLeft: 48 }}>
                  <button className="about-minus" onClick={() => toggle(item.id)}>
                    {isOpen ? '–' : '+'}
                  </button>
                  <button className="about-q-bubble" onClick={() => toggle(item.id)}>
                    {item.q}
                  </button>
                </div>

                {/* Answer (left-aligned, collapsible) */}
                <div className={`qa-expand${isOpen ? ' open' : ''}`}>
                  <div className="qa-expand-inner">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 6, paddingRight: 48 }}>
                      <img
                        src={mikdadHeadUrl}
                        alt=""
                        style={{ width: 24, height: 24, objectFit: 'contain', flexShrink: 0, marginTop: 2 }}
                      />
                      <div className={item.answer2 ? '' : 'about-a-bubble'}>{item.answer}</div>
                    </div>
                    {item.answer2 && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 4, paddingBottom: 4, paddingRight: 48 }}>
                        <div style={{ width: 24, flexShrink: 0 }} />
                        <div className="about-a-bubble">{item.answer2}</div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
