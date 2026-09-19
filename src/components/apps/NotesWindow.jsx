import { useState } from 'react'
import Window from '@/components/window/Window'
import WindowSidebar from '@/components/window/WindowSidebar'
import NotesPanel from '@/components/apps/NotesPanel'
import GlassLayers from '@/components/ui/LiquidGlass'
import MacSearchIcon from '@/assets/icons/macsearch.svg?react'
import { CATEGORIES } from '@/data/notes.js'
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
                style={{ width: 16, height: 16, color: on ? '#fff' : 'var(--brand, #cf0506)' }}
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

  /* Notes keeps a search field at the trailing edge of its toolbar, the same
     control Finder and the Shop carry. The window had no toolbar at all
     before — just the word "Notes" floating over the list column. */
  const toolbar = (
    <div className="flex items-center gap-2" style={{ pointerEvents: 'auto' }}>
      <div className="finder-search finder-glass">
        <GlassLayers small />
        <MacSearchIcon width={11} height={11} style={{ flexShrink: 0 }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes…"
          className="bg-transparent text-[11px] outline-none w-full"
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )

  return (
    <Window
      id="notes"
      title={CATEGORIES.find((c) => c.id === activeCategory)?.label ?? 'Notes'}
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
      />
    </Window>
  )
}
