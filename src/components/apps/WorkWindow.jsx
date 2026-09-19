import { useState } from 'react'
import useWindowStore from '@/store/windowStore'
import Window from '@/components/window/Window'
import WindowSidebar from '@/components/window/WindowSidebar'
import PortfolioPanel from '@/components/apps/PortfolioPanel'
import { CATEGORIES, TAGS } from '@/data/projects'
import AllIcon           from '@/assets/icons/work-all.svg?react'
import RecentsIcon       from '@/assets/icons/work-recents.svg?react'
import LogoIcon          from '@/assets/icons/work-logo.svg?react'
import ArabicLogoIcon    from '@/assets/icons/work-arabic-logo.svg?react'
import BrandIcon         from '@/assets/icons/work-brand-identity.svg?react'
import LandingIcon       from '@/assets/icons/work-landing-pages.svg?react'
import DashboardsIcon    from '@/assets/icons/work-dashboards.svg?react'
import MobileIcon        from '@/assets/icons/work-mobile-ui.svg?react'
import MacGridIcon       from '@/assets/icons/macgrid.svg?react'
import MacSearchIcon     from '@/assets/icons/macsearch.svg?react'
import macListPng        from '@/assets/icons/maclist.png'

// Icon map per category id
const ICON_MAP = {
  'logo':           LogoIcon,
  'arabic-logo':    ArabicLogoIcon,
  'brand-identity': BrandIcon,
  'landing-pages':  LandingIcon,
  'dashboards':     DashboardsIcon,
  'mobile-ui':      MobileIcon,
}

// ── Sidebar item ──────────────────────────────────────────────────────────────

