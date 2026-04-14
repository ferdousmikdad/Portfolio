import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Mail, ArrowUpRight } from 'lucide-react'

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

export default function ProjectPreviewWindow({ project, onClose }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Reset scroll position when project changes
  useEffect(() => {
    if (project && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [project])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: project?.title, url: window.location.href }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {})
    }
  }

  // Resolve content: use project.content array if available, otherwise fall back
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
              top: 28,
              left: 0,
              right: 0,
              bottom: 0,
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
              style={{
                height: 40,
                borderBottom: '1px solid var(--border)',
                background: 'var(--titlebar-bg)',
              }}
            >
              <button className="traffic-light traffic-light-close" onClick={onClose} title="Close (Esc)" />
              <div className="traffic-light traffic-light-minimize" style={{ opacity: 0.28, cursor: 'default' }} />
              <div className="traffic-light traffic-light-maximize" style={{ opacity: 0.28, cursor: 'default' }} />
            </div>

            {/* ── Scrollable content ───────────────────────────────────────── */}
            <div
              ref={scrollRef}
              className="window-scroll"
              style={{
                flex: '1 1 0',
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                background: 'var(--preview-bg)',
              }}
            >
              <div style={{ maxWidth: 1140, margin: '0 auto' }}>

                {/* Content header — title + actions */}
                <div
                  className="flex items-center gap-4 px-6"
                  style={{ height: 64, borderBottom: '1px solid var(--border)', background: 'var(--preview-bg)' }}
                >
                  <span
                    className="flex-1 text-[20px] font-semibold truncate"
                    style={{ color: 'var(--headline)', fontFamily: "'SF Pro Display', sans-serif", letterSpacing: '-0.02em' }}
                  >
                    {project.title}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1.5 px-3 h-7 rounded-md text-[11px] font-medium transition-colors"
                      style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--body)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--headline)'; e.currentTarget.style.color = 'var(--headline)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--body)' }}
                    >
                      <Share2 size={10} />
                      Share
                    </button>
                    <a
                      href="mailto:ferdousmikdad@gmail.com"
                      className="flex items-center gap-1.5 px-3 h-7 rounded-md text-[11px] font-medium no-underline transition-colors"
                      style={{ background: '#cf0506', color: '#fff', border: '1px solid #cf0506' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#a80404'; e.currentTarget.style.borderColor = '#a80404' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#cf0506'; e.currentTarget.style.borderColor = '#cf0506' }}
                    >
                      <Mail size={10} />
                      Get in Touch
                    </a>
                  </div>
                </div>

                {/* Sequential content — images and videos stacked vertically */}
                {contentItems.map((item, i) => (
                  <ContentItem key={i} item={item} title={project.title} index={i} />
                ))}

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
