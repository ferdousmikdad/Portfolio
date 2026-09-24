/* ── Spotlight ──────────────────────────────────────────────────────────────
   Tahoe's Spotlight, measured off the real one at 2x: a free-floating capsule
   ~360pt wide and 61pt tall whose top sits ~15% of the way down the screen,
   and beside it four round glass buttons of the same height, 11pt apart —
   Applications, Files, Actions and Clipboard. Typing folds the buttons into
   the field, which stretches to the whole row; results grow a second glass
   panel underneath.

   Each button opens a mode: its symbol becomes a chip at the start of the
   field, the placeholder names what you are searching, and the panel lists
   everything in that mode before you type a letter — Applications as an
   icon grid, the rest as rows. Backspace in an empty field leaves the mode.

   Clipboard is this site's own history: text copied anywhere on the page,
   and Spotlight's own copied answers, newest first, kept for the session. */

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useWindowStore from '@/store/windowStore'
import useThemeStore from '@/store/themeStore'
import useDesktopItems from '@/hooks/useDesktopItems'
import GlassLayers from '@/components/ui/LiquidGlass'
import SFSymbol from '@/components/ui/SFSymbol'
import projects from '@/data/projects'
import TOOLS from '@/data/tools'
import { PANE_ICONS, SIDEBAR_GROUPS } from '@/data/settingsPanes'
import spotlightAnswer from '@/utils/spotlightMath'
import finderUrl   from '@/assets/icons/finder.svg?url'
import photosUrl   from '@/assets/icons/Photos.png'
import noteUrl     from '@/assets/icons/note.png'
import terminalUrl from '@/assets/icons/terminal.svg?url'
import calcUrl     from '@/assets/icons/Calculator@4x 1.png'
import appStoreUrl from '@/assets/icons/App Store.png'
import spotifyUrl  from '@/assets/icons/spotify.svg?url'
import photoBoothUrl from '@/assets/icons/photobooth.png?url'
import contactsUrl from '@/assets/icons/Contacts.png?url'

/* ── Clipboard history, for the whole session ── */
const clips = []
if (typeof document !== 'undefined') {
  document.addEventListener('copy', () => {
    const text = String(window.getSelection?.() ?? '').trim()
    if (text) remember(text)
  })
}
function remember(text) {
  const at = clips.findIndex((c) => c.text === text)
  if (at >= 0) clips.splice(at, 1)
  clips.unshift({ text, at: Date.now() })
  clips.length = Math.min(clips.length, 20)
}
const copy = (text) => { remember(text); navigator.clipboard?.writeText(text).catch(() => {}) }

const MODES = [
  { id: 'apps',      symbol: 'appstore',               label: 'Applications', placeholder: 'Search Apps' },
  { id: 'files',     symbol: 'folder',                 label: 'Files',        placeholder: 'Search Files' },
  { id: 'actions',   symbol: 'square.3.layers.3d',     label: 'Actions',      placeholder: 'Search Actions' },
  { id: 'clipboard', symbol: 'doc.on.clipboard',       label: 'Clipboard',    placeholder: 'Search Clipboard' },
]

const ago = (t) => {
  const s = Math.round((Date.now() - t) / 1000)
  if (s < 60) return 'Just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  return `${Math.floor(s / 3600)} hr ago`
}

