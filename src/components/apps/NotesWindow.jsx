import { useState } from 'react'
import Window from '@/components/window/Window'
import WindowSidebar from '@/components/window/WindowSidebar'
import NotesPanel from '@/components/apps/NotesPanel'
import GlassLayers from '@/components/ui/LiquidGlass'
import SFSymbol from '@/components/ui/SFSymbol'
import ContextMenu from '@/components/ui/ContextMenu'
import useNotesStore, { asNote } from '@/store/notesStore'
import { CATEGORIES, NOTES } from '@/data/notes.js'
import useWindowStore from '@/store/windowStore'

/* Notes sidebar glyphs. Every row in a macOS sidebar carries one — a folder
   for a collection, and Notes marks its "All" row with a stack instead. The
   labels used to sit on their own, which is the one thing that reads as a web
   nav rather than a Mac sidebar. */
const FolderGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
    <path d="M1.5 4.2c0-.83.67-1.5 1.5-1.5h2.38c.4 0 .78.16 1.06.44l.92.92h5.64c.83 0 1.5.67 1.5 1.5v6.24c0 .83-.67 1.5-1.5 1.5H3c-.83 0-1.5-.67-1.5-1.5V4.2Z" />
  </svg>
)

const StackGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
    <rect x="2.2" y="2.4" width="11.6" height="3.1" rx="1.1" />
    <rect x="2.2" y="6.45" width="11.6" height="3.1" rx="1.1" opacity="0.72" />
    <rect x="2.2" y="10.5" width="11.6" height="3.1" rx="1.1" opacity="0.45" />
  </svg>
)

const PencilGlyph = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
    <path d="M11.15 1.98a1.6 1.6 0 0 1 2.26 2.26l-.72.72-2.26-2.26.72-.72ZM9.2 3.64l2.26 2.26-6.1 6.1a1.2 1.2 0 0 1-.55.31l-2.3.6a.4.4 0 0 1-.49-.49l.6-2.3c.05-.21.16-.4.31-.55l6.27-5.93Z" />
  </svg>
)

const GLYPHS = {
  all: StackGlyph,
  drawing: PencilGlyph,
}

