import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassLayers from '@/components/ui/LiquidGlass'
import useWindowStore from '@/store/windowStore'
import { DOCS } from '@/components/apps/BioWindow'

/* ── Quick Look ────────────────────────────────────────────────────────────
   Select a file, press space, see it — without opening the app that owns it.
   Space again, Escape, or a click outside puts it away.

   macOS gives the panel a slim header with the filename centred, a close
   button at the left and "Open with …" at the right, then the preview
   underneath. It is not a window: no traffic lights, no resize, and it
   dismisses on the same key that raised it.                               */

export default function QuickLook({ file, onClose }) {
  const openWindow = useWindowStore((s) => s.openWindow)

  useEffect(() => {
    if (!file) return
    const onKey = (e) => {
      // Space toggles it shut, exactly as it opened it.
      if (e.key === 'Escape' || e.code === 'Space') { e.preventDefault(); onClose() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [file, onClose])

  const doc = file ? DOCS[file.windowId] : null

  return (
    <AnimatePresence>
      {file && (
        <motion.div
          className="ql-scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            className="ql"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 460, damping: 34 }}
            role="dialog"
            aria-label={`Preview of ${file.name}`}
          >
            <GlassLayers small />

            <div className="ql__bar">
              <button className="ql__close" onClick={onClose} aria-label="Close preview">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none"
                     stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M1 1l8 8M9 1l-8 8" />
                </svg>
              </button>
              <span className="ql__name">{file.name}</span>
              <button
                className="ql__open"
                onClick={() => { openWindow(file.windowId); onClose() }}
              >
                Open with TextEdit
              </button>
            </div>

            <div className="ql__body">
              {doc
                ? <pre className="ql__text">{doc.content}</pre>
                /* A file with no preview still gets a panel — macOS shows the
                   icon and the name rather than nothing at all. */
                : (
                  <div className="ql__fallback">
                    <img src={file.icon} alt="" width={72} height={72} draggable={false} />
                    <p>{file.name}</p>
                    <span>{file.size}</span>
                  </div>
                )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
