import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Mail } from 'lucide-react'

export default function ProjectPreviewWindow({ project, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: project?.title, url: window.location.href }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {})
    }
  }

  const stopEvents = (e) => { e.stopPropagation() }

  return (
    <>
      {/* Backdrop — blocks all pointer events reaching windows behind */}
      <AnimatePresence>
        {project && (
          <motion.div
            key="preview-backdrop"
            className="fixed inset-0"
            style={{ background: 'rgba(0,0,0,0.6)', zIndex: 99998, pointerEvents: 'all' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            onMouseDown={stopEvents}
            onMouseMove={stopEvents}
            onMouseUp={stopEvents}
          />
        )}
      </AnimatePresence>

      {/* Window */}
      <AnimatePresence>
        {project && (
          <motion.div
            key="preview-panel"
            className="window-shell fixed"
            style={{
              top: 48,
              left: 0,
              right: 0,
              height: 'calc(100vh - 48px)',
              zIndex: 99999,
              borderRadius: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',   /* ← lets flex children shrink so scroll works */
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onMouseDown={stopEvents}
            onClick={stopEvents}
          >
            {/* Traffic lights */}
            <div
              className="window-titlebar flex-shrink-0"
              style={{ cursor: 'default', borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-1.5">
                <button className="traffic-light traffic-light-close" onClick={onClose} />
                <div className="traffic-light traffic-light-minimize" style={{ cursor: 'default', opacity: 0.35 }} />
                <div className="traffic-light traffic-light-maximize" style={{ cursor: 'default', opacity: 0.35 }} />
              </div>
            </div>

            {/* Title + actions */}
            <div
              className="flex-shrink-0"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div
                className="flex items-center gap-4 px-6 mx-auto"
                style={{ maxWidth: 1140, height: 52 }}
              >
                <span
                  className="flex-1 text-[14px] font-semibold truncate"
                  style={{ color: 'var(--headline)', fontFamily: "'SF Pro Display'" }}
                >
                  {project.title}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 h-7 rounded-md text-[12px] font-medium transition-colors"
                    style={{ background: 'var(--wall-bg)', border: '1px solid var(--border)', color: 'var(--body)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--headline)'; e.currentTarget.style.color = 'var(--headline)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--body)' }}
                  >
                    <Share2 size={11} />
                    Share
                  </button>
                  <a
                    href="mailto:ferdousmikdad@gmail.com"
                    className="flex items-center gap-1.5 px-3 h-7 rounded-md text-[12px] font-medium no-underline"
                    style={{ background: '#cf0506', color: '#fff', border: '1px solid #cf0506' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#b00404'; e.currentTarget.style.borderColor = '#b00404' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#cf0506'; e.currentTarget.style.borderColor = '#cf0506' }}
                  >
                    <Mail size={11} />
                    Get in Touch
                  </a>
                </div>
              </div>
            </div>

            {/* Scrollable image */}
            <div
              className="window-scroll"
              style={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, overflowY: 'auto', background: 'var(--wall-bg)' }}
            >
              <div style={{ maxWidth: 1140, margin: '0 auto' }}>
                <img
                  src={project.preview || project.image}
                  alt={project.title}
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
