import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import MobileMenu       from './MobileMenu'
import MobileHome       from './MobileHome'
import MobilePortfolio  from './MobilePortfolio'
import MobileAbout      from './MobileAbout'
import MobileTools      from './MobileTools'
import MobileContact    from './MobileContact'
import MobileToolViewer from './MobileToolViewer'
import ProjectPreviewWindow from '@/components/apps/ProjectPreviewWindow'
import MikudaChat       from '@/components/apps/MikudaChat'
import useWindowStore   from '@/store/windowStore'
import useThemeStore    from '@/store/themeStore'
import allProjects      from '@/data/projects'

const PAGES = ['home', 'portfolio', 'about', 'tools', 'contact']

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

// 4-pointed sparkle / diamond star
function SparkleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#cf0506" style={{ flexShrink: 0 }}>
      <path d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z"/>
    </svg>
  )
}

export default function MobileApp() {
  const { previewProject, closeProjectPreview, openProjectPreview } = useWindowStore()
  const { isDark, toggleTheme } = useThemeStore()

  const [activePage, setActivePage] = useState('home')
  const [prevPage,   setPrevPage]   = useState(null)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [activeTool, setActiveTool] = useState(null)
  const [mikudaOpen, setMikudaOpen] = useState(false)
  const chatRef = useRef(null)
  const fabRef  = useRef(null)

  // Apply theme class to root
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  // On mount, check hash for direct project link
  useEffect(() => {
    const match = window.location.hash.match(/^#project\/(.+)$/)
    if (match) {
      const project = allProjects.find((p) => p.slug === match[1])
      if (project) openProjectPreview(project)
    }
  }, [])

  // Close chat on outside click / touch
  useEffect(() => {
    if (!mikudaOpen) return
    const handler = (e) => {
      if (
        chatRef.current && !chatRef.current.contains(e.target) &&
        fabRef.current  && !fabRef.current.contains(e.target)
      ) setMikudaOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [mikudaOpen])

  const goTo = (page) => {
    if (page === activePage) return
    setPrevPage(activePage)
    setActivePage(page)
    setMenuOpen(false)
  }

  const direction = prevPage && PAGES.indexOf(activePage) > PAGES.indexOf(prevPage) ? 1 : -1

  return (
    <div style={{ width: '100%', height: '100svh', overflow: 'hidden', background: 'var(--bg)', color: 'var(--headline)', position: 'relative' }}>

      {/* ── Page content ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activePage}
          initial={{ opacity: 0, x: prevPage ? direction * 20 : 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -20 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}
          className="window-scroll"
        >
          {activePage === 'home'      && <MobileHome      onNav={goTo} />}
          {activePage === 'portfolio' && <MobilePortfolio onNav={goTo} />}
          {activePage === 'about'     && <MobileAbout     onNav={goTo} />}
          {activePage === 'tools'     && <MobileTools     onOpenTool={setActiveTool} />}
          {activePage === 'contact'   && <MobileContact   onNav={goTo} />}
        </motion.div>
      </AnimatePresence>

      {/* ── Fixed bottom controls ─────────────────────────────────────── */}
      <div className="m-controls">

        {/* Left group — theme toggle + Ask me */}
        <div className="m-controls-left">

          {/* Theme toggle — icon-only circle */}
          <button
            className="m-ctrl-icon"
            onClick={toggleTheme}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Ask me — pill with sparkle */}
          <div ref={fabRef}>
            <button
              className={`m-ctrl-pill ${mikudaOpen ? 'active' : ''}`}
              onClick={() => setMikudaOpen((v) => !v)}
            >
              <SparkleIcon />
              <span>Ask me</span>
            </button>
          </div>

        </div>

        {/* Right — Menu pill with sparkle */}
        <button
          className={`m-ctrl-pill ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <SparkleIcon />
          <span>Menu</span>
        </button>

      </div>

      {/* ── Menu overlay ──────────────────────────────────────────────── */}
      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        activePage={activePage}
        onNav={goTo}
      />

      {/* ── Mikuda chat window ────────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 500, pointerEvents: 'none' }}>
        <MikudaChat isOpen={mikudaOpen} onClose={() => setMikudaOpen(false)} chatRef={chatRef} />
      </div>

      {/* ── Inline tool viewer ────────────────────────────────────────── */}
      <AnimatePresence>
        {activeTool && (
          <MobileToolViewer tool={activeTool} onClose={() => setActiveTool(null)} />
        )}
      </AnimatePresence>

      {/* ── Project preview overlay ───────────────────────────────────── */}
      <ProjectPreviewWindow project={previewProject} onClose={closeProjectPreview} isMobile />

    </div>
  )
}
