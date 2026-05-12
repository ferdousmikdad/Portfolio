import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'

const STORAGE_KEY = 'portfolio-welcomed-v1'
const TEXT = "This portfolio is built like a macOS desktop — it looks and feels best in full screen. Click \"Fit Window\" to enter full screen, or press Esc at any time to exit."

export default function WelcomeModal() {
  const [show,     setShow]     = useState(false)
  const [displayed,setDisplayed]= useState('')
  const [typeDone, setTypeDone] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem(STORAGE_KEY)) setShow(true)
  }, [])

  useEffect(() => {
    if (!show) return
    setDisplayed(''); setTypeDone(false)
    let i = 0
    const wait = setTimeout(() => {
      const id = setInterval(() => {
        i++
        setDisplayed(TEXT.slice(0, i))
        if (i >= TEXT.length) { clearInterval(id); setTypeDone(true) }
      }, 22)
      return () => clearInterval(id)
    }, 500)
    return () => clearTimeout(wait)
  }, [show])

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1')
    setShow(false)
  }

  const fitWindow = () => {
    document.documentElement.requestFullscreen?.().catch(() => {})
    dismiss()
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.94,  y: -12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30, delay: 0.06 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position:             'relative',
              width:                 380,
              padding:              '44px 36px 32px',
              background:           'rgba(22,22,22,0.94)',
              border:               '1px solid rgba(255,255,255,0.10)',
              borderRadius:          24,
              backdropFilter:       'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              boxShadow:            '0 40px 100px rgba(0,0,0,0.55)',
              textAlign:            'center',
            }}
          >
            {/* Close button */}
            <button
              onClick={dismiss}
              style={{
                position: 'absolute', top: 14, right: 14,
                width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.45)',
                cursor: 'pointer',
                fontSize: 16,
                lineHeight: 1,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
            >
              ×
            </button>

            {/* Avatar + "Hey" background */}
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <span style={{
                fontSize: 80, fontWeight: 800, lineHeight: 1,
                color: 'rgba(255,255,255,0.05)',
                fontFamily: "'SF Pro Display'",
                letterSpacing: -3,
                userSelect: 'none',
                pointerEvents: 'none',
              }}>
                Hey
              </span>
              <img
                src={mikdadHeadUrl}
                alt="Mikdad"
                style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 60, height: 60,
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* Typewriting text */}
            <p style={{
              fontSize: 13.5,
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.65)',
              fontFamily: "'SF Pro Text'",
              marginBottom: 28,
              minHeight: 72,
            }}>
              {displayed}
              {!typeDone && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                  style={{ display: 'inline-block', width: 1.5, height: '1em', background: 'rgba(255,255,255,0.5)', verticalAlign: 'text-bottom', marginLeft: 2 }}
                />
              )}
            </p>

            {/* Fit Window button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={fitWindow}
              style={{
                width: '100%', padding: '12px 0',
                background: '#cf0506',
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                fontSize: 13.5,
                fontWeight: 600,
                fontFamily: "'SF Pro Display'",
                cursor: 'pointer',
                letterSpacing: 0.2,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              Fit Window
            </motion.button>

            {/* Skip hint */}
            <p style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: "'SF Pro Text'" }}>
              or press Esc to skip
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
