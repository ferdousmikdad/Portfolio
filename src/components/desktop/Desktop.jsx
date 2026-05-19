import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import TopBar from './TopBar'
import WelcomeModal from './WelcomeModal'
import RightControls from './RightControls'
import Background from './Background'
import ToolsPageDock from '@/components/dock/ToolsPageDock'
import MenuWindow from '@/components/dock/MenuWindow'
import ProfileCard from '@/components/apps/ProfileCard'
import AboutMeWindow from '@/components/apps/AboutMeWindow'
import PacmanWindow from '@/components/apps/PacmanWindow'
import DocWindow from '@/components/apps/BioWindow'
import WorkWindow from '@/components/apps/WorkWindow'
import ComingSoonWindow from '@/components/apps/ComingSoonWindow'
import NotesWindow from '@/components/apps/NotesWindow'
import ToolWindow from '@/components/apps/ToolWindow'
import FinderWindow from '@/components/apps/FinderWindow'
import TerminalWindow from '@/components/apps/TerminalWindow'
import useWindowStore, { TOOL_IDS } from '@/store/windowStore'
import useSettingsStore from '@/store/settingsStore'
import macDocumentUrl from '@/assets/icons/macDocument.png'
import useSound from '@/hooks/useSound'
import MikudaChat from '@/components/apps/MikudaChat'
import HomeWindow from '@/components/apps/HomeWindow'
import ProjectPreviewWindow from '@/components/apps/ProjectPreviewWindow'
import SettingsWindow from '@/components/apps/SettingsWindow'
import MailWindow from '@/components/apps/MailWindow'
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
  const { openWindow, closeAllExcept, switchTool, activePage, navKey, navigate, previewProject, closeProjectPreview, openProjectPreview, openMailWindow } = useWindowStore()
  const isAnyMaximized    = useWindowStore((s) => s.windows.some((w) => w.isMaximized))
  const showDesktopIcons  = useSettingsStore((s) => s.showDesktopIcons)
  const setActivePage = navigate
  const play = useSound()

  const TOPBAR_H  = 28
  const DOCK_SAFE = 88

  const usableCenter = (w, h, liveVW, liveVH) => ({
    x: Math.max(0, Math.round((liveVW - w) / 2)),
    y: Math.max(TOPBAR_H, Math.round(TOPBAR_H + (liveVH - TOPBAR_H - DOCK_SAFE - h) / 2)),
  })

  // Center the initial windows on first mount (full viewport, no usable-area offset)
  const centerInitialWindows = () => {
    const { windows, updateSizePosition } = useWindowStore.getState()
    const liveVW = window.innerWidth
    const liveVH = window.innerHeight
    const portfolio = windows.find((w) => w.id === 'portfolio')
    if (portfolio) {
      const x = Math.max(0, Math.round((liveVW - portfolio.size.width) / 2))
      const y = Math.max(0, Math.round((liveVH - portfolio.size.height) / 2))
      updateSizePosition('portfolio', portfolio.size, { x, y })
    }
    const activeTool = windows.find((w) => TOOL_IDS.includes(w.id) && w.isOpen && !w.isMinimized)
    if (activeTool) {
      const offset = activeTool.id === 'color-contrast' ? 110 : 0
      const x = Math.max(0, Math.round((liveVW - activeTool.size.width) / 2) - offset)
      const y = Math.max(0, Math.round((liveVH - activeTool.size.height) / 2) - offset)
      updateSizePosition(activeTool.id, activeTool.size, { x, y })
    }
    for (const id of ['notes', 'shop']) {
      const win = windows.find((w) => w.id === id)
      if (win) {
        const x = Math.max(0, Math.round((liveVW - win.size.width) / 2))
        const y = Math.max(0, Math.round((liveVH - win.size.height) / 2))
        updateSizePosition(id, win.size, { x, y })
      }
    }
  }

  // Re-center after fit/restore — uses usable area between topbar and dock
  const recenterAfterFullscreen = () => {
    const { windows, updateSizePosition } = useWindowStore.getState()
    const liveVW = window.innerWidth
    const liveVH = window.innerHeight
    const portfolio = windows.find((w) => w.id === 'portfolio')
    if (portfolio && portfolio.isOpen) {
      updateSizePosition('portfolio', portfolio.size, usableCenter(portfolio.size.width, portfolio.size.height, liveVW, liveVH))
    }
    const activeTool = windows.find((w) => TOOL_IDS.includes(w.id) && w.isOpen && !w.isMinimized)
    if (activeTool) {
      updateSizePosition(activeTool.id, activeTool.size, usableCenter(activeTool.size.width, activeTool.size.height, liveVW, liveVH))
    }
    for (const id of ['notes', 'shop']) {
      const win = windows.find((w) => w.id === id && w.isOpen)
      if (win) {
        updateSizePosition(id, win.size, usableCenter(win.size.width, win.size.height, liveVW, liveVH))
      }
    }
  }

  // On mount: center initial windows
  useEffect(() => {
    centerInitialWindows()
  }, [])

  // Re-center after fullscreen toggle (viewport dimensions change)
  useEffect(() => {
    const handler = () => {
      setTimeout(() => {
        const shells = document.querySelectorAll('.window-shell')
        shells.forEach(el => { el.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)' })

        const { activePage } = useWindowStore.getState()
        if (activePage === null) {
          centerInitialWindows()
        } else {
          recenterAfterFullscreen()
        }

        setTimeout(() => {
          shells.forEach(el => { el.style.transition = '' })
        }, 400)
      }, 150)
    }
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

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
      closeAllExcept(['home', 'finder', 'terminal'])
      openWindow('home')
    } else if (activePage === 'tools') {
      closeAllExcept([...TOOL_IDS, 'finder', 'terminal'])
      switchTool('color-contrast')
      const { windows, updateSizePosition } = useWindowStore.getState()
      const tool = windows.find((w) => w.id === 'color-contrast')
      if (tool) {
        const x = Math.max(0, Math.round((window.innerWidth  - tool.size.width)  / 2))
        const y = Math.max(0, Math.round((window.innerHeight - tool.size.height) / 2))
        updateSizePosition('color-contrast', tool.size, { x, y })
      }
    } else {
      closeAllExcept([activePage, 'finder', 'terminal'])
      openWindow(activePage)
    }
  }, [activePage, navKey, openWindow, closeAllExcept, switchTool, play])

  // Keyboard shortcuts: Shift + H / A / P / S / N
  useEffect(() => {
    const map = { H: 'home', P: 'portfolio', S: 'shop', N: 'notes' }
    const handler = (e) => {
      if (e.shiftKey && map[e.key]) { e.preventDefault(); navigate(map[e.key]) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Intercept all mailto: link clicks — open the in-app mail window instead
  useEffect(() => {
    const handler = (e) => {
      const link = e.target.closest('a[href^="mailto:"]')
      if (!link) return
      e.preventDefault()
      const to = link.href.replace('mailto:', '')
      openMailWindow(to)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [openMailWindow])

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'var(--bg)' }} onClick={() => setSelectedIcon(null)}>

      {/* First-time visitor welcome */}
      <WelcomeModal />

      {/* Top menu bar */}
      <TopBar />

      {/* Animated background */}
      <Background />

      {/* Desktop icons — toggleable via Settings */}
      {showDesktopIcons && (
        <>
          <DesktopIcon src={macDocumentUrl} label="about_me.txt"  initialX={window.innerWidth - 96} initialY={80}  onOpen={() => openWindow('bio')}     selected={selectedIcon === 'bio'}     onSelect={() => setSelectedIcon('bio')}     />
          <DesktopIcon src={macDocumentUrl} label="skills.txt"    initialX={window.innerWidth - 96} initialY={180} onOpen={() => openWindow('skills')}  selected={selectedIcon === 'skills'}  onSelect={() => setSelectedIcon('skills')}  />
          <DesktopIcon src={macDocumentUrl} label="contact.txt"   initialX={window.innerWidth - 96} initialY={280} onOpen={() => openWindow('contact')} selected={selectedIcon === 'contact'} onSelect={() => setSelectedIcon('contact')} />
        </>
      )}

      {/* Windows layer — z-index lifts to 9999 when any window is maximized */}
      <div className="absolute inset-0" style={{ zIndex: isAnyMaximized ? 9999 : 20, pointerEvents: 'none' }}>
        <AnimatePresence>
          <ProfileCard />
          <AboutMeWindow />
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
          <HomeWindow />
          <FinderWindow />
          <TerminalWindow />
          <SettingsWindow />
          <MailWindow />
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

        {/* Floating chat popup — hidden on home page (full chat is shown there) */}
        {activePage !== 'home' && (
          <MikudaChat isOpen={mikudaOpen} onClose={() => setMikudaOpen(false)} chatRef={chatRef} />
        )}

        {/* FAB button — hidden on home page */}
        {activePage !== 'home' && (
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
        )}

      </div>

      {/* Dock — tools dock on all pages */}
      <ToolsPageDock
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
        onNavigate={setActivePage}
      />

    </div>
  )
}
