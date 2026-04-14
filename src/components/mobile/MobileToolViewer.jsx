import { motion } from 'framer-motion'
import { useEffect } from 'react'

export default function MobileToolViewer({ tool, onClose }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: 'spring', stiffness: 340, damping: 32 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          background: '#ffffff',
          flexShrink: 0,
          minHeight: 52,
        }}
      >
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.1)',
            background: 'transparent',
            fontSize: 13,
            fontWeight: 500,
            color: '#1c1c1e',
            cursor: 'pointer',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>

        <span style={{ fontSize: 14, fontWeight: 600, color: '#1c1c1e', letterSpacing: '-0.01em' }}>
          {tool.name}
        </span>

        {/* Spacer to center title */}
        <div style={{ width: 72 }} />
      </div>

      {/* Tool iframe */}
      <iframe
        src={tool.url}
        title={tool.name}
        style={{ flex: 1, border: 'none', width: '100%', display: 'block' }}
        allow="clipboard-write"
      />
    </motion.div>
  )
}
