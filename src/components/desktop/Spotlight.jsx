/* ── Spotlight ──────────────────────────────────────────────────────────────
   Tahoe's Spotlight is a free-floating capsule near the top third of the
   screen — not a menu hanging off the bar — about 700pt wide and 62pt tall,
   with a hairline rim and nothing inside it but the magnifier and the
   placeholder. Results grow a second capsule underneath it.

   The glass is the project's own Liquid Glass stack, so the backdrop is bent
   through the displacement map rather than just blurred.                    */

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import useWindowStore from '@/store/windowStore'
import GlassLayers from '@/components/ui/LiquidGlass'
import projects from '@/data/projects'
import TOOLS from '@/data/tools'
import { PANE_ICONS, SIDEBAR_GROUPS } from '@/data/settingsPanes'
import spotlightAnswer from '@/utils/spotlightMath'
import finderUrl   from '@/assets/icons/finder.svg?url'
import folderUrl   from '@/assets/icons/Folder.png'
import noteUrl     from '@/assets/icons/note.png'
import terminalUrl from '@/assets/icons/terminal.svg?url'
import calcUrl     from '@/assets/icons/Calculator@4x 1.png'
import appStoreUrl from '@/assets/icons/App Store.png'
import spotifyUrl  from '@/assets/icons/spotify.svg?url'

function SearchGlyph({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="10.5" cy="10.5" r="7" />
      <path d="M15.8 15.8 21 21" />
    </svg>
  )
}

export default function Spotlight({ onClose }) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef(null)
  const { openWindow, openTool, navigate, openProjectPreview, openFinderAt } = useWindowStore()

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 30)
    return () => clearTimeout(t)
  }, [])

  const APPS = useMemo(() => [
    { id: 'finder',     name: 'Finder',      icon: finderUrl,   run: () => openFinderAt('applications') },
    { id: 'notes',      name: 'Notes',       icon: noteUrl,     run: () => openWindow('notes') },
    { id: 'terminal',   name: 'Terminal',    icon: terminalUrl, run: () => openWindow('terminal') },
    { id: 'calculator', name: 'Calculator',  icon: calcUrl,     run: () => openWindow('calculator') },
    { id: 'shop',       name: 'Store',       icon: appStoreUrl, run: () => openWindow('shop') },
    { id: 'spotify',    name: 'Spotify',     icon: spotifyUrl,  run: () => openWindow('spotify') },
    { id: 'settings',   name: 'System Settings', icon: PANE_ICONS.general, run: () => openWindow('settings') },
    { id: 'portfolio',  name: 'Portfolio',   icon: folderUrl,   run: () => navigate('portfolio') },
  ], [openWindow, openTool, navigate, openFinderAt])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const hit = (text) => text.toLowerCase().includes(q)

    const apps = APPS.filter(a => hit(a.name))
      .map(a => ({ key: `app-${a.id}`, group: 'Applications', title: a.name, icon: a.icon, run: a.run }))

    const tools = TOOLS.filter(t => hit(t.name))
      .map(t => ({ key: `tool-${t.id}`, group: 'Tools', title: t.name, icon: t.icon,
                   run: () => { navigate('tools'); openTool(t.id) } }))

    const works = (projects ?? []).filter(p => hit(p.title) || hit(p.category ?? ''))
      .map(p => ({ key: `proj-${p.id}`, group: 'Projects', title: p.title,
                   sub: p.category, thumb: p.thumbnail,
                   run: () => openProjectPreview(p) }))

    /* Spotlight answers arithmetic and unit conversions itself, above
       everything else — the way the real one puts the result on top. Enter
       copies it, which is what the Mac does too. */
    const answer = spotlightAnswer(query)
    const calc = answer
      ? [{
          key: 'calc',
          group: 'Calculator',
          title: answer.value,
          sub: answer.label,
          icon: calcUrl,
          run: () => navigator.clipboard?.writeText(answer.value).catch(() => {}),
        }]
      : []

    const panes = SIDEBAR_GROUPS.flat()
      .filter(pane => hit(pane.label))
      .slice(0, 3)
      .map(pane => ({ key: `pane-${pane.id}`, group: 'System Settings', title: pane.label,
                      sub: 'Settings', icon: PANE_ICONS[pane.icon],
                      run: () => openWindow('settings') }))

    return [...calc, ...apps, ...tools, ...works, ...panes].slice(0, 9)
  }, [query, APPS, navigate, openTool, openProjectPreview, openWindow])

  useEffect(() => { setCursor(0) }, [query])

  const run = (item) => { item?.run?.(); onClose() }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); return }
    if (!results.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => (c + 1) % results.length) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => (c - 1 + results.length) % results.length) }
    if (e.key === 'Enter')     { e.preventDefault(); run(results[cursor]) }
  }

  // Group headers are drawn inline, so the list stays one flat keyboard ring
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
        <div className="spotlight-pill">
          <GlassLayers small />
          <span className="spotlight-pill__icon"><SearchGlyph /></span>
          <input
            ref={inputRef}
            className="spotlight-pill__input"
            value={query}
            placeholder="Spotlight Search"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
          />
        </div>

        {results.length > 0 && (
          <motion.div
            className="spotlight-results"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
          >
            <GlassLayers small />
            <ul>
              {results.map((r, i) => {
                const header = r.group !== lastGroup ? r.group : null
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
                        : <img className="spotlight-row__icon" src={r.icon} alt="" />}
                      <span className="spotlight-row__title">{r.title}</span>
                      {r.sub && <span className="spotlight-row__sub">{r.sub}</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
