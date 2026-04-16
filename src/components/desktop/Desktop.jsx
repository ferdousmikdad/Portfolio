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
import DocWindow from '@/components/apps/BioWindow'
import WorkWindow from '@/components/apps/WorkWindow'
import ComingSoonWindow from '@/components/apps/ComingSoonWindow'
import NotesWindow from '@/components/apps/NotesWindow'
import ToolWindow from '@/components/apps/ToolWindow'
import ToolsDock from '@/components/dock/ToolsDock'
import useWindowStore, { TOOL_IDS } from '@/store/windowStore'
import macDocumentUrl from '@/assets/icons/macDocument.png'
import useSound from '@/hooks/useSound'
import MikudaChat from '@/components/apps/MikudaChat'
import ProjectPreviewWindow from '@/components/apps/ProjectPreviewWindow'
import allProjects from '@/data/projects'

function DesktopIcon({ src, label, initialX, initialY, onOpen, selected, onSelect }) {
  const pos     = useRef({ x: initialX, y: initialY })
  const [, rerender] = useState(0)
  const didDrag = useRef(false)

  return (
    <motion.div
      className={`desktop-icon${selected ? ' selected' : ''}`}
      style={{ position: 'absolute', x: pos.current.x, y: pos.current.y, zIndex: 15 }}
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => { didDrag.current = false }}
      onDrag={(_, info) => {
        if (Math.abs(info.offset.x) > 3 || Math.abs(info.offset.y) > 3) didDrag.current = true
      }}
      onDragEnd={(_, info) => {
        pos.current = { x: pos.current.x + info.offset.x, y: pos.current.y + info.offset.y }
        rerender((n) => n + 1)
      }}
      onClick={(e) => {
        if (didDrag.current) return
        e.stopPropagation()
        onSelect()
      }}
      onDoubleClick={(e) => {
        if (didDrag.current) return
        e.stopPropagation()
        onOpen()
      }}
      title={label}
    >
      <img src={src} alt={label} draggable={false} />
      <span className="desktop-icon-label">{label}</span>
    </motion.div>
  )
}

export default function Desktop() {
  const [menuOpen,      setMenuOpen]      = useState(false)
  const [mikudaOpen,    setMikudaOpen]    = useState(false)
  const [selectedIcon,  setSelectedIcon]  = useState(null)
  const menuRef  = useRef(null)
  const chatRef  = useRef(null)
  const fabRef   = useRef(null)
  const { openWindow, closeAllExcept, switchTool, activePage, navigate, previewProject, closeProjectPreview, openProjectPreview } = useWindowStore()
  const setActivePage = navigate
  const play = useSound()

  // On mount: open a project directly if the URL hash is #project/<slug>
  useEffect(() => {
    const match = window.location.hash.match(/^#project\/(.+)$/)
    if (match) {
      const project = allProjects.find((p) => p.slug === match[1])
      if (project) openProjectPreview(project)
    }
  }, [])

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  // Close chat on outside click (exclude the FAB toggle button)
  useEffect(() => {
    if (!mikudaOpen) return
    const handler = (e) => {
      if (
        chatRef.current && !chatRef.current.contains(e.target) &&
        fabRef.current  && !fabRef.current.contains(e.target)
      ) {
        setMikudaOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mikudaOpen])

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
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'var(--bg)' }} onClick={() => setSelectedIcon(null)}>

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

      {/* Desktop icons — draggable column, top-right below topbar */}
      <DesktopIcon src={macDocumentUrl} label="about_me.txt"  initialX={window.innerWidth - 96} initialY={80}  onOpen={() => openWindow('bio')}     selected={selectedIcon === 'bio'}     onSelect={() => setSelectedIcon('bio')}     />
      <DesktopIcon src={macDocumentUrl} label="skills.txt"    initialX={window.innerWidth - 96} initialY={180} onOpen={() => openWindow('skills')}  selected={selectedIcon === 'skills'}  onSelect={() => setSelectedIcon('skills')}  />
      <DesktopIcon src={macDocumentUrl} label="contact.txt"   initialX={window.innerWidth - 96} initialY={280} onOpen={() => openWindow('contact')} selected={selectedIcon === 'contact'} onSelect={() => setSelectedIcon('contact')} />

      {/* Windows layer */}
      <div className="absolute inset-0" style={{ zIndex: 20, pointerEvents: 'none' }}>
        <AnimatePresence>
          <ProfileCard />
          <PacmanWindow />
          <DocWindow id="bio" />
          <DocWindow id="skills" />
          <DocWindow id="contact" />
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

      {/* Global project preview — opened from WorkWindow or MikudaChat */}
      <ProjectPreviewWindow project={previewProject} onClose={closeProjectPreview} />

      {/* Bottom-left controls */}
      <RightControls />

      {/* Mikuda AI — own layer so pointer events aren't blocked */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 60, pointerEvents: 'none' }}>

        {/* Chat window — absolute inside the full-screen layer */}
        <MikudaChat isOpen={mikudaOpen} onClose={() => setMikudaOpen(false)} chatRef={chatRef} />

        {/* FAB button */}
        <div ref={fabRef} style={{ position: 'absolute', bottom: 32, right: 20, pointerEvents: 'auto' }}>
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
