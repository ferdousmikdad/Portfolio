import { motion, useAnimationControls } from 'framer-motion'
import { useEffect } from 'react'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'

function FloatingHead() {
  const controls = useAnimationControls()

  useEffect(() => {
    controls.start({
      // top-right → slight hold → top-left → slight hold → back to origin
      x:      [0,   9,   9,  -9,  -9,   0],
      y:      [0, -11, -11,  -9,  -9,   0],
      rotate: [0,   3,   3,  -3,  -3,   0],
      transition: {
        duration: 4.2,
        ease: 'easeInOut',
        times:  [0, 0.28, 0.42, 0.70, 0.84, 1],
        repeat: Infinity,
        repeatType: 'loop',
      },
    })
  }, [controls])

  return (
    <div style={{ position: 'relative', display: 'inline-block', marginBottom: 32 }}>
      {/* Head + bubble move together */}
      <motion.div
        animate={controls}
        style={{ position: 'relative', display: 'inline-block' }}
      >
        <img
          src={mikdadHeadUrl}
          alt="Mikdad"
          style={{ width: 150, height: 150, objectFit: 'contain', display: 'block' }}
        />

        {/* "Hey!" speech bubble — attached to head, rotated 15deg */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 360, damping: 22 }}
          style={{
            position: 'absolute',
            bottom: 28,
            right: -10,
            background: 'var(--dock-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-dock)',
            borderRadius: '10px 10px 10px 3px',
            padding: '5px 12px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
            whiteSpace: 'nowrap',
            transform: 'rotate(30deg)',
          }}
        >
          <span style={{ color: '#cf0506', fontWeight: 700, fontSize: 14, fontFamily: "'SF Pro Display', sans-serif" }}>
            Hey!
          </span>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function MobileHome({ onNav }) {
  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '300px 32px 100px',
      }}
    >

      {/* ── Avatar + Hey bubble ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <FloatingHead />
      </motion.div>

      {/* ── Name ─────────────────────────────────────────────────────── */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.5 }}
        style={{
          margin: '0 0 10px',
          fontSize: 'clamp(32px, 9.5vw, 46px)',
          fontWeight: 500,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          fontFamily: "'SF Pro Display', sans-serif",
        }}
      >
        <span style={{ color: 'var(--headline)' }}>Ferdous Mikdad</span>
      </motion.h1>

      {/* ── Designation ──────────────────────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{
          margin: '0 0 20px',
          fontSize: 21,
          fontWeight: 500,
          color: 'var(--body)',
          letterSpacing: '-0.01em',
        }}
      >
        Creative &amp; UI/UX Designer
      </motion.p>

      {/* ── Description ──────────────────────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.45 }}
        style={{
          margin: '0 0 36px',
          fontSize: 14,
          lineHeight: 1.7,
          color: 'var(--body)',
          opacity: 0.6,
          maxWidth: 300,
        }}
      >
        Designing digital experiences that blend creativity with usability. 5+ years in branding, web, and product design—bringing ideas to life with a sharp eye and a human touch.
      </motion.p>

      {/* ── CTA buttons ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36, duration: 0.4 }}
        style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <button
          onClick={() => onNav('portfolio')}
          style={{
            height: 44,
            padding: '0 26px',
            borderRadius: 100,
            fontSize: 14,
            fontWeight: 600,
            background: 'var(--social-bg)',
            color: 'var(--headline)',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '-0.01em',
            fontFamily: "'SF Pro Display', sans-serif",
          }}
        >
          Portfolio
        </button>
        <button
          onClick={() => onNav('contact')}
          style={{
            height: 44,
            padding: '0 26px',
            borderRadius: 100,
            fontSize: 14,
            fontWeight: 600,
            background: 'var(--social-bg)',
            color: 'var(--headline)',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '-0.01em',
            fontFamily: "'SF Pro Display', sans-serif",
          }}
        >
          Get in Touch
        </button>
      </motion.div>

    </div>
  )
}
