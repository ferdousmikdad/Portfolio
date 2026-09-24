import { useEffect, useMemo, useRef, useState } from 'react'
import useWindowStore from '@/store/windowStore'
import Window from '@/components/window/Window'
import WindowSidebar from '@/components/window/WindowSidebar'
import GlassLayers from '@/components/ui/LiquidGlass'
import SFSymbol from '@/components/ui/SFSymbol'
import projects, { CATEGORIES, TAGS } from '@/data/projects'
import { filterProjects } from '@/components/apps/PortfolioPanel'

/* ── Portfolio — the Photos app ──────────────────────────────────────────────
   Measured off Tahoe Photos: a glass sidebar of 32pt rows with outline
   symbols, the selected row the accent with white icon and label; the view's
   name in the toolbar beside a glass segmented control and search capsule.
   Library is the Collections page — one section per album, each opening as
   its own tab — and an album is square crops edge to edge with hairline gaps
   and a count under the last row.

   Photos semantics throughout: in an album a click selects and a
   double-click (or Return / Space) opens; a Collections card opens on one
   click, as an album card does there; − / + zoom whichever is showing.     */

const ICONS = {
  'logo':           'seal',
  'arabic-logo':    'character.book.closed',
  'brand-identity': 'paintpalette',
  'landing-pages':  'macwindow',
  'dashboards':     'chart.bar.xaxis',
  'mobile-ui':      'iphone',
}

// Tile edge lengths the − / + buttons step through.
const ZOOM = [110, 150, 200, 260, 340]

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

function countLine(list) {
  const videos = list.filter((p) => p.thumbnailType === 'video').length
  const images = list.length - videos
  if (!videos) return plural(images, 'Item')
  if (!images) return plural(videos, 'Video')
  return `${plural(images, 'Item')}, ${plural(videos, 'Video')}`
}

const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

// ── Sidebar row ───────────────────────────────────────────────────────────────

function Row({ symbol, dot, label, active, onClick }) {
  return (
    <button className={`ph-row${active ? ' ph-row--on' : ''}`} onClick={onClick}>
      {symbol
        ? <SFSymbol name={symbol} size={17} className="ph-row__icon" />
        : <span className="ph-row__dot" style={{ background: dot }} />}
      <span className="ph-row__label">{label}</span>
    </button>
  )
}

// ── Grid tile ─────────────────────────────────────────────────────────────────

/* Video tiles carry their running time in the corner, the way Photos marks
   every video; the length is read off the file itself. */
function Tile({ project, selected, onSelect, onOpen }) {
  const [duration, setDuration] = useState(null)
  const isVideo = project.thumbnailType === 'video'
  return (
    <button
      className={`ph-tile${selected ? ' ph-tile--on' : ''}`}
      onMouseDown={(e) => { e.stopPropagation(); onSelect() }}
      onDoubleClick={onOpen}
      title={project.title}
    >
      {isVideo ? (
        <video
          src={project.thumbnail}
          autoPlay muted loop playsInline
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />
      ) : (
        <img src={project.thumbnail || project.image} alt={project.title} draggable={false} loading="lazy" />
      )}
      {isVideo && duration != null && <span className="ph-tile__time">{clock(duration)}</span>}
    </button>
  )
}

// ── Library — laid out as Photos' Collections ─────────────────────────────────

/* Measured off Collections at 2x: 135pt square cards (scaled here by the
   zoom buttons) with a 13pt radius and 17pt gaps, the name in white bold at
   the bottom-left over the picture; a bold section title with a grey › that
   opens the section on its own, and a round collapse button on the right. */
const CARD = [110, 135, 165, 200, 240]

function Card({ project, size, onOpen }) {
  const isVideo = project.thumbnailType === 'video'
  return (
    <button className="ph-card" style={{ width: size, height: size }} onClick={onOpen} title={project.title}>
      {isVideo
        ? <video src={project.thumbnail} autoPlay muted loop playsInline />
        : <img src={project.thumbnail || project.image} alt="" draggable={false} loading="lazy" />}
      <span className="ph-card__label">{project.title}</span>
    </button>
  )
}

