import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useWindowStore from '@/store/windowStore'
import useSound from '@/hooks/useSound'
import TOOLS from '@/data/tools'

// Icon glyphs per window id
const WINDOW_META = {
  profile:   { glyph: '👤', color: '#007AFF' },
  pacman:    { glyph: '🎮', color: '#34C759' },
  portfolio: { glyph: '◻',  color: '#AF52DE' },
  shop:      { glyph: '🛍', color: '#FF9500' },
  notes:     { glyph: '📝', color: '#FFCC00' },
}

export default function MinimizedTray({ isOpen, onClose }) {
  const { windows, openWindow }  = useWindowStore()
  const play                     = useSound()
  const trayRef                  = useRef(null)

  const minimized = windows.filter((w) => w.isMinimized)

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (trayRef.current && !trayRef.current.contains(e.target)) onClose()
    }
    // slight delay so the same click that opens doesn't immediately close
    const tid = setTimeout(() => document.addEventListener('mousedown', handler), 50)
    return () => { clearTimeout(tid); document.removeEventListener('mousedown', handler) }
  }, [isOpen, onClose])

  const restore = (id) => {
    play('open')
    openWindow(id)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={trayRef}
          className="absolute bottom-[72px] right-0 flex flex-col items-end gap-2"
          style={{ zIndex: 50 }}
          initial={{ opacity: 0, y: 12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        >
          {minimized.length === 0 ? (
            /* Empty state */
            <div
              className="px-4 py-3 rounded-2xl text-center"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                minWidth: 160,
              }}
            >
              <p className="text-[11px]" style={{ color: 'var(--body)' }}>No minimized windows</p>
            </div>
          ) : (
            /* Window cards side by side */
            <div className="flex items-end gap-2">
              {minimized.map((win, i) => {
                const meta     = WINDOW_META[win.id]
              const toolMeta = TOOLS.find((t) => t.id === win.id)
              const accentColor = meta?.color ?? '#8E8E93'

                return (
                  <motion.button
                    key={win.id}
                    onClick={() => restore(win.id)}
                    initial={{ opacity: 0, y: 16, scale: 0.88 }}
                    animate={{ opacity: 1, y: 0,  scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.88 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28, delay: i * 0.04 }}
                    whileHover={{ y: -6, scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex flex-col items-center gap-2 px-3 pt-3 pb-2.5 rounded-2xl"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      backdropFilter: 'blur(40px)',
                      WebkitBackdropFilter: 'blur(40px)',
                      minWidth: 80,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = accentColor + '55' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)' }}
                  >
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
                      style={{ background: accentColor + '22' }}
                    >
                      {toolMeta ? (
                        <img src={toolMeta.icon} alt={toolMeta.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-xl">{meta?.glyph ?? '⬜'}</span>
                      )}
                    </div>
                    {/* Title */}
                    <span
                      className="text-[10px] font-medium truncate max-w-[72px]"
                      style={{ color: 'var(--body)', fontFamily: "'SF Pro Display'" }}
                    >
                      {toolMeta?.name ?? win.title}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
