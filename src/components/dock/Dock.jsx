import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'
import trashUrl from '@/assets/icons/trash.svg?url'
import cmdfUrl from '@/assets/icons/cmdf.svg?url'
import useSound from '@/hooks/useSound'
import useWindowStore from '@/store/windowStore'
import MinimizedTray from './MinimizedTray'

const spring = { type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }

export default function Dock({ activeId = null, onNavigate, menuOpen = false, onMenuToggle }) {
  const play       = useSound()
  const [trayOpen, setTrayOpen] = useState(false)
  const windows    = useWindowStore((s) => s.windows)
  const minimized  = windows.filter((w) => w.isMinimized)

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-40">

      {/* Dynamic Island dock bar */}
      <motion.div
        layout
        transition={spring}
        className="dock-bar flex items-center gap-3 px-4 h-[52px] overflow-hidden"
      >
        {/* Avatar */}
        <motion.div layout="position" className="flex-shrink-0 cursor-pointer hover:scale-110 transition-transform">
          <img src={mikdadHeadUrl} alt="Mikdad" className="w-8 h-8 object-contain" />
        </motion.div>

        {/* Page title */}
        <AnimatePresence mode="wait">
          {activeId && (
            <motion.div
              key={activeId}
              layout
              initial={{ opacity: 0, width: 0, marginLeft: 0, marginRight: 0 }}
              animate={{ opacity: 1, width: 'auto', marginLeft: 4, marginRight: 4 }}
              exit={{ opacity: 0, width: 0, marginLeft: 0, marginRight: 0 }}
              transition={spring}
              className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
            >
              <div className="w-px h-5 bg-white/10 flex-shrink-0" />
              <span className="text-headline text-sm font-medium capitalize">{activeId}</span>
              <div className="w-px h-5 bg-white/10 flex-shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu trigger */}
        <motion.button
          layout="position"
          onClick={() => { play(menuOpen ? 'close' : 'open'); onMenuToggle() }}
          className="flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-80"
        >
          <div
            className="flex items-center justify-center px-4 py-2"
            style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}
          >
            <img src={cmdfUrl} alt="Menu" className="h-4 object-contain" />
          </div>
        </motion.button>
      </motion.div>

      {/* Trash — separate pill with tray */}
      <div className="relative">
        {/* Minimized tray panel */}
        <MinimizedTray isOpen={trayOpen} onClose={() => setTrayOpen(false)} />

        <motion.button
          layout
          transition={spring}
          data-trash
          onClick={() => setTrayOpen((v) => !v)}
          className="dock-bar flex items-center justify-center w-[52px] h-[52px] transition-opacity hover:opacity-80"
          style={{ position: 'relative' }}
        >
          <img
            src={trashUrl}
            alt="Trash"
            className="w-6 h-6 object-contain transition-transform duration-200"
            style={{ transform: trayOpen ? 'scale(1.15)' : 'scale(1)' }}
          />

          {/* Badge — count of minimized windows */}
          <AnimatePresence>
            {minimized.length > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-white font-bold"
                style={{
                  width: 16,
                  height: 16,
                  fontSize: 9,
                  background: '#cf0506',
                  boxShadow: '0 0 0 2px var(--bg)',
                }}
              >
                {minimized.length}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

    </div>
  )
}
