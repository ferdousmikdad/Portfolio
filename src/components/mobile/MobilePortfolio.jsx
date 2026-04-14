import { useState } from 'react'
import { motion } from 'framer-motion'
import allProjects, { CATEGORIES } from '@/data/projects'
import useWindowStore from '@/store/windowStore'

const ALL_PILLS = [
  { id: 'all', label: 'All' },
  ...CATEGORIES.flatMap((c) => c.items),
]

function ProjectCard({ project, onOpen, index }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={() => onOpen(project)}
      style={{
        display: 'block',
        width: '100%',
        background: 'var(--window-bg)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        textAlign: 'left',
        padding: 0,
      }}
    >
      {/* Thumbnail */}
      <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', background: 'var(--border)' }}>
        {project.thumbnailType === 'video' ? (
          <video
            src={project.thumbnail}
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <img
            src={project.thumbnail}
            alt={project.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px 12px' }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--headline)', lineHeight: 1.35, letterSpacing: '-0.01em' }}>
          {project.title}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--body)', opacity: 0.6, textTransform: 'capitalize' }}>
          {project.category?.replace(/-/g, ' ')}
        </p>
      </div>
    </motion.button>
  )
}

export default function MobilePortfolio() {
  const [activeCategory, setActiveCategory] = useState('all')
  const openProjectPreview = useWindowStore((s) => s.openProjectPreview)

  const filtered = activeCategory === 'all'
    ? allProjects
    : allProjects.filter((p) => p.category === activeCategory)

  return (
    <div style={{ minHeight: '100svh', padding: '60px 0 80px' }}>

      {/* Heading */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--body)', opacity: 0.5, textTransform: 'uppercase' }}>
          Work
        </p>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--headline)', fontFamily: "'SF Pro Display', sans-serif" }}>
          Portfolio
        </h1>
      </div>

      {/* Category pills — horizontal scroll */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 20px 16px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {ALL_PILLS.map((pill) => (
          <button
            key={pill.id}
            onClick={() => setActiveCategory(pill.id)}
            style={{
              flexShrink: 0,
              height: 32,
              padding: '0 14px',
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: activeCategory === pill.id ? 'var(--headline)' : 'var(--border)',
              background: activeCategory === pill.id ? 'var(--headline)' : 'transparent',
              color: activeCategory === pill.id ? 'var(--bg)' : 'var(--body)',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Project grid — 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px' }}>
        {filtered.map((project, i) => (
          <ProjectCard
            key={project.id}
            project={project}
            onOpen={openProjectPreview}
            index={i}
          />
        ))}
      </div>

    </div>
  )
}
