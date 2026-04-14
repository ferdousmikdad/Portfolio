import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

// Render one content item — image or video
function ContentItem({ item, title, index }) {
  if (item.type === 'video') {
    return (
      <video
        src={item.url}
        autoPlay
        muted
        loop
        playsInline
        style={{ display: 'block', width: '100%', height: 'auto' }}
      />
    )
  }
  return (
    <img
      src={item.url}
      alt={`${title} ${index + 1}`}
      style={{ display: 'block', width: '100%', height: 'auto' }}
      draggable={false}
    />
  )
}

export default function ProjectPreviewWindow({ project, onClose, isMobile = false }) {
  const scrollRef   = useRef(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Reset scroll + copied state when project changes
  useEffect(() => {
    if (project && scrollRef.current) scrollRef.current.scrollTop = 0
    setCopied(false)
  }, [project])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  // Resolve content array
  const contentItems = (() => {
    if (project?.content && project.content.length > 0) return project.content
    const fallback = project?.preview || project?.image
    if (fallback) return [{ url: fallback, type: 'image' }]
    return []
  })()

  const stopProp = (e) => e.stopPropagation()

  return (
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop */}
          <motion.div
            key="preview-backdrop"
            className="fixed inset-0"
            style={{ background: 'rgba(0,0,0,0.72)', zIndex: 99998, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', pointerEvents: 'all' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="preview-panel"
            className="fixed"
            style={{
              top: isMobile ? 0 : 28, left: 0, right: 0, bottom: 0,
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              background: 'var(--preview-bg)',
              borderTop: '1px solid var(--border)',
              pointerEvents: 'all',
            }}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            onMouseDown={stopProp}
            onClick={stopProp}
          >

            {/* ── Title bar ───────────────────────────────────────────────── */}
            <div
              className="flex-shrink-0 flex items-center gap-1.5 px-4"
              style={{ height: 40, borderBottom: '1px solid var(--border)', background: 'var(--titlebar-bg)' }}
            >
              <button className="traffic-light traffic-light-close" onClick={onClose} title="Close (Esc)" />
              <div className="traffic-light traffic-light-minimize" style={{ opacity: 0.28, cursor: 'default' }} />
              <div className="traffic-light traffic-light-maximize" style={{ opacity: 0.28, cursor: 'default' }} />
            </div>

            {/* ── Scrollable content ───────────────────────────────────────── */}
            <div
              ref={scrollRef}
              className="window-scroll"
              style={{ flex: '1 1 0', minHeight: 0, overflowY: 'auto', overflowX: 'hidden', background: 'var(--preview-bg)' }}
            >
              <div style={{ maxWidth: 1140, margin: '0 auto' }}>

                {/* ── Header — centered title, subtitle, buttons ── */}
                <div
                  className="flex flex-col items-center text-center px-8 gap-4"
                  style={{ paddingTop: 56, paddingBottom: 32 }}
                >
                  {/* Title */}
                  <h1
                    style={{
                      margin: 0,
                      fontSize: 32,
                      fontWeight: 700,
                      lineHeight: 1.25,
                      letterSpacing: '-0.02em',
                      color: 'var(--headline)',
                      fontFamily: "'SF Pro Display', sans-serif",
                      maxWidth: 720,
                    }}
                  >
                    {project.title}
                  </h1>

                  {/* Subtitle */}
                  {project.subtitle && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        lineHeight: 1.65,
                        color: 'var(--body)',
                        opacity: 0.65,
                        maxWidth: 640,
                      }}
                    >
                      {project.subtitle}
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={handleShare}
                      style={{
                        height: 32,
                        padding: '0 16px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        border: '1px solid var(--border)',
                        background: copied ? 'var(--headline)' : 'transparent',
                        color: copied ? 'var(--preview-bg)' : 'var(--body)',
                        transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                        minWidth: 80,
                      }}
                      onMouseEnter={(e) => { if (!copied) { e.currentTarget.style.borderColor = 'var(--headline)'; e.currentTarget.style.color = 'var(--headline)' } }}
                      onMouseLeave={(e) => { if (!copied) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--body)' } }}
                    >
                      {copied ? 'Copied' : 'Share'}
                    </button>

                    <a
                      href="mailto:ferdousmikdad@gmail.com"
                      style={{
                        height: 32,
                        padding: '0 16px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 500,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        background: 'var(--headline)',
                        color: 'var(--bg)',
                        border: '1px solid var(--headline)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                    >
                      Get in Touch
                    </a>
                  </div>
                </div>

                {/* Sequential content — images and videos stacked vertically */}
                <div style={{ paddingTop: 40 }}>
                  {contentItems.map((item, i) => (
                    <ContentItem key={i} item={item} title={project.title} index={i} />
                  ))}
                </div>

                {/* Footer strip */}
                <div
                  className="flex items-center justify-between px-6 py-5"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  <div>
                    <p className="text-[11px] font-semibold" style={{ color: 'var(--body)', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Project
                    </p>
                    <p className="text-[14px] font-semibold mt-0.5" style={{ color: 'var(--headline)', fontFamily: "'SF Pro Display', sans-serif" }}>
                      {project.title}
                    </p>
                  </div>
                  <a
                    href="mailto:ferdousmikdad@gmail.com"
                    className="flex items-center gap-2 px-4 h-9 rounded-lg text-[12px] font-semibold no-underline transition-colors"
                    style={{ background: '#cf0506', color: '#fff' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#a80404' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#cf0506' }}
                  >
                    Hire me
                    <ArrowUpRight size={13} />
                  </a>
                </div>

              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
