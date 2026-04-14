import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import TopBar from './TopBar'
import RightControls from './RightControls'
import Background from './Background'
import Dock from '@/components/dock/Dock'
import MenuWindow from '@/components/dock/MenuWindow'
import ProfileCard from '@/components/apps/ProfileCard'
import AboutMeWindow from '@/components/apps/AboutMeWindow'
import PacmanWindow from '@/components/apps/PacmanWindow'
import WorkWindow from '@/components/apps/WorkWindow'
import ComingSoonWindow from '@/components/apps/ComingSoonWindow'
import NotesWindow from '@/components/apps/NotesWindow'
import ToolWindow from '@/components/apps/ToolWindow'
import ToolsDock from '@/components/dock/ToolsDock'
import useWindowStore, { TOOL_IDS } from '@/store/windowStore'
import useSound from '@/hooks/useSound'
import MikudaChat from '@/components/apps/MikudaChat'

export default function Desktop() {
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [mikudaOpen, setMikudaOpen] = useState(false)
  const menuRef = useRef(null)
  const { openWindow, closeAllExcept, switchTool, activePage, navigate } = useWindowStore()
  const setActivePage = navigate
  const play = useSound()

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  // Open the right window when a menu item is selected
  useEffect(() => {
    if (!activePage) return
    play('open')
    if (activePage === 'home') {
      closeAllExcept(['profile', 'pacman'])
      openWindow('profile')
      openWindow('pacman')
    } else if (activePage === 'about') {
      closeAllExcept([])
    } else if (activePage === 'tools') {
      closeAllExcept(TOOL_IDS)
      switchTool('color-contrast')
    } else {
      closeAllExcept([activePage])
      openWindow(activePage)
    }
  }, [activePage, openWindow, closeAllExcept, switchTool, play])

  // Keyboard shortcuts: Shift + H / A / P / S / N / T
  useEffect(() => {
    const map = { H: 'home', A: 'about', P: 'portfolio', S: 'shop', N: 'notes', T: 'tools' }
    const handler = (e) => {
      if (e.shiftKey && map[e.key]) { e.preventDefault(); navigate(map[e.key]) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* Top menu bar */}
      <TopBar />

      {/* Animated background */}
      <Background />

      {/* About Me — full-desktop view */}
      <AnimatePresence>
        {activePage === 'about' && (
          <div className="absolute inset-0" style={{ zIndex: 10, paddingTop: 28 }}>
            <AboutMeWindow key="about" />
          </div>
        )}
      </AnimatePresence>

      {/* Windows layer */}
      <div className="absolute inset-0" style={{ zIndex: 20, pointerEvents: 'none' }}>
        <AnimatePresence>
          <ProfileCard />
          <PacmanWindow />
          <WorkWindow />
          <ComingSoonWindow id="shop" />
          <NotesWindow />
          {TOOL_IDS.map((toolId) => (
            <ToolWindow key={toolId} toolId={toolId} />
          ))}
        </AnimatePresence>
      </div>

      {/* Menu window */}
      <MenuWindow
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeId={activePage}
        onNavigate={setActivePage}
        menuRef={menuRef}
      />

      {/* Bottom-left controls */}
      <RightControls />

      {/* Mikuda AI — own layer so pointer events aren't blocked */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 60, pointerEvents: 'none' }}>

        {/* Chat window — absolute inside the full-screen layer */}
        <MikudaChat isOpen={mikudaOpen} onClose={() => setMikudaOpen(false)} />

        {/* FAB button */}
        <div style={{ position: 'absolute', bottom: 32, right: 20, pointerEvents: 'auto' }}>
          <motion.button
            className={`mikuda-fab ${mikudaOpen ? 'active' : ''}`}
            onClick={() => setMikudaOpen((v) => !v)}
            whileTap={{ scale: 0.92 }}
            title="Ask Mikuda"
          >
            <AnimatePresence mode="wait">
              {mikudaOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -45, opacity: 0 }}
                  animate={{ rotate: 0,   opacity: 1 }}
                  exit={{    rotate: 45,  opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ display: 'flex' }}
                >
                  <Sparkles size={18} style={{ color: '#cf0506' }} />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 45,  opacity: 0 }}
                  animate={{ rotate: 0,   opacity: 1 }}
                  exit={{    rotate: -45, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ display: 'flex' }}
                >
                  <Sparkles size={18} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

      </div>

      {/* Tools icon dock */}
      <AnimatePresence>
        {activePage === 'tools' && (
          <motion.div
            style={{ position: 'absolute', bottom: 84, left: '50%', zIndex: 45 }}
            initial={{ x: '-50%', opacity: 0, y: 16, scale: 0.94 }}
            animate={{ x: '-50%', opacity: 1, y: 0,  scale: 1   }}
            exit={{    x: '-50%', opacity: 0, y: 12, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          >
            <ToolsDock />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dock */}
      <Dock
        activeId={activePage}
        onNavigate={setActivePage}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
      />

    </div>
  )
}
