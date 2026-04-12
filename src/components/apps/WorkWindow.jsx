import { useState, useMemo } from 'react'
import { Search, Grid2X2, List, Columns3, LayoutGrid } from 'lucide-react'
import Window from '@/components/window/Window'
import projects, { CATEGORIES, TAGS } from '@/data/projects'
import AllIcon           from '@/assets/icons/work-all.svg?react'
import RecentsIcon       from '@/assets/icons/work-recents.svg?react'
import LogoIcon          from '@/assets/icons/work-logo.svg?react'
import ArabicLogoIcon    from '@/assets/icons/work-arabic-logo.svg?react'
import BrandIcon         from '@/assets/icons/work-brand-identity.svg?react'
import LandingIcon       from '@/assets/icons/work-landing-pages.svg?react'
import DashboardsIcon    from '@/assets/icons/work-dashboards.svg?react'
import MobileIcon        from '@/assets/icons/work-mobile-ui.svg?react'

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

// ── Project card ──────────────────────────────────────────────────────────────

function ProjectCard({ project }) {
  return (
    <div
      className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
      style={{ border: '1px solid var(--border)', background: 'var(--wall-bg)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(207,5,6,0.25)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = ''
      }}
    >
      <div style={{ height: 150, background: 'var(--wall-bg)' }}>
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WorkWindow() {
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedType, setSelectedType] = useState(null)
  const [search,       setSearch]       = useState('')
  const [viewMode,     setViewMode]     = useState('grid')

  const filtered = useMemo(() => {
    let list = projects
    if (selectedType === 'recent')       list = [...projects].slice(-4)
    else if (selectedType === 'category') list = projects.filter((p) => p.category === selectedItem)
    else if (selectedType === 'tag')      list = projects.filter((p) => p.tags.includes(selectedItem))
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      )
    }
    return list
  }, [selectedItem, selectedType, search])

  const select = (type, id) => {
    if (selectedType === type && selectedItem === id) {
      setSelectedItem(null); setSelectedType(null)
    } else {
      setSelectedType(type); setSelectedItem(id)
    }
  }

  // ── Toolbar ───────────────────────────────────────────────────────────────

  const viewButtons = [
    { mode: 'grid',   Icon: Grid2X2     },
    { mode: 'list',   Icon: List        },
    { mode: 'cols',   Icon: Columns3    },
    { mode: 'large',  Icon: LayoutGrid  },
  ]

  const toolbar = (
    <div className="flex items-center gap-2" style={{ pointerEvents: 'auto' }}>
      {/* View toggles */}
      <div className="flex items-center rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {viewButtons.map(({ mode, Icon }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className="flex items-center justify-center w-7 h-6 transition-colors"
            style={{
              background: viewMode === mode ? 'var(--wall-bg)' : 'transparent',
              color:      viewMode === mode ? 'var(--headline)' : 'var(--body)',
            }}
          >
            <Icon size={12} />
          </button>
        ))}
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-1.5 px-2 h-6 rounded-md"
        style={{ background: 'var(--wall-bg)', border: '1px solid var(--border)', minWidth: 160 }}
      >
        <Search size={11} style={{ color: 'var(--body)', flexShrink: 0 }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="bg-transparent text-[11px] outline-none w-full"
          style={{ color: 'var(--headline)' }}
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )

  return (
    <Window id="portfolio" title="Portfolio" toolbar={toolbar}>
      <div className="flex h-full overflow-hidden rounded-b-[20px]">

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <div
          className="flex-shrink-0 flex flex-col overflow-y-auto window-scroll py-3 gap-0.5"
          style={{ width: 160, borderRight: '1px solid var(--border)' }}
        >
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
              <p
                className="px-3 pb-1 text-[10px] font-semibold tracking-wide"
                style={{ color: 'var(--body)', opacity: 0.5 }}
              >
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
            <p
              className="px-3 pb-1 text-[10px] font-semibold tracking-wide"
              style={{ color: 'var(--body)', opacity: 0.5 }}
            >
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

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto window-scroll p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: 'var(--body)' }}>
              <Search size={28} style={{ opacity: 0.3 }} />
              <p className="text-[12px]">No results</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="flex flex-col gap-1">
              {filtered.map((project) => {
                const tagColors = project.tags.map((tid) => TAGS.find((t) => t.id === tid)?.color).filter(Boolean)
                return (
                  <div
                    key={project.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                    style={{ border: '1px solid transparent' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--wall-bg)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = 'transparent' }}
                  >
                    <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0" style={{ background: 'var(--wall-bg)' }}>
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--headline)' }}>{project.title}</p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--body)' }}>{project.description}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {tagColors.map((color, i) => (
                        <span key={i} className="w-[7px] h-[7px] rounded-full" style={{ background: color }} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: viewMode === 'cols'  ? 'repeat(2, 1fr)'
                                   : viewMode === 'large' ? 'repeat(4, 1fr)'
                                   : 'repeat(3, 1fr)',
              }}
            >
              {filtered.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

      </div>
    </Window>
  )
}
