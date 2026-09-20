import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TopBar from './TopBar'
import WelcomeModal from './WelcomeModal'
import RightControls from './RightControls'
import Background from './Background'
import ToolsPageDock from '@/components/dock/ToolsPageDock'
import { GlassDefs } from '@/components/ui/LiquidGlass'
import MenuWindow from '@/components/dock/MenuWindow'
import ProfileCard from '@/components/apps/ProfileCard'
import AboutMeWindow from '@/components/apps/AboutMeWindow'
import PacmanWindow from '@/components/apps/PacmanWindow'
import DocWindow from '@/components/apps/BioWindow'
import WorkWindow from '@/components/apps/WorkWindow'
import ShopWindow from '@/components/apps/ShopWindow'
import NotesWindow from '@/components/apps/NotesWindow'
import ToolWindow from '@/components/apps/ToolWindow'
import FinderWindow from '@/components/apps/FinderWindow'
import TerminalWindow from '@/components/apps/TerminalWindow'
import useWindowStore, { TOOL_IDS } from '@/store/windowStore'
import useSettingsStore from '@/store/settingsStore'
import useTrashStore, { trashedFrom } from '@/store/trashStore'
import useDragStore from '@/store/dragStore'
import DragGhost from '@/components/ui/DragGhost'
import DESKTOP_FILES from '@/data/desktopFiles'
import useSound from '@/hooks/useSound'
import MikudaChat from '@/components/apps/MikudaChat'
import HomeWindow from '@/components/apps/HomeWindow'
import SpotifyWindow from '@/components/apps/SpotifyWindow'
import ProjectPreviewWindow from '@/components/apps/ProjectPreviewWindow'
import SettingsWindow from '@/components/apps/SettingsWindow'
import MailWindow from '@/components/apps/MailWindow'
import CalculatorWindow from '@/components/apps/CalculatorWindow'
import AboutMacWindow from '@/components/apps/AboutMacWindow'
import MissionControl from '@/components/desktop/MissionControl'
import allProjects from '@/data/projects'
import siriIconUrl from '@/assets/icons/siri.png?url'

/* Viewport coordinates for a framer drag. The native pointer event is the
   reliable source — the dock is hit-tested in viewport space. */
const pointOf = (event, info) =>
  typeof event?.clientX === 'number'
    ? { x: event.clientX, y: event.clientY }
    : info.point

function DesktopIcon({ file, initialX, onOpen, selected, onSelect, onTrash }) {
  const pos     = useRef({ x: initialX, y: file.y })
  const [, rerender] = useState(0)
  const [lifted, setLifted] = useState(false)
  const didDrag = useRef(false)

  const beginDrag = useDragStore((s) => s.begin)
  const moveDrag  = useDragStore((s) => s.move)
  const endDrag   = useDragStore((s) => s.end)

  /* What the Trash will be holding if this lands there. The origin is what
     makes Put Back work: the desktop filters itself against the Trash, so
     removing the item here is the same thing as the file reappearing. */
  const payload = () => ({
    id:     file.id,
    name:   file.name,
    kind:   file.kind,
    icon:   file.icon,
    size:   file.size,
    origin: { source: 'desktop', id: file.id },
  })

  return (
    <motion.div
      className={`desktop-icon${selected ? ' selected' : ''}`}
      /* Lifted above the dock while in hand: a file being dragged to the
         Trash has to stay visible over the slab it is aimed at. */
      style={{ position: 'absolute', x: pos.current.x, y: pos.current.y, zIndex: lifted ? 9999 : 15 }}
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={(event, info) => {
        didDrag.current = false
        setLifted(true)
        beginDrag(payload(), pointOf(event, info))
      }}
      onDrag={(event, info) => {
        if (Math.abs(info.offset.x) > 3 || Math.abs(info.offset.y) > 3) didDrag.current = true
        moveDrag(pointOf(event, info))
      }}
      onDragEnd={(event, info) => {
        setLifted(false)
        // Dropped on the basket: the file leaves the desktop and the icon
        // unmounts, so there is no position left to commit.
        if (endDrag()) { onTrash(payload()); return }
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
      title={file.name}
    >
      <img src={file.icon} alt={file.name} draggable={false} />
      <span className="desktop-icon-label">{file.name}</span>
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
  const missionControl = useWindowStore((s) => s.missionControl)
  const { openWindow, closeAllExcept, switchTool, activePage, navKey, navigate, previewProject, closeProjectPreview, openProjectPreview, openMailWindow } = useWindowStore()
  const isAnyMaximized    = useWindowStore((s) => s.windows.some((w) => w.isMaximized))
  const showDesktopIcons  = useSettingsStore((s) => s.showDesktopIcons)
  const trashItems        = useTrashStore((s) => s.items)
  const trashFile         = useTrashStore((s) => s.trashItem)
  const trashedOnDesktop  = trashedFrom(trashItems, 'desktop')
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

      {/* Filters every Liquid Glass surface references */}
      <GlassDefs />

      {/* First-time visitor welcome */}
      <WelcomeModal />

      {/* Top menu bar */}
      <TopBar />

      {/* Animated background */}
      <Background />

      {/* Desktop icons — toggleable via Settings. A file in the Trash is not
          on the desktop, so the list filters itself against it; Put Back in
          the Trash window is what brings the icon back. */}
      {showDesktopIcons && (
        <>
          {DESKTOP_FILES.filter((f) => !trashedOnDesktop.has(f.id)).map((file) => (
            <DesktopIcon
              key={file.id}
              file={file}
              initialX={window.innerWidth - 96}
              onOpen={() => openWindow(file.windowId)}
              selected={selectedIcon === file.id}
              onSelect={() => setSelectedIcon(file.id)}
              onTrash={(item) => { play('trash'); trashFile(item) }}
            />
          ))}
        </>
      )}

      {/* Windows layer — z-index lifts to 9999 when any window is maximized */}
      <div
        className="absolute inset-0"
        /* Hidden, not unmounted, while Mission Control is up: the tiles are
           clones of these nodes and unmounting would pull them out from
           under the exit animation. */
        style={{
          zIndex: isAnyMaximized ? 9999 : 20,
          pointerEvents: 'none',
          opacity: missionControl ? 0 : 1,
        }}
      >
        <AnimatePresence>
          <ProfileCard />
          <AboutMeWindow />
          <PacmanWindow />
          <DocWindow id="bio" />
          <DocWindow id="skills" />
          <DocWindow id="contact" />
          <WorkWindow />
          <ShopWindow />
          <NotesWindow />
          {TOOL_IDS.map((toolId) => (
            <ToolWindow key={toolId} toolId={toolId} />
          ))}
          <HomeWindow />
          <SpotifyWindow />
          <FinderWindow />
          <TerminalWindow />
          <SettingsWindow />
          <MailWindow />
          <CalculatorWindow />
          <AboutMacWindow />
        </AnimatePresence>
      </div>

      <MissionControl />

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
                    <img src={siriIconUrl} alt="" className="mikuda-fab__siri" draggable={false} />
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
                    <img src={siriIconUrl} alt="" className="mikuda-fab__siri" draggable={false} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        )}

      </div>

      {/* Translucent copy of a file being dragged out of a window */}
      <DragGhost />

      {/* Dock — tools dock on all pages */}
      <ToolsPageDock
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
        onNavigate={setActivePage}
      />

    </div>
  )
}