export default function NotesWindow() {
  const isMaximized = useWindowStore((s) => s.windows.find((w) => w.id === 'notes')?.isMaximized ?? false)

  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const sidebarContent = ({ onClose, onMinimize, onMaximize }) => (
    <WindowSidebar width={210} controls={{ onClose, onMinimize, onMaximize }}>
      <div className="flex flex-col overflow-y-auto window-scroll px-2 py-3 gap-0.5" style={{ flex: 1 }}>
        <p className="px-2.5 pb-1 text-[11px] font-semibold" style={{ color: 'var(--body)', opacity: 0.55 }}>
          Categories
        </p>
        {CATEGORIES.map((cat) => {
          const Glyph = GLYPHS[cat.id] ?? FolderGlyph
          const on = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-[5px] rounded-md text-left text-[12.5px] transition-colors
                ${on ? 'notes-side-row--on' : 'text-[#9b988f] hover:bg-white/5'}`}
              style={{ fontFamily: "'SF Pro Text', system-ui, sans-serif" }}
            >
              {/* Notes tints its folder glyphs with the accent; the selected
                  row inverts to white along with its label. */}
              <span
                className="flex-shrink-0 flex items-center justify-center"
                style={{ width: 16, height: 16, color: on ? '#fff' : 'var(--brand)' }}
              >
                <Glyph />
              </span>
              <span className="truncate">{cat.label}</span>
            </button>
          )
        })}
      </div>
    </WindowSidebar>
  )

  /* ── Toolbar, as Tahoe Notes lays it out ──
     Leading: the folder name over its note count. Trailing, in glass
     capsules: ⋯ (view and note actions), compose, Aa · checklist · table,
     share, and a round search button that opens into a field. Formatting
     works in the visitor's own notes; Mikdad's posts are read-only, so it
     dims there, as Notes dims it in a locked note. */
  const [view, setView]       = useState('list')
  const [selected, setSelected] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menu, setMenu]       = useState(null)
  const [shared, setShared]   = useState(false)
  const mine   = useNotesStore((st) => st.mine)
  const addNote = useNotesStore((st) => st.add)
  const removeNote = useNotesStore((st) => st.remove)

  const count = activeCategory === 'drawing' ? 0
    : activeCategory === 'all' ? NOTES.length + mine.length
    : activeCategory === 'notes' ? NOTES.filter((n) => n.category === 'notes').length + mine.length
    : NOTES.filter((n) => n.category === activeCategory).length
  const current = mine.find((n) => n.id === selected)
    ? asNote(mine.find((n) => n.id === selected))
    : NOTES.find((n) => n.id === selected)
  const editable = !!current?.mine && activeCategory !== 'drawing'
  const noteList = activeCategory !== 'drawing'

  const format = (cmd) => window.dispatchEvent(new CustomEvent('notes:format', { detail: cmd }))
  const openMenu = (e, items) => {
    const r = e.currentTarget.getBoundingClientRect()
    setMenu({ at: { x: Math.round(r.left), y: Math.round(r.bottom + 6) }, items })
  }
  const compose = () => {
    const id = addNote()
    if (activeCategory !== 'all' && activeCategory !== 'notes') setActiveCategory('notes')
    setSearch(''); setView('list'); setSelected(id)
  }
  const share = () => {
    if (!current) return
    navigator.clipboard?.writeText(current.mine ? current.text : `${current.title}\n\n${current.content}`).catch(() => {})
    setShared(true); setTimeout(() => setShared(false), 1400)
  }
  const stop = (e) => e.stopPropagation()

  const navSlot = (
    <div className="notes-heading">
      <span className="notes-heading__name">{CATEGORIES.find((c) => c.id === activeCategory)?.label ?? 'Notes'}</span>
      {noteList && <span className="notes-heading__count">{count} {count === 1 ? 'note' : 'notes'}</span>}
    </div>
  )

  const toolbar = (
    <div className="fd-tools" onPointerDown={stop} onMouseDown={(e) => { if (e.target.closest('button')) e.preventDefault() }}>
      <div className="fd-cap fd-cap--round finder-glass">
        <GlassLayers small />
        <button className="fd-btn" title="More" onClick={(e) => openMenu(e, [
          { label: 'View as List',    checked: view === 'list',    disabled: !noteList, onClick: () => setView('list') },
          { label: 'View as Gallery', checked: view === 'gallery', disabled: !noteList, onClick: () => setView('gallery') },
          { sep: true },
          { label: 'Copy Note', icon: 'doc.on.doc', disabled: !current, onClick: share },
          { label: 'Delete Note', icon: 'trash', disabled: !editable, onClick: () => { removeNote(selected); setSelected(null) } },
        ])}>
          <SFSymbol name="ellipsis" size={15} />
        </button>
      </div>

      <div className="fd-cap fd-cap--round finder-glass">
        <GlassLayers small />
        <button className="fd-btn" title="New Note" onClick={compose}>
          <SFSymbol name="square.and.pencil" size={16} />
        </button>
      </div>

      <div className="fd-cap finder-glass">
        <GlassLayers small />
        <button className="fd-btn notes-aa" title="Format" disabled={!editable} onClick={(e) => openMenu(e, [
          { label: 'Title',   onClick: () => format('title') },
          { label: 'Heading', onClick: () => format('heading') },
          { label: 'Body',    onClick: () => format('body') },
          { sep: true },
          { label: 'Bulleted List', onClick: () => format('bullet') },
          { label: 'Numbered List', onClick: () => format('number') },
        ])}>Aa</button>
        <button className="fd-btn" title="Checklist" disabled={!editable} onClick={() => format('checklist')}>
          <SFSymbol name="checklist" size={16} />
        </button>
        <button className="fd-btn" title="Table" disabled={!editable} onClick={() => format('table')}>
          <SFSymbol name="tablecells" size={16} />
        </button>
      </div>

      <div className="fd-cap fd-cap--round finder-glass">
        <GlassLayers small />
        <button className="fd-btn" title={shared ? 'Copied' : 'Share — copy note'} disabled={!current || !noteList} onClick={share}>
          <SFSymbol name={shared ? 'checkmark' : 'square.and.arrow.up'} size={15} />
        </button>
      </div>

      {searchOpen || search ? (
        <div className="finder-search finder-glass fd-search">
          <GlassLayers small />
          <SFSymbol name="magnifyingglass" size={12} style={{ opacity: 0.6 }} />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => { if (!search) setSearchOpen(false) }}
            onKeyDown={(e) => { if (e.key === 'Escape') { setSearch(''); setSearchOpen(false) } }}
            placeholder="Search"
            className="bg-transparent text-[12px] outline-none w-full"
            onMouseDown={stop}
          />
        </div>
      ) : (
        <div className="fd-cap fd-cap--round finder-glass">
          <GlassLayers small />
          <button className="fd-btn" title="Search" onClick={() => setSearchOpen(true)}>
            <SFSymbol name="magnifyingglass" size={15} />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <Window
      id="notes"
      navSlot={navSlot}
      sidebarContent={sidebarContent}
      toolbar={toolbar}
    >
      {/* The same body Finder shows under its Notes favourite. Only this
          mount answers note requests from the Terminal. */}
      <NotesPanel
        category={activeCategory}
        onCategoryChange={setActiveCategory}
        search={search}
        honorRequests
        wide={isMaximized}
        selectedId={selected}
        onSelect={setSelected}
        view={view}
        onViewChange={setView}
      />
      <ContextMenu at={menu?.at} items={menu?.items ?? []} onClose={() => setMenu(null)} />
    </Window>
  )
}
