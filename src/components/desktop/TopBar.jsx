import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Check, Wifi } from 'lucide-react'
import useWindowStore from '@/store/windowStore'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'
import macSettingUrl  from '@/assets/icons/macsetting.svg?url'
import macFitUrl      from '@/assets/icons/macfit.svg?url'
import projects from '@/data/projects'

// ── Nav items (left side) ─────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'about',     label: 'About Me'  },
  { id: 'notes',     label: 'Notes'     },
]

// ── Live clock ────────────────────────────────────────────────────────────────
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function Clock() {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const day   = DAYS[time.getDay()]
  const month = MONTHS[time.getMonth()]
  const date  = time.getDate()
  const h     = time.getHours()
  const m     = String(time.getMinutes()).padStart(2, '0')
  const ampm  = h >= 12 ? 'PM' : 'AM'
  const h12   = h % 12 || 12
  return (
    <span className="topbar-label select-none tabular-nums" style={{ whiteSpace: 'nowrap' }}>
      {day} {month} {date} {h12}:{m}{ampm}
    </span>
  )
}

// ── Tiny panel wrapper ────────────────────────────────────────────────────────
function Panel({ children, align = 'left', style = {}, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1     }}
      exit={{    opacity: 0, y: -4, scale: 0.97  }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`topbar-panel${className ? ` ${className}` : ''}`}
      style={{
        position: 'absolute',
        top: '100%',
        marginTop: 4,
        minWidth: 220,
        ...(align === 'right' ? { right: 0 } : { left: 0 }),
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}

// ── Search panel ──────────────────────────────────────────────────────────────
function SearchPanel({ onClose, onNavigate }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const results = query.trim()
    ? projects.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : []

  return (
    <Panel align="right" style={{ minWidth: 280, right: -80 }}>
      <div className="topbar-panel-row" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 4 }}>
        <Search size={12} style={{ color: 'var(--body)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          placeholder="Search portfolio…"
          className="topbar-search-input"
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ color: 'var(--body)', lineHeight: 1 }}>
            <X size={11} />
          </button>
        )}
      </div>
      {results.length > 0 ? (
        results.map((p) => (
          <button
            key={p.id}
            className="topbar-panel-item"
            onClick={() => { onNavigate('portfolio'); onClose() }}
          >
            <div
              className="flex-shrink-0 rounded overflow-hidden"
              style={{ width: 28, height: 28, background: 'var(--wall-bg)' }}
            >
              <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="flex-1 truncate text-[12px]" style={{ color: 'var(--headline)' }}>{p.title}</span>
            <span className="text-[10px]" style={{ color: 'var(--body)' }}>{p.category}</span>
          </button>
        ))
      ) : query ? (
        <p className="topbar-empty">No results for "{query}"</p>
      ) : (
        <p className="topbar-empty">Type to search projects…</p>
      )}
    </Panel>
  )
}

// ── Status panel ──────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { id: 'available', label: 'Available for work', color: '#cf0506' },
  { id: 'busy',      label: 'Currently busy',     color: '#f59e0b' },
  { id: 'away',      label: 'Away',               color: '#6b7280' },
]

function StatusPanel({ status, onChange, onClose }) {
  return (
    <Panel align="right" style={{ minWidth: 200 }}>
      <p className="topbar-section-label">Availability</p>
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          className="topbar-panel-item"
          onClick={() => { onChange(opt.id); onClose() }}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: opt.color }} />
          <span className="flex-1 text-[12px]" style={{ color: 'var(--headline)' }}>{opt.label}</span>
          {status === opt.id && <Check size={11} style={{ color: '#cf0506', flexShrink: 0 }} />}
        </button>
      ))}
    </Panel>
  )
}

// ── Main TopBar ───────────────────────────────────────────────────────────────
export default function TopBar() {
  const { navigate, activePage, openWindow } = useWindowStore()

  const [openPanel,    setOpenPanel]    = useState(null) // 'search' | 'status'
  const [status,       setStatus]       = useState('available')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const barRef = useRef(null)

  const currentStatus = STATUS_OPTIONS.find((s) => s.id === status) ?? STATUS_OPTIONS[0]

  // ── Fullscreen toggle ─────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  // Track actual fullscreen state (Esc key is handled natively by the browser)
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // Close panels on outside click
  useEffect(() => {
    if (!openPanel) return
    const handler = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setOpenPanel(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openPanel])

  // Close panels on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpenPanel(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const toggle = (panel) => setOpenPanel((v) => (v === panel ? null : panel))

  return (
    <div
      ref={barRef}
      className="topbar"
      style={{ zIndex: 50 }}
    >
      {/* ── Left: logo + nav ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5">
        {/* Logo / home */}
        <button
          className="topbar-logo"
          onClick={() => { navigate('home'); setOpenPanel(null) }}
          title="Home"
        >
          <img src={mikdadHeadUrl} alt="Mikdad" width={16} height={16} className="object-contain" />
        </button>

        <div className="topbar-sep" />

        {/* Nav items */}
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`topbar-nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => { navigate(item.id); setOpenPanel(null) }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* ── Right: utilities ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5">

        {/* WiFi */}
        <button className="topbar-icon-btn" title="WiFi">
          <Wifi size={12} />
        </button>

        {/* Search */}
        <div className="relative">
          <button
            className={`topbar-icon-btn ${openPanel === 'search' ? 'active' : ''}`}
            onClick={() => toggle('search')}
            title="Search"
          >
            <Search size={12} />
          </button>
          <AnimatePresence>
            {openPanel === 'search' && (
              <SearchPanel
                onClose={() => setOpenPanel(null)}
                onNavigate={navigate}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Settings — opens Settings window */}
        <button
          className="topbar-icon-btn"
          onClick={() => openWindow('settings')}
          title="Settings"
        >
          <img src={macSettingUrl} alt="settings" width={13} height={13} style={{ opacity: 0.85 }} />
        </button>

        {/* Status dot */}
        <div className="relative">
          <button
            className={`topbar-status-btn ${openPanel === 'status' ? 'active' : ''}`}
            onClick={() => toggle('status')}
            title="Availability status"
          >
            <span
              className="topbar-status-dot"
              style={{ background: currentStatus.color }}
            />
          </button>
          <AnimatePresence>
            {openPanel === 'status' && (
              <StatusPanel
                status={status}
                onChange={setStatus}
                onClose={() => setOpenPanel(null)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Fit / Fullscreen */}
        <button
          className={`topbar-icon-btn ${isFullscreen ? 'active' : ''}`}
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fit to screen'}
        >
          <img src={macFitUrl} alt="fit" width={13} height={13} style={{ opacity: isFullscreen ? 1 : 0.85 }} />
        </button>

        <div className="topbar-sep" />

        {/* Clock */}
        <Clock />

      </div>
    </div>
  )
}
