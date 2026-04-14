import { motion } from 'framer-motion'
import TOOLS from '@/data/tools'

function ToolCard({ tool, index }) {
  return (
    <motion.a
      href={tool.url}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: '20px 12px',
        background: 'var(--window-bg)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        textDecoration: 'none',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'var(--social-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <img
          src={tool.icon}
          alt={tool.name}
          style={{ width: 28, height: 28, objectFit: 'contain' }}
        />
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--headline)',
          textAlign: 'center',
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
        }}
      >
        {tool.name}
      </span>
    </motion.a>
  )
}

export default function MobileTools() {
  return (
    <section id="m-tools" style={{ padding: '64px 20px' }}>
      {/* Label */}
      <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--body)', opacity: 0.5, textTransform: 'uppercase' }}>
        Utilities
      </p>
      <h2
        style={{
          margin: '0 0 8px',
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--headline)',
          fontFamily: "'SF Pro Display', sans-serif",
        }}
      >
        Design Tools
      </h2>
      <p style={{ margin: '0 0 28px', fontSize: 14, color: 'var(--body)', opacity: 0.65, lineHeight: 1.6 }}>
        Free tools I built for designers and developers.
      </p>

      {/* 2-col grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        {TOOLS.map((tool, i) => (
          <ToolCard key={tool.id} tool={tool} index={i} />
        ))}
      </div>
    </section>
  )
}
