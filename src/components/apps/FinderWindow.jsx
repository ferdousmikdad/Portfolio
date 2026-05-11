import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Window from '@/components/window/Window'
import WindowControls from '@/components/window/WindowControls'
import useWindowStore from '@/store/windowStore'
import useSound from '@/hooks/useSound'
import TOOLS from '@/data/tools'

import homeIconUrl      from '@/assets/icons/nav-home.svg?url'
import aboutIconUrl     from '@/assets/icons/nav-about.svg?url'
import portfolioIconUrl from '@/assets/icons/nav-portfolio.svg?url'
import notesIconUrl     from '@/assets/icons/nav-notes.svg?url'
import shopIconUrl      from '@/assets/icons/nav-shop.svg?url'
import toolsIconUrl     from '@/assets/icons/nav-tools.svg?url'
import MacSearchIcon    from '@/assets/icons/macsearch.svg?react'

const FAVORITES = [
  { id: 'home',      label: 'Home',      icon: homeIconUrl },
  { id: 'about',     label: 'About',     icon: aboutIconUrl },
  { id: 'portfolio', label: 'Portfolio', icon: portfolioIconUrl },
  { id: 'notes',     label: 'Notes',     icon: notesIconUrl },
  { id: 'shop',      label: 'Shop',      icon: shopIconUrl },
]

