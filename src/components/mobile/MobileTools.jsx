import { motion } from 'framer-motion'
import TOOLS from '@/data/tools'

function ToolCard({ tool, index, onOpen }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={() => onOpen(tool)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: '20px 12px',
        background: 'var(--window-bg)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        cursor: 'pointer',
        textAlign: 'center',
      }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--social-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src={tool.icon} alt={tool.name} style={{ width: 28, height: 28, objectFit: 'contain' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--headline)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
        {tool.name}
      </span>
    </motion.button>
  )
}

export default function MobileTools({ onOpenTool }) {
  return (
    <div style={{ minHeight: '100svh', padding: '60px 20px 80px' }}>

      {/* Heading */}
      <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--body)', opacity: 0.5, textTransform: 'uppercase' }}>
        Utilities
      </p>
      <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--headline)', fontFamily: "'SF Pro Display', sans-serif" }}>
        Design Tools
      </h1>
      <p style={{ margin: '0 0 28px', fontSize: 14, color: 'var(--body)', opacity: 0.65, lineHeight: 1.6 }}>
        Free tools I built for designers and developers.
      </p>

      {/* 2-col grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {TOOLS.map((tool, i) => (
          <ToolCard key={tool.id} tool={tool} index={i} onOpen={onOpenTool} />
        ))}
      </div>

    </div>
  )
}
