import { useState } from 'react'
import { motion } from 'framer-motion'
import mikdadPhoto from '@/assets/images/mikdad.jpg'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'

const socials = [
  { label: 'LinkedIn',  href: 'https://linkedin.com/in/ferdous-mikdad' },
  { label: 'Instagram', href: 'https://instagram.com/mikdad.ferdous' },
  { label: 'Youtube',   href: 'https://youtube.com/@mikdadferdous' },
]

const QA = [
  {
    id: 'who',
    q: 'Who are you?',
    answer: (
      <>
        <img src={mikdadPhoto} alt="Mikdad" className="about-answer-photo" />
      </>
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
        <span className="text-brand font-medium">hello@mikdad.com</span>. Open to freelance
        projects, collaborations, and full-time roles.
      </p>
    ),
  },
]

export default function AboutMeWindow() {
  const [openIds, setOpenIds] = useState(new Set(['who']))
  const [youPos,  setYouPos]  = useState({ x: 0, y: 0, on: false })

  const toggle = (id) =>
    setOpenIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <motion.div
      className="absolute inset-0 overflow-y-auto window-scroll"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onMouseMove={(e) => setYouPos({ x: e.clientX, y: e.clientY, on: true })}
      onMouseLeave={() => setYouPos((p) => ({ ...p, on: false }))}
    >
      <div className="flex flex-col items-center justify-center" style={{ minHeight: '100%', paddingBottom: '80px' }}>
      <div className="w-[440px] flex flex-col">

      {/* ── Header — sticks to top once scrolled ── */}
      <div className="flex-shrink-0 flex flex-col items-center pt-8 pb-5 sticky top-0"
        style={{ boxShadow: '0 1px 0 var(--border)', zIndex: 10 }}
      >
        <div className="relative mb-1">
          <img
            src={mikdadHeadUrl}
            alt="Mikdad"
            className="about-avatar w-24 h-24 object-contain"
          />
          <span className="about-hey-bubble">Hey!</span>
        </div>

        <div className="flex gap-2 flex-wrap justify-center mt-4">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="social-badge"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1">
        <div className="flex flex-col gap-1 py-4">
          {QA.map((item, i) => {
            const isOpen = openIds.has(item.id)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.25 }}
                className="flex flex-col"
              >
                {/* Q row — hugs right */}
                <div className="flex items-center justify-end gap-2 pl-16">
                  <button
                    className="about-minus"
                    onClick={() => toggle(item.id)}
                    aria-label={isOpen ? 'Collapse' : 'Expand'}
                  >
                    {isOpen ? '–' : '+'}
                  </button>
                  <button
                    className="about-q-bubble"
                    onClick={() => toggle(item.id)}
                  >
                    {item.q}
                  </button>
                </div>

                {/* A row — smooth grid expand */}
                <div className={`qa-expand${isOpen ? ' open' : ''}`}>
                  <div className="qa-expand-inner">
                    <div className="flex items-start gap-2 mt-1 pr-16">
                      <img
                        src={mikdadHeadUrl}
                        alt=""
                        className="w-6 h-6 object-contain flex-shrink-0 mt-[2px]"
                      />
                      <div className={item.answer2 ? '' : 'about-a-bubble'}>{item.answer}</div>
                    </div>
                    {item.answer2 && (
                      <div className="flex items-start gap-2 mt-1 pb-1 pr-16">
                        <div className="w-6 flex-shrink-0" />
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

      </div>{/* end w-[440px] col */}
      </div>{/* end centering wrapper */}

      {/* "You" cursor tag */}
      {youPos.on && (
        <div className="you-tag" style={{ left: youPos.x + 14, top: youPos.y + 14 }}>
          You
        </div>
      )}
    </motion.div>
  )
}
