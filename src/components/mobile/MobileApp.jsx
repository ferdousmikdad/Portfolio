import { useEffect } from 'react'
import MobileNav        from './MobileNav'
import MobileHero       from './MobileHero'
import MobilePortfolio  from './MobilePortfolio'
import MobileAbout      from './MobileAbout'
import MobileTools      from './MobileTools'
import MobileContact    from './MobileContact'
import ProjectPreviewWindow from '@/components/apps/ProjectPreviewWindow'
import MikudaChat       from '@/components/apps/MikudaChat'
import useWindowStore   from '@/store/windowStore'
import useThemeStore    from '@/store/themeStore'
import allProjects      from '@/data/projects'
import { useState, useRef } from 'react'

export default function MobileApp() {
  const { previewProject, closeProjectPreview, openProjectPreview } = useWindowStore()
  const { isDark } = useThemeStore()
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

  // Close chat on outside click
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

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100svh', color: 'var(--headline)' }}>

      {/* Sticky nav */}
      <MobileNav />

      {/* Page sections */}
      <main>
        <MobileHero />
        <MobilePortfolio />
        <MobileAbout />
        <MobileTools />
        <MobileContact />
      </main>

      {/* Project preview overlay (full-screen, same as desktop) */}
      <ProjectPreviewWindow project={previewProject} onClose={closeProjectPreview} isMobile />

      {/* Mikuda AI chat FAB */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 500, pointerEvents: 'none' }}>
        <MikudaChat isOpen={mikudaOpen} onClose={() => setMikudaOpen(false)} chatRef={chatRef} />
        <div
          ref={fabRef}
          style={{ position: 'absolute', bottom: 24, right: 16, pointerEvents: 'auto' }}
        >
          <button
            className={`mikuda-fab ${mikudaOpen ? 'active' : ''}`}
            onClick={() => setMikudaOpen((v) => !v)}
            title="Ask Mikuda"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
        </div>
      </div>

    </div>
  )
}
