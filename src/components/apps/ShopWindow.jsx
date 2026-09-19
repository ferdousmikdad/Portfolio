import { useState } from 'react'
import Window from '@/components/window/Window'
import WindowSidebar from '@/components/window/WindowSidebar'
import ShopPanel from '@/components/apps/ShopPanel'
import GlassLayers from '@/components/ui/LiquidGlass'
import MacSearchIcon from '@/assets/icons/macsearch.svg?react'
import { SHOP_CATEGORIES } from '@/data/stickResources'

/* The Shop is the App Store of this desktop, and App Store — like Finder,
   Notes and System Settings — is a sidebar window: sections down the left,
   search in the toolbar. It used to be a bare `Window` with the title jammed
   against the traffic lights and the shelf beneath it, which is the shape of
   a web page, not of a Mac app. ShopPanel already took `category` and
   `search` for Finder's sake; this window now drives them too. */

/* A sidebar row. macOS never lists a bare word — every row carries a glyph at
   a fixed leading position, which is what keeps the labels on one optical
   line down the pane. */
function ShopRow({ label, active, dot, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2.5 py-[5px] rounded-md text-left text-[12.5px] transition-colors
        ${active ? 'shop-side-row--on' : 'hover:bg-white/5'}`}
      style={{ fontFamily: "'SF Pro Text', system-ui, sans-serif" }}
    >
      <span className="flex-shrink-0 flex items-center justify-center" style={{ width: 16, height: 16 }}>
        {icon ?? <span style={{ width: 7, height: 7, borderRadius: 9999, background: dot }} />}
      </span>
      <span className="truncate">{label}</span>
    </button>
  )
}

export default function ShopWindow() {
  const [category, setCategory] = useState(null)
  const [search, setSearch] = useState('')

  const sidebarContent = ({ onClose, onMinimize, onMaximize }) => (
    <WindowSidebar width={200} controls={{ onClose, onMinimize, onMaximize }}>
      <div className="flex flex-col overflow-y-auto window-scroll px-2 py-2 gap-0.5" style={{ flex: 1 }}>
        <ShopRow
          label="All resources"
          active={!category}
          onClick={() => setCategory(null)}
          icon={
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <rect x="1.6" y="1.6" width="5.2" height="5.2" rx="1.5" fill="currentColor" />
              <rect x="9.2" y="1.6" width="5.2" height="5.2" rx="1.5" fill="currentColor" />
              <rect x="1.6" y="9.2" width="5.2" height="5.2" rx="1.5" fill="currentColor" />
              <rect x="9.2" y="9.2" width="5.2" height="5.2" rx="1.5" fill="currentColor" />
            </svg>
          }
        />

        <p className="px-2.5 pt-3 pb-1 text-[11px] font-semibold" style={{ color: 'var(--body)', opacity: 0.55 }}>
          Categories
        </p>
        {SHOP_CATEGORIES.map((cat) => (
          <ShopRow
            key={cat}
            label={cat}
            dot="rgba(255,255,255,0.32)"
            active={category === cat}
            onClick={() => setCategory(category === cat ? null : cat)}
          />
        ))}
      </div>
    </WindowSidebar>
  )

  /* Search belongs in the toolbar, at the trailing edge — the same control
     Finder puts there, so the two windows read as one system. */
  const toolbar = (
    <div className="flex items-center gap-2" style={{ pointerEvents: 'auto' }}>
      <div className="finder-search finder-glass">
        <GlassLayers small />
        <MacSearchIcon width={11} height={11} style={{ flexShrink: 0 }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search resources…"
          className="bg-transparent text-[11px] outline-none w-full"
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )

  return (
    <Window
      id="shop"
      title={category ?? 'All resources'}
      sidebarContent={sidebarContent}
      toolbar={toolbar}
    >
      <ShopPanel category={category} search={search} heading={false} />
    </Window>
  )
}