function SidebarItem({ label, icon: Icon, tag, active, onClick }) {
  const tagColor = tag ? TAGS.find((t) => t.id === tag)?.color : null

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-[5px] rounded-md text-left transition-colors group
        ${active ? 'bg-white/5' : 'hover:bg-white/5'}`}
    >
      <Icon
        width={13} height={13}
        style={{ flexShrink: 0 }}
        className={`transition-colors ${active ? 'text-[#D0CDC4]' : 'text-[#5E5C53] group-hover:text-brand'}`}
      />
      <span className={`text-[12px] font-medium flex-1 truncate transition-colors ${active ? 'text-[#D0CDC4]' : 'text-[#5E5C53]'}`}>{label}</span>
      {tagColor && (
        <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: tagColor }} />
      )}
    </button>
  )
}

// ── Tag filter pill ───────────────────────────────────────────────────────────

function TagRow({ tag, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-[5px] rounded-md text-left transition-colors
        ${active ? 'bg-white/5' : 'hover:bg-white/5'}`}
    >
      <span className="w-[9px] h-[9px] rounded-full flex-shrink-0" style={{ background: tag.color }} />
      <span className={`text-[12px] font-medium transition-colors ${active ? 'text-[#D0CDC4]' : 'text-[#5E5C53]'}`}>{tag.label}</span>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WorkWindow() {
  const isMaximized = useWindowStore((s) => s.windows.find((w) => w.id === 'portfolio')?.isMaximized ?? false)

  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedType, setSelectedType] = useState(null)
  const [search,       setSearch]       = useState('')
  const [viewMode,     setViewMode]     = useState('grid')

  const select = (type, id) => {
    if (selectedType === type && selectedItem === id) {
      setSelectedItem(null); setSelectedType(null)
    } else {
      setSelectedType(type); setSelectedItem(id)
    }
  }

  // ── Toolbar ───────────────────────────────────────────────────────────────

  const glassPill = {
    backgroundColor:      'rgba(40, 40, 40, 0.20)',
    // Refraction 65 → stronger highlight band; Dispersion 50 → wide fade to transparent
    backgroundImage:      'linear-gradient(-45deg, rgba(255,255,255,0.165) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.00) 100%)',
    // Depth 10 → blur(10px); Frost 2.5 → slight saturation + brightness lift
    backdropFilter:       'blur(10px) saturate(1.4) brightness(1.025)',
    WebkitBackdropFilter: 'blur(10px) saturate(1.4) brightness(1.025)',
    borderRadius:         9999,
    border:               '1px solid rgba(255,255,255,0.07)',
    // Shadow blur 8px
    boxShadow:            '0 2px 8px rgba(0,0,0,0.10)',
  }

  const toolbar = (
    <div className="flex items-center gap-2" style={{ pointerEvents: 'auto' }}>
      {/* View toggle pill */}
      <div className="flex items-center gap-0.5 p-[3px]" style={glassPill}>
        <button
          onClick={() => setViewMode('grid')}
          className="flex items-center justify-center w-[26px] h-[22px] rounded-full transition-all duration-150"
          style={{ background: viewMode === 'grid' ? 'rgba(255,255,255,0.12)' : 'transparent' }}
          title="Grid view"
        >
          <MacGridIcon width={12} height={12} style={{ color: viewMode === 'grid' ? '#fff' : 'rgba(255,255,255,0.45)' }} />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className="flex items-center justify-center w-[26px] h-[22px] rounded-full transition-all duration-150"
          style={{ background: viewMode === 'list' ? 'rgba(255,255,255,0.12)' : 'transparent' }}
          title="List view"
        >
          <img
            src={macListPng}
            alt="list"
            width={12}
            height={12}
            style={{ opacity: viewMode === 'list' ? 1 : 0.45, transition: 'opacity 0.15s' }}
          />
        </button>
      </div>

      {/* Search pill */}
      <div
        className="flex items-center gap-2 px-3"
        style={{ ...glassPill, height: 28, minWidth: 190 }}
      >
        <MacSearchIcon
          width={11}
          height={11}
          style={{ color: 'rgba(255,255,255,0.45)', flexShrink: 0 }}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="bg-transparent text-[11px] outline-none w-full placeholder:text-white/35"
          style={{ color: '#fff' }}
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )

  // ── Sidebar panel (passed as render prop to Window) ──────────────────────
  const sidebarContent = ({ onClose, onMinimize, onMaximize }) => (
    <WindowSidebar width={210} controls={{ onClose, onMinimize, onMaximize }}>


    {/* Navigation list */}
    <div className="flex flex-col overflow-y-auto window-scroll px-2 py-3 gap-0.5" style={{ flex: 1 }}>
      {/* All */}
      <button
        onClick={() => { setSelectedItem(null); setSelectedType(null) }}
        className={`w-full flex items-center gap-2 px-3 py-[5px] rounded-md text-left transition-colors group
          ${!selectedType ? 'bg-white/5' : 'hover:bg-white/5'}`}
      >
        <AllIcon
          width={13} height={13}
          style={{ flexShrink: 0 }}
          className={`transition-colors ${!selectedType ? 'text-[#D0CDC4]' : 'text-[#5E5C53] group-hover:text-brand'}`}
        />
        <span className={`text-[12px] font-medium transition-colors ${!selectedType ? 'text-[#D0CDC4]' : 'text-[#5E5C53]'}`}>All</span>
      </button>

      {/* Recents */}
      <button
        onClick={() => select('recent', 'recent')}
        className={`w-full flex items-center gap-2 px-3 py-[5px] rounded-md text-left transition-colors group
          ${selectedType === 'recent' ? 'bg-white/5' : 'hover:bg-white/5'}`}
      >
        <RecentsIcon
          width={13} height={13}
          style={{ flexShrink: 0 }}
          className={`transition-colors ${selectedType === 'recent' ? 'text-[#D0CDC4]' : 'text-[#5E5C53] group-hover:text-brand'}`}
        />
        <span className={`text-[12px] font-medium transition-colors ${selectedType === 'recent' ? 'text-[#D0CDC4]' : 'text-[#5E5C53]'}`}>Recents</span>
      </button>

      <div className="h-1.5" />

      {/* Categories */}
      {CATEGORIES.map((cat) => (
        <div key={cat.section} className="mb-2">
          <p className="px-3 pb-1 text-[10px] font-semibold tracking-wide" style={{ color: '#5E5C53' }}>
            {cat.section}
          </p>
          {cat.items.map((item) => {
            const Icon = ICON_MAP[item.id]
            return (
              <SidebarItem
                key={item.id}
                label={item.label}
                icon={Icon}
                tag={item.tag}
                active={selectedType === 'category' && selectedItem === item.id}
                onClick={() => select('category', item.id)}
              />
            )
          })}
        </div>
      ))}

      {/* Tags */}
      <div>
        <p className="px-3 pb-1 text-[10px] font-semibold tracking-wide" style={{ color: '#5E5C53' }}>
          Tags
        </p>
        {TAGS.map((tag) => (
          <TagRow
            key={tag.id}
            tag={tag}
            active={selectedType === 'tag' && selectedItem === tag.id}
            onClick={() => select('tag', tag.id)}
          />
        ))}
      </div>
    </div>
    </WindowSidebar>
  )

  return (
    <>
    <Window id="portfolio" title="Portfolio" toolbar={toolbar} sidebarContent={sidebarContent}>

      {/* ── Content — the same wall Finder shows under its Portfolio favourite ── */}
      <PortfolioPanel
        type={selectedType}
        item={selectedItem}
        search={search}
        viewMode={viewMode}
        wide={isMaximized}
      />

    </Window>
    </>
  )
}