function Section({ title, items, size, collapsed, onToggle, onOpenSection, onOpenProject, empty }) {
  return (
    <section className="ph-sec">
      <div className="ph-sec__head">
        <button className="ph-sec__title" onClick={onOpenSection}>
          {title}
          <SFSymbol name="chevron.right" size={15} className="ph-sec__chev" />
        </button>
        <button
          className={`ph-sec__toggle${collapsed ? ' ph-sec__toggle--closed' : ''}`}
          onClick={onToggle}
          title={collapsed ? 'Show' : 'Hide'}
        >
          <SFSymbol name="chevron.down" size={12} />
        </button>
      </div>
      {!collapsed && (items.length ? (
        <div className="ph-sec__row">
          {items.map((p) => <Card key={p.id} project={p} size={size} onOpen={() => onOpenProject(p)} />)}
        </div>
      ) : (
        <div className="ph-sec__empty">
          <p className="ph-sec__empty-title">No {title} Available</p>
          <p className="ph-sec__empty-sub">{empty}</p>
        </div>
      ))}
    </section>
  )
}

// ── Window ────────────────────────────────────────────────────────────────────

export default function WorkWindow() {
  const openProjectPreview = useWindowStore((s) => s.openProjectPreview)
  const isActive = useWindowStore((s) => s.activeWindowId === 'portfolio')

  const [view,     setView]     = useState({ type: null, item: null })
  const [search,   setSearch]   = useState('')
  const [zoom,     setZoom]     = useState(1)
  const [selected, setSelected] = useState(null)
  const [collapsed, setCollapsed] = useState(() => new Set())
  const scrollRef = useRef(null)

  const list = useMemo(
    () => filterProjects({ type: view.type, item: view.item, search }),
    [view, search],
  )

  const go = (type, item) => {
    setView({ type, item })
    setSelected(null)
    scrollRef.current?.scrollTo({ top: 0 })
  }
  const is = (type, item) => view.type === type && view.item === item

  // Tags only earn a row once something carries them — an empty filter is a dead end.
  const usedTags = TAGS.filter((t) => projects.some((p) => p.tags.includes(t.id)))

  const title =
    view.type === 'recent'   ? 'Recently Added' :
    view.type === 'category' ? CATEGORIES.flatMap((c) => c.items).find((i) => i.id === view.item)?.label :
    view.type === 'tag'      ? TAGS.find((t) => t.id === view.item)?.label :
    'Library'

  /* Return or Space opens the selection, Escape clears it, ⌘− / ⌘+ zoom —
     only while this window has focus and you are not typing in the search. */
  useEffect(() => {
    if (!isActive) return
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement) return
      if ((e.key === 'Enter' || e.key === ' ') && selected) {
        e.preventDefault()
        const p = list.find((x) => x.id === selected)
        if (p) openProjectPreview(p)
      }
      if (e.key === 'Escape') setSelected(null)
      if (e.metaKey && (e.key === '=' || e.key === '+')) { e.preventDefault(); setZoom((z) => Math.min(ZOOM.length - 1, z + 1)) }
      if (e.metaKey && e.key === '-')                    { e.preventDefault(); setZoom((z) => Math.max(0, z - 1)) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isActive, selected, list, openProjectPreview])

  // ── Toolbar ──

  const toolbar = (
    <div className="flex items-center gap-2" style={{ pointerEvents: 'auto' }} onPointerDown={(e) => e.stopPropagation()}>
      <div className="ph-seg finder-glass">
        <GlassLayers small />
        <button onClick={() => setZoom((z) => Math.max(0, z - 1))} disabled={zoom === 0} title="Zoom Out (⌘−)">
          <SFSymbol name="minus" size={12} />
        </button>
        <span className="ph-seg__sep" />
        <button onClick={() => setZoom((z) => Math.min(ZOOM.length - 1, z + 1))} disabled={zoom === ZOOM.length - 1} title="Zoom In (⌘+)">
          <SFSymbol name="plus" size={12} />
        </button>
      </div>
      <div className="finder-search finder-glass" style={{ minWidth: 200 }}>
        <GlassLayers small />
        <SFSymbol name="magnifyingglass" size={12} style={{ opacity: 0.6 }} />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelected(null) }}
          placeholder="Search"
          className="bg-transparent text-[12px] outline-none w-full"
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )

  // ── Sidebar ──

  const sidebarContent = ({ onClose, onMinimize, onMaximize }) => (
    <WindowSidebar width={214} controls={{ onClose, onMinimize, onMaximize }}>
      <div className="ph-side window-scroll">
        <Row symbol="photo.on.rectangle" label="Library"        active={!view.type}           onClick={() => go(null, null)} />
        <Row symbol="clock"              label="Recently Added" active={is('recent', 'recent')} onClick={() => go('recent', 'recent')} />

        {CATEGORIES.map((cat) => (
          <div key={cat.section}>
            <p className="ph-section">{cat.section}</p>
            {cat.items.map((item) => (
              <Row
                key={item.id}
                symbol={ICONS[item.id] ?? 'photo'}
                label={item.label}
                active={is('category', item.id)}
                onClick={() => go('category', item.id)}
              />
            ))}
          </div>
        ))}

        {usedTags.length > 0 && (
          <div>
            <p className="ph-section">Tags</p>
            {usedTags.map((t) => (
              <Row key={t.id} dot={t.color} label={t.label} active={is('tag', t.id)} onClick={() => go('tag', t.id)} />
            ))}
          </div>
        )}
      </div>
    </WindowSidebar>
  )

  const selectedIndex = list.findIndex((p) => p.id === selected)
  const searching = !!search.trim()

  /* Library is the Collections page: every album in turn, each its own
     section, newest work first. Searching drops back to one flat grid. */
  const sections = [
    { id: 'recent', title: 'Recently Added', items: filterProjects({ type: 'recent' }), open: () => go('recent', 'recent') },
    ...CATEGORIES.flatMap((c) => c.items).map((item) => ({
      id: item.id,
      title: item.label,
      items: filterProjects({ type: 'category', item: item.id }),
      open: () => go('category', item.id),
    })),
  ]
  const toggle = (id) => setCollapsed((prev) => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  return (
    <Window id="portfolio" title={searching ? 'Search Results' : title} toolbar={toolbar} sidebarContent={sidebarContent}>
      <div ref={scrollRef} className="ph-content window-scroll" onMouseDown={() => setSelected(null)}>
        {!view.type && !searching ? (
          <div className="ph-collections">
            {sections.map((sec) => (
              <Section
                key={sec.id}
                title={sec.title}
                items={sec.items}
                size={CARD[zoom]}
                collapsed={collapsed.has(sec.id)}
                onToggle={() => toggle(sec.id)}
                onOpenSection={sec.open}
                onOpenProject={openProjectPreview}
                empty={`Projects in ${sec.title} will appear here as they are added.`}
              />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="ph-empty">
            <p className="ph-empty__title">No Results</p>
            <p className="ph-empty__sub">Try a new search.</p>
          </div>
        ) : (
          <>
            <div className="ph-grid" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${ZOOM[zoom]}px, 1fr))` }}>
              {list.map((p) => (
                <Tile
                  key={p.id}
                  project={p}
                  selected={p.id === selected}
                  onSelect={() => setSelected(p.id)}
                  onOpen={() => openProjectPreview(p)}
                />
              ))}
            </div>
            <p className="ph-foot">
              {selectedIndex >= 0 ? `1 of ${plural(list.length, 'Item')} Selected` : countLine(list)}
            </p>
          </>
        )}
      </div>
    </Window>
  )
}
