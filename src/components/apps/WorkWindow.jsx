import { useState, useMemo } from 'react'
import { Search, Grid3X3, List, Columns3, Clock } from 'lucide-react'
import Window from '@/components/window/Window'
import projects, { CATEGORIES, TAGS } from '@/data/projects'

// ── Sidebar item ──────────────────────────────────────────────────────────────

function SidebarItem({ label, tag, active, onClick }) {
  const tagColor = tag ? TAGS.find((t) => t.id === tag)?.color : null

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-[5px] rounded-md text-left transition-colors"
      style={{
        background: active ? 'rgba(207,5,6,0.12)' : 'transparent',
        color: active ? '#cf0506' : 'var(--body)',
      }}
    >
      {/* folder-like glyph */}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.7 }}>
        <path
          d="M1.5 3.5C1.5 2.95 1.95 2.5 2.5 2.5H5.5L7 4H11.5C12.05 4 12.5 4.45 12.5 5V10.5C12.5 11.05 12.05 11.5 11.5 11.5H2.5C1.95 11.5 1.5 11.05 1.5 10.5V3.5Z"
          fill={active ? '#cf0506' : 'currentColor'}
          fillOpacity={active ? 0.9 : 0.4}
        />
      </svg>
      <span className="text-[12px] font-medium flex-1 truncate">{label}</span>
      {tagColor && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: tagColor }}
        />
      )}
    </button>
  )
}

// ── Tag filter pill ───────────────────────────────────────────────────────────

function TagRow({ tag, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-[5px] rounded-md text-left transition-colors"
      style={{
        background: active ? 'rgba(207,5,6,0.12)' : 'transparent',
        color: active ? '#cf0506' : 'var(--body)',
      }}
    >
      <span className="w-[10px] h-[10px] rounded-full flex-shrink-0" style={{ background: tag.color }} />
      <span className="text-[12px] font-medium">{tag.label}</span>
    </button>
  )
}

// ── Project card ──────────────────────────────────────────────────────────────

function ProjectCard({ project }) {
  return (
    <div
      className="group flex flex-col rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
      style={{ border: '1px solid var(--border)', background: 'var(--wall-bg)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(207,5,6,0.3)'
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = ''
        e.currentTarget.style.boxShadow = ''
      }}
    >
      {/* Image only */}
      <div
        className="overflow-hidden"
        style={{ height: 150, background: 'var(--wall-bg)' }}
      >
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
  const [selectedItem, setSelectedItem] = useState(null) // category item id or tag id
  const [selectedType, setSelectedType] = useState(null) // 'category' | 'tag' | 'recent'
  const [search, setSearch]             = useState('')
  const [viewMode, setViewMode]         = useState('grid') // 'grid' | 'list'

  const filtered = useMemo(() => {
    let list = projects

    if (selectedType === 'recent') {
      list = [...projects].slice(-4)
    } else if (selectedType === 'category') {
      list = projects.filter((p) => p.category === selectedItem)
    } else if (selectedType === 'tag') {
      list = projects.filter((p) => p.tags.includes(selectedItem))
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    }

    return list
  }, [selectedItem, selectedType, search])

  const select = (type, id) => {
    if (selectedType === type && selectedItem === id) {
      setSelectedItem(null)
      setSelectedType(null)
    } else {
      setSelectedType(type)
      setSelectedItem(id)
    }
  }

  // ── Toolbar injected into Window titlebar ─────────────────────────────────

  const toolbar = (
    <div className="flex items-center gap-2" style={{ pointerEvents: 'auto' }}>
      {/* View toggles */}
      <div
        className="flex items-center rounded-md overflow-hidden"
        style={{ border: '1px solid var(--border)' }}
      >
        {[
          { mode: 'grid', Icon: Grid3X3 },
          { mode: 'list', Icon: List },
          { mode: 'col',  Icon: Columns3 },
        ].map(({ mode, Icon }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className="flex items-center justify-center w-7 h-6 transition-colors"
            style={{
              background: viewMode === mode ? 'var(--wall-bg)' : 'transparent',
              color: viewMode === mode ? 'var(--headline)' : 'var(--body)',
            }}
          >
            <Icon size={13} />
          </button>
        ))}
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-1.5 px-2 h-6 rounded-md"
        style={{ background: 'var(--wall-bg)', border: '1px solid var(--border)', minWidth: 140 }}
      >
        <Search size={11} style={{ color: 'var(--body)', flexShrink: 0 }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="bg-transparent text-[11px] outline-none w-full"
          style={{ color: 'var(--headline)' }}
          onMouseDown={(e) => e.stopPropagation()} // prevent window drag
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
          style={{
            width: 172,
            borderRight: '1px solid var(--border)',
          }}
        >
          {/* All */}
          <button
            onClick={() => { setSelectedItem(null); setSelectedType(null) }}
            className="w-full flex items-center gap-2 px-3 py-[5px] rounded-md text-left transition-colors"
            style={{
              background: !selectedType ? 'rgba(207,5,6,0.12)' : 'transparent',
              color: !selectedType ? '#cf0506' : 'var(--body)',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, opacity: 0.7 }}>
              <rect x="1" y="1" width="4.5" height="4.5" rx="1" fill="currentColor" />
              <rect x="7.5" y="1" width="4.5" height="4.5" rx="1" fill="currentColor" />
              <rect x="1" y="7.5" width="4.5" height="4.5" rx="1" fill="currentColor" />
              <rect x="7.5" y="7.5" width="4.5" height="4.5" rx="1" fill="currentColor" />
            </svg>
            <span className="text-[12px] font-medium">All</span>
          </button>

          {/* Recents */}
          <button
            onClick={() => select('recent', 'recent')}
            className="w-full flex items-center gap-2 px-3 py-[5px] rounded-md text-left transition-colors mx-0"
            style={{
              background: selectedType === 'recent' ? 'rgba(207,5,6,0.12)' : 'transparent',
              color: selectedType === 'recent' ? '#cf0506' : 'var(--body)',
            }}
          >
            <Clock size={13} style={{ flexShrink: 0, opacity: 0.7 }} />
            <span className="text-[12px] font-medium">Recents</span>
          </button>

          <div className="h-2" />

          {/* Categories */}
          {CATEGORIES.map((cat) => (
            <div key={cat.section} className="mb-1">
              <p
                className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--body)', opacity: 0.6 }}
              >
                {cat.section}
              </p>
              {cat.items.map((item) => (
                <SidebarItem
                  key={item.id}
                  label={item.label}
                  tag={item.tag}
                  active={selectedType === 'category' && selectedItem === item.id}
                  onClick={() => select('category', item.id)}
                />
              ))}
              <div className="h-1" />
            </div>
          ))}

          {/* Tags */}
          <div>
            <p
              className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: 'var(--body)', opacity: 0.6 }}
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

        {/* ── Grid / List ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto window-scroll p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: 'var(--body)' }}>
              <Search size={28} style={{ opacity: 0.3 }} />
              <p className="text-[12px]">No results</p>
            </div>
          ) : viewMode === 'list' ? (
            /* List view */
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
                      <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--headline)', fontFamily: "'SF Pro Display'" }}>{project.title}</p>
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
            /* Grid view (default) */
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
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