const glassPill = {
  backgroundColor:      'rgba(40,40,40,0.20)',
  backgroundImage:      'linear-gradient(-45deg, rgba(255,255,255,0.165) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.00) 100%)',
  backdropFilter:       'blur(10px) saturate(1.4) brightness(1.025)',
  WebkitBackdropFilter: 'blur(10px) saturate(1.4) brightness(1.025)',
  borderRadius:          9999,
  border:               '1px solid rgba(255,255,255,0.07)',
  boxShadow:            '0 2px 8px rgba(0,0,0,0.10)',
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-[5px] rounded-md text-left transition-colors group
        ${active ? 'bg-white/5' : 'hover:bg-white/5'}`}
    >
      <img
        src={icon}
        alt={label}
        style={{ width: 13, height: 13, flexShrink: 0, opacity: active ? 1 : 0.55, filter: 'brightness(0) invert(1)' }}
      />
      <span className={`text-[12px] font-medium flex-1 truncate transition-colors
        ${active ? 'text-[#D0CDC4]' : 'text-[#5E5C53]'}`}
        style={{ fontFamily: "'SF Pro Text'" }}
      >
        {label}
      </span>
    </button>
  )
}

function GridItem({ icon, label, disabled, selected, onSingleClick, onDoubleClick }) {
  return (
    <button
      onClick={onSingleClick}
      onDoubleClick={onDoubleClick}
      className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-150"
      style={{ background: 'transparent', border: '1px solid transparent', outline: 'none' }}
    >
      <div style={{
        width: 52, height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 12,
        background: selected ? 'rgba(255,255,255,0.07)' : 'transparent',
        transition: 'background 0.12s',
      }}>
        <img
          src={icon}
          alt={label}
          style={{
            width: 40, height: 40, objectFit: 'contain',
            filter: disabled ? 'grayscale(0.6) opacity(0.4)' : 'none',
          }}
        />
      </div>
      <span
        className="text-[10px] text-center leading-tight px-1.5 py-0.5 rounded"
        style={{
          fontFamily:  "'SF Pro Text'",
          background:  selected ? '#0064d2' : 'transparent',
          color:       selected ? '#fff' : 'var(--body)',
          transition:  'background 0.12s, color 0.12s',
        }}
      >
        {label}
      </span>
    </button>
  )
}

export default function FinderWindow() {
  const { navigate, openTool } = useWindowStore()
  const play = useSound()
  // contentView: 'applications' | page id from FAVORITES
  const [contentView,   setContentView]   = useState('applications')
  const [selectedTool,  setSelectedTool]  = useState(null)
  const [search,        setSearch]        = useState('')

  const visibleTools = useMemo(() => {
    if (!search.trim()) return TOOLS
    const q = search.toLowerCase()
    return TOOLS.filter((t) => t.name.toLowerCase().includes(q))
  }, [search])

  const currentPage = contentView !== 'applications' ? FAVORITES.find((f) => f.id === contentView) : null

  const launchTool = (toolId) => {
    play('open')
    openTool(toolId)
  }

  const launchPage = (pageId) => {
    play('open')
    navigate(pageId)
  }

  const goToApplications = () => {
    setContentView('applications')
    setSelectedTool(null)
    setSearch('')
  }

  // ── Toolbar ──────────────────────────────────────────────────────────────────
  const toolbar = (
    <div className="flex items-center" style={{ pointerEvents: 'auto' }}>
      <div
        className="flex items-center gap-2 px-3"
        style={{ ...glassPill, height: 26, minWidth: 200 }}
      >
        <MacSearchIcon width={11} height={11} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedTool(null); setContentView('applications') }}
          placeholder="Search tools…"
          className="bg-transparent text-[11px] outline-none w-full placeholder:text-white/30"
          style={{ color: '#fff' }}
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  const sidebarContent = ({ onClose, onMinimize, onMaximize }) => (
    <div style={{ width: 200, padding: '6px 4px 6px 6px', height: '100%', boxSizing: 'border-box' }}>
      <div style={{
        background: '#1B1B1B',
        border:      '1px solid #404040',
        borderRadius: 18,
        height:      '100%',
        display:     'flex',
        flexDirection:'column',
        overflow:    'hidden',
      }}>
        {/* Traffic lights */}
        <div style={{ height: 40, display: 'flex', alignItems: 'center', padding: '0 12px', flexShrink: 0 }}>
          <WindowControls onClose={onClose} onMinimize={onMinimize} onMaximize={onMaximize} />
        </div>

        <div className="flex flex-col overflow-y-auto window-scroll px-2 py-2 gap-0.5" style={{ flex: 1 }}>
          {/* Applications — top entry */}
          <SidebarItem
            icon={toolsIconUrl}
            label="Applications"
            active={contentView === 'applications'}
            onClick={goToApplications}
          />

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 8px' }} />

          {/* Favorites */}
          <p className="px-3 pb-1 text-[10px] font-semibold tracking-wide" style={{ color: '#5E5C53' }}>Favorites</p>
          {FAVORITES.map((fav) => (
            <SidebarItem
              key={fav.id}
              icon={fav.icon}
              label={fav.label}
              active={contentView === fav.id}
              onClick={() => { setContentView(fav.id); setSelectedTool(null); setSearch('') }}
            />
          ))}
        </div>
      </div>
    </div>
  )

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Window id="finder" title="Finder" toolbar={toolbar} sidebarContent={sidebarContent}>
      <div className="h-full overflow-y-auto window-scroll p-4">
        <AnimatePresence mode="wait">

          {contentView === 'applications' ? (
            /* ── Applications grid — single click selects, double click opens ── */
            <motion.div
              key="applications"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {visibleTools.length > 0 ? (
                <section>
                  <p className="text-[10px] font-semibold tracking-widest mb-3 px-1" style={{ color: '#5E5C53' }}>
                    APPLICATIONS — {visibleTools.length}
                  </p>
                  <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))' }}>
                    {visibleTools.map((tool) => (
                      <GridItem
                        key={tool.id}
                        icon={tool.icon}
                        label={tool.name}
                        disabled={tool.url === null}
                        selected={selectedTool === tool.id}
                        onSingleClick={() => setSelectedTool(tool.id)}
                        onDoubleClick={() => tool.url && launchTool(tool.id)}
                      />
                    ))}
                  </div>
                </section>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2" style={{ paddingTop: 80 }}>
                  <MacSearchIcon width={28} height={28} style={{ opacity: 0.2 }} />
                  <p className="text-[12px]" style={{ color: 'var(--body)', opacity: 0.5 }}>No tools found</p>
                </div>
              )}
            </motion.div>

          ) : (
            /* ── Page / Favorite detail ── */
            <motion.div
              key={contentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col items-center justify-center gap-5"
              style={{ minHeight: 'calc(100% - 32px)' }}
            >
              <motion.img
                src={currentPage?.icon}
                alt={currentPage?.label}
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                style={{ width: 88, height: 88, objectFit: 'contain' }}
              />
              <div className="text-center">
                <p className="text-[20px] font-semibold" style={{ color: 'var(--headline)', fontFamily: "'SF Pro Display'" }}>
                  {currentPage?.label}
                </p>
                <p className="text-[12px] mt-1.5" style={{ color: 'var(--body)', opacity: 0.7 }}>
                  Navigate to this page
                </p>
              </div>
              <button
                onClick={() => launchPage(contentView)}
                className="px-6 py-2 rounded-lg text-[12px] font-medium"
                style={{ background: 'rgba(207,5,6,0.12)', border: '1px solid rgba(207,5,6,0.28)', color: '#cf0506', fontFamily: "'SF Pro Text'" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(207,5,6,0.22)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(207,5,6,0.12)' }}
              >
                Open
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </Window>
  )
}
