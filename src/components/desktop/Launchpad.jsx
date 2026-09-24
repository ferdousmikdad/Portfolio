import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useWindowStore from '@/store/windowStore'
import useSoundStore from '@/store/soundStore'
import TOOLS from '@/data/tools'
import { PANE_ICONS } from '@/data/settingsPanes'
import finderUrl   from '@/assets/icons/finder.svg?url'
import noteUrl     from '@/assets/icons/note.png'
import terminalUrl from '@/assets/icons/terminal.svg?url'
import calcUrl     from '@/assets/icons/Calculator@4x 1.png'
import appStoreUrl from '@/assets/icons/App Store.png'
import spotifyUrl  from '@/assets/icons/spotify.svg?url'
import photosUrl   from '@/assets/icons/Photos.png'
import homeUrl     from '@/assets/icons/Home.png'
import photoBoothUrl from '@/assets/icons/photobooth.png?url'

/* ── Launchpad ─────────────────────────────────────────────────────────────
   Every app at once over a blurred desktop, paginated, and typing filters it.

   macOS lays it out on a fixed grid and pages horizontally rather than
   scrolling, which is the detail that makes it feel like Launchpad and not a
   folder window — so the grid here is a fixed 7×3 and the overflow goes to
   page two. Typing narrows the set and collapses it back to one page, the
   way it does on a Mac.                                                    */

const COLS = 7
const ROWS = 3
const PER_PAGE = COLS * ROWS

export default function Launchpad({ open, onClose }) {
  const { openWindow, openTool, navigate, openFinderAt } = useWindowStore()
  const play = useSoundStore((s) => s.play)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const inputRef = useRef(null)

  const apps = useMemo(() => [
    { id: 'finder',     name: 'Finder',          icon: finderUrl,   run: () => openFinderAt('applications') },
    { id: 'home',       name: 'Home',            icon: homeUrl,     run: () => navigate('home') },
    { id: 'portfolio',  name: 'Portfolio',       icon: photosUrl,   run: () => navigate('portfolio') },
    { id: 'notes',      name: 'Notes',           icon: noteUrl,     run: () => openWindow('notes') },
    { id: 'terminal',   name: 'Terminal',        icon: terminalUrl, run: () => openWindow('terminal') },
    { id: 'calculator', name: 'Calculator',      icon: calcUrl,     run: () => openWindow('calculator') },
    { id: 'shop',       name: 'App Store',           icon: appStoreUrl, run: () => openWindow('shop') },
    { id: 'spotify',    name: 'Spotify',         icon: spotifyUrl,  run: () => openWindow('spotify') },
    { id: 'photo-booth', name: 'Photo Booth',    icon: photoBoothUrl, run: () => openWindow('photo-booth') },
    { id: 'settings',   name: 'System Settings', icon: PANE_ICONS.general, run: () => openWindow('settings') },
    ...TOOLS.map((t) => ({
      id: t.id, name: t.name, icon: t.icon,
      run: () => { navigate('tools'); openTool(t.id) },
    })),
  ], [openWindow, openTool, navigate, openFinderAt])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? apps.filter((a) => a.name.toLowerCase().includes(q)) : apps
  }, [apps, query])

  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE))
  // A filter that shortens the list must not leave you stranded on page two.
  useEffect(() => { setPage(0) }, [query])

  useEffect(() => {
    if (!open) { setQuery(''); setPage(0); return }
    inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      if (e.key === 'ArrowRight') setPage((p) => Math.min(p + 1, pages - 1))
      if (e.key === 'ArrowLeft')  setPage((p) => Math.max(p - 1, 0))
      // Return launches the only thing left, which is what the filter is for.
      if (e.key === 'Enter' && shown.length) { launch(shown[0]) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, pages, shown])

  const launch = (app) => { play('open'); app.run(); onClose() }

  const slice = shown.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="lp"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            className="lp__inner"
            initial={{ scale: 1.06, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.04, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <div className="lp__search">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
                   stroke="currentColor" strokeWidth="1.6">
                <circle cx="7" cy="7" r="4.6" />
                <path d="M10.6 10.6 L14 14" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                placeholder="Search"
                spellCheck={false}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="lp__grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
              {slice.map((app) => (
                <button key={app.id} className="lp__app" onClick={() => launch(app)}>
                  <img src={app.icon} alt="" draggable={false} />
                  <span>{app.name}</span>
                </button>
              ))}
            </div>

            {shown.length === 0 && <p className="lp__empty">No apps match “{query}”</p>}

            {pages > 1 && (
              <div className="lp__dots">
                {Array.from({ length: pages }).map((_, i) => (
                  <button
                    key={i}
                    className="lp__dot"
                    data-on={i === page}
                    onClick={() => setPage(i)}
                    aria-label={`Page ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
