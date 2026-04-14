import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import mikdadPhoto from '@/assets/images/mikdad.jpg'

const QA = [
  {
    id: 'who',
    q: 'Who are you?',
    a: "I'm Ferdous Mikdad, a designer & developer building simple, usable digital products.",
  },
  {
    id: 'what',
    q: 'What do you do?',
    a: 'UI/UX design, branding, motion design, and front-end development. I turn complex problems into clean, intuitive interfaces.',
  },
  {
    id: 'bg',
    q: "What's your background?",
    a: '5+ years in design. Started with print & branding, moved into digital products. Self-taught developer — comfortable from Figma to React.',
  },
  {
    id: 'tools',
    q: 'What tools do you use?',
    a: 'Figma, After Effects, Framer, React, Tailwind. Also into generative tools and building my own design utilities.',
  },
  {
    id: 'work',
    q: 'Want to work together?',
    a: 'Reach out at ferdousmikdad@gmail.com. Open to freelance projects, collaborations, and full-time roles.',
  },
]

function QAItem({ item, isOpen, onToggle }) {
  return (
    <div
      style={{
        borderBottom: '1px solid var(--border)',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--headline)',
            letterSpacing: '-0.01em',
          }}
        >
          {item.q}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            flexShrink: 0,
            fontSize: 20,
            lineHeight: 1,
            color: 'var(--body)',
            display: 'block',
          }}
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <p
              style={{
                margin: '0 0 16px',
                fontSize: 14,
                lineHeight: 1.7,
                color: 'var(--body)',
              }}
            >
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function MobileAbout() {
  const [openId, setOpenId] = useState('who')

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id))

  return (
    <section id="m-about" style={{ padding: '64px 20px' }}>
      {/* Label */}
      <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--body)', opacity: 0.5, textTransform: 'uppercase' }}>
        About
      </p>
      <h2
        style={{
          margin: '0 0 32px',
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--headline)',
          fontFamily: "'SF Pro Display', sans-serif",
        }}
      >
        Who I Am
      </h2>

      {/* Photo + intro */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 32,
          padding: 16,
          background: 'var(--window-bg)',
          border: '1px solid var(--border)',
          borderRadius: 16,
        }}
      >
        <img
          src={mikdadPhoto}
          alt="Ferdous Mikdad"
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
            border: '2px solid var(--border)',
          }}
        />
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--headline)', letterSpacing: '-0.01em' }}>
            Ferdous Mikdad
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--body)', opacity: 0.7 }}>
            UI/UX Designer &amp; Developer
          </p>
        </div>
      </div>

      {/* Q&A accordion */}
      {QA.map((item) => (
        <QAItem
          key={item.id}
          item={item}
          isOpen={openId === item.id}
          onToggle={() => toggle(item.id)}
        />
      ))}
    </section>
  )
}