export default function Spotlight({ onClose }) {
  const [query,  setQuery]  = useState('')
  const [mode,   setMode]   = useState(null)
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef(null)
  const store = useWindowStore()
  const { openWindow, openTool, navigate, openProjectPreview, openFinderAt } = store
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const isDark      = useThemeStore((s) => s.isDark)
  const desktopItems = useDesktopItems()

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 30)
    return () => clearTimeout(t)
  }, [mode])

  const APPS = useMemo(() => [
    { id: 'finder',      name: 'Finder',          icon: finderUrl,     run: () => openFinderAt('applications') },
    { id: 'portfolio',   name: 'Portfolio',       icon: photosUrl,     run: () => navigate('portfolio') },
    { id: 'contacts',    name: 'Contacts',        icon: contactsUrl,   run: () => navigate('about') },
    { id: 'notes',       name: 'Notes',           icon: noteUrl,       run: () => openWindow('notes') },
    { id: 'terminal',    name: 'Terminal',        icon: terminalUrl,   run: () => openWindow('terminal') },
    { id: 'calculator',  name: 'Calculator',      icon: calcUrl,       run: () => openWindow('calculator') },
    { id: 'shop',        name: 'App Store',           icon: appStoreUrl,   run: () => openWindow('shop') },
    { id: 'spotify',     name: 'Spotify',         icon: spotifyUrl,    run: () => openWindow('spotify') },
    { id: 'photo-booth', name: 'Photo Booth',     icon: photoBoothUrl, run: () => openWindow('photo-booth') },
    { id: 'settings',    name: 'System Settings', icon: PANE_ICONS.general, run: () => openWindow('settings') },
    ...TOOLS.map((t) => ({ id: t.id, name: t.name, icon: t.icon, run: () => { navigate('tools'); openTool(t.id) } })),
  ], [openWindow, openTool, navigate, openFinderAt])

  /* Things Spotlight can do rather than open — Tahoe's Actions. */
  const ACTIONS = useMemo(() => [
    { id: 'theme',    title: isDark ? 'Turn Dark Mode Off' : 'Turn Dark Mode On', symbol: isDark ? 'sun.max' : 'moon', run: toggleTheme },
    { id: 'mission',  title: 'Show Mission Control', symbol: 'rectangle.3.group', run: store.toggleMissionControl },
    { id: 'apps',     title: 'Show Launchpad',       symbol: 'square.grid.3x3',   run: store.toggleLaunchpad },
    { id: 'notif',    title: 'Show Notification Center', symbol: 'square.grid.2x2', run: store.toggleNotificationCenter },
    { id: 'note',     title: 'New Note',             symbol: 'square.and.pencil', run: () => openWindow('notes') },
    { id: 'mail',     title: 'Email Mikdad',         symbol: 'envelope.fill',     run: () => store.openMailWindow('ferdousmikdad@gmail.com') },
    { id: 'photo',    title: 'Take a Photo',         symbol: 'photo',             run: () => openWindow('photo-booth') },
    { id: 'airdrop',  title: 'Share with AirDrop',   symbol: 'square.and.arrow.up', run: store.startAirDrop },
    { id: 'lock',     title: 'Lock Screen',          symbol: 'lock',              run: store.lock },
    { id: 'sleep',    title: 'Sleep',                symbol: 'sleep',             run: store.sleep },
  ], [isDark, toggleTheme, store, openWindow])

  const FILES = useMemo(() => [
    ...desktopItems.map((f) => ({
      key: `file-${f.id}`, title: f.name, sub: 'Desktop', icon: f.icon,
      run: () => (f.kind === 'folder' ? openFinderAt(`folder:${f.id}`) : openWindow(f.windowId)),
    })),
    ...(projects ?? []).map((p) => ({
      key: `proj-${p.id}`, title: p.title, sub: 'Portfolio', thumb: p.thumbnail,
      run: () => openProjectPreview(p),
    })),
  ], [desktopItems, openFinderAt, openWindow, openProjectPreview])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const hit = (text) => !q || text.toLowerCase().includes(q)

    if (mode === 'apps') {
      return APPS.filter((a) => hit(a.name)).map((a) => ({ key: `app-${a.id}`, title: a.name, icon: a.icon, run: a.run }))
    }
    if (mode === 'files') return FILES.filter((f) => hit(f.title))
    if (mode === 'actions') {
      return ACTIONS.filter((a) => hit(a.title)).map((a) => ({ key: `act-${a.id}`, title: a.title, symbol: a.symbol, run: a.run }))
    }
    if (mode === 'clipboard') {
      return clips.filter((c) => hit(c.text)).map((c, i) => ({
        key: `clip-${i}`, title: c.text.replace(/\s+/g, ' '), sub: ago(c.at), symbol: 'doc.on.clipboard',
        run: () => copy(c.text),
      }))
    }

    if (!q) return []
    const apps = APPS.filter((a) => hit(a.name))
      .map((a) => ({ key: `app-${a.id}`, group: 'Applications', title: a.name, icon: a.icon, run: a.run }))
    const files = FILES.filter((f) => hit(f.title)).map((f) => ({ ...f, group: 'Files' }))
    const actions = ACTIONS.filter((a) => hit(a.title))
      .map((a) => ({ key: `act-${a.id}`, group: 'Actions', title: a.title, symbol: a.symbol, run: a.run }))

    /* Arithmetic and unit conversions come first, as on the real one;
       Return copies the answer. */
    const answer = spotlightAnswer(query)
    const calc = answer
      ? [{ key: 'calc', group: 'Calculator', title: answer.value, sub: answer.label, icon: calcUrl, run: () => copy(answer.value) }]
      : []

    const panes = SIDEBAR_GROUPS.flat()
      .filter((pane) => hit(pane.label))
      .slice(0, 3)
      .map((pane) => ({ key: `pane-${pane.id}`, group: 'System Settings', title: pane.label,
                        sub: 'Settings', icon: PANE_ICONS[pane.icon], run: () => openWindow('settings') }))

    return [...calc, ...apps, ...files, ...actions, ...panes].slice(0, 10)
  }, [query, mode, APPS, FILES, ACTIONS, openWindow])

  useEffect(() => { setCursor(0) }, [query, mode])

  const run = (item) => { item?.run?.(); onClose() }
  const grid = mode === 'apps'
  const COLS = 6

  const onKeyDown = (e) => {
    /* Escape steps back one thing at a time, as on the Mac: the text, then
       the mode, then Spotlight itself. The menu bar also listens for Escape
       to close Spotlight, so a step that is not the last stops there. */
    if (e.key === 'Escape') {
      if (query || mode) {
        e.nativeEvent.stopPropagation()
        if (query) setQuery('')
        else setMode(null)
      } else onClose()
      return
    }
    if (e.key === 'Backspace' && !query && mode) { e.preventDefault(); setMode(null); return }
    if (!results.length) return
    const step = grid ? COLS : 1
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(results.length - 1, c + step)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor((c) => Math.max(0, c - step)) }
    if (grid && e.key === 'ArrowRight') { e.preventDefault(); setCursor((c) => Math.min(results.length - 1, c + 1)) }
    if (grid && e.key === 'ArrowLeft')  { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)) }
    if (e.key === 'Enter') { e.preventDefault(); run(results[cursor]) }
  }

  const current = MODES.find((m) => m.id === mode)
  const showButtons = !query && !mode

  let lastGroup = null

  return (
    <div className="spotlight-layer" onMouseDown={onClose}>
      <motion.div
        className="spotlight-stack"
        onMouseDown={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: -14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 460, damping: 34 }}
      >
        <div className="spotlight-bar">
          <motion.div layout className="spotlight-pill" transition={{ type: 'spring', stiffness: 420, damping: 36 }}>
            <GlassLayers small />
            <span className="spotlight-pill__icon"><SFSymbol name="magnifyingglass" size={22} /></span>
            {current && (
              <button className="spotlight-chip" title={`Leave ${current.label}`} onClick={() => setMode(null)}>
                <SFSymbol name={current.symbol} size={15} />
                <span>{current.label}</span>
              </button>
            )}
            <input
              ref={inputRef}
              className="spotlight-pill__input"
              value={query}
              placeholder={current?.placeholder ?? 'Spotlight Search'}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
            />
          </motion.div>

          <AnimatePresence initial={false}>
            {showButtons && MODES.map((m, i) => (
              <motion.button
                key={m.id}
                className="spotlight-mode"
                title={m.label}
                onClick={() => setMode(m.id)}
                initial={{ opacity: 0, scale: 0.6, width: 0, marginLeft: 0 }}
                animate={{ opacity: 1, scale: 1, width: 'var(--sp-btn)', marginLeft: 11 }}
                exit={{ opacity: 0, scale: 0.6, width: 0, marginLeft: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 34, delay: i * 0.02 }}
              >
                <GlassLayers small />
                <SFSymbol name={m.symbol} size={23} />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {(results.length > 0 || mode) && (
          <motion.div
            className="spotlight-results"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
          >
            <GlassLayers small />
            {results.length === 0 ? (
              <p className="spotlight-empty">
                {mode === 'clipboard' && !query ? 'Text you copy on this site appears here.' : 'No Results'}
              </p>
            ) : grid ? (
              <div className="spotlight-grid">
                {results.map((r, i) => (
                  <button
                    key={r.key}
                    className={`spotlight-app${i === cursor ? ' is-active' : ''}`}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => run(r)}
                  >
                    <img src={r.icon} alt="" draggable={false} />
                    <span>{r.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              <ul>
                {results.map((r, i) => {
                  const header = r.group && r.group !== lastGroup ? r.group : null
                  lastGroup = r.group
                  return (
                    <li key={r.key}>
                      {header && <p className="spotlight-results__group">{header}</p>}
                      <button
                        className={`spotlight-row${i === cursor ? ' is-active' : ''}`}
                        onMouseEnter={() => setCursor(i)}
                        onClick={() => run(r)}
                      >
                        {r.thumb
                          ? <span className="spotlight-row__thumb"><img src={r.thumb} alt="" /></span>
                          : r.symbol
                            ? <span className="spotlight-row__symbol"><SFSymbol name={r.symbol} size={15} /></span>
                            : <img className="spotlight-row__icon" src={r.icon} alt="" />}
                        <span className="spotlight-row__title">{r.title}</span>
                        {r.sub && <span className="spotlight-row__sub">{r.sub}</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
