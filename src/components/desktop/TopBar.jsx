import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence } from 'framer-motion'
import useSettingsStore from '@/store/settingsStore'
import useWindowStore from '@/store/windowStore'
import ControlCenter from './ControlCenter'
import MenuBar from './MenuBar'
import Spotlight from './Spotlight'
import MikudaAsk from './MikudaAsk'
import Tip from '@/components/ui/Tip'
import { Panel } from '@/components/ui/ContextMenu'
import { CLIPIO_TRAY, clipioMenu } from '@/data/clipio'
import macSettingUrl from '@/assets/icons/macsetting.svg?url'
import macSearchUrl  from '@/assets/icons/macsearch.svg?url'
import macFitUrl     from '@/assets/icons/macfit.svg?url'
import siriIconUrl   from '@/assets/icons/siri.png?url'

// ── Live clock ────────────────────────────────────────────────────────────────
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function Clock() {
  const [time, setTime] = useState(() => new Date())
  const showDate    = useSettingsStore(s => s.menuBarShowDate)
  const showSeconds = useSettingsStore(s => s.menuBarShowSeconds)
  const clock24     = useSettingsStore(s => s.menuBarClock24)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const h    = time.getHours()
  const m    = String(time.getMinutes()).padStart(2, '0')
  const sec  = String(time.getSeconds()).padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hh   = clock24 ? String(h).padStart(2, '0') : String(h % 12 || 12)

  const date = showDate
    ? `${DAYS[time.getDay()]} ${MONTHS[time.getMonth()]} ${time.getDate()} `
    : ''

  return (
    <span className="topbar-label select-none tabular-nums" style={{ whiteSpace: 'nowrap' }}>
      {date}{hh}:{m}{showSeconds ? `:${sec}` : ''}{clock24 ? '' : ` ${ampm}`}
    </span>
  )
}

// ── Menu-bar Wi-Fi and battery ────────────────────────────────────────────────

function WifiStatus({ on }) {
  return (
    <svg width="15" height="11" viewBox="0 0 20 15" fill="currentColor" style={{ opacity: on ? 1 : 0.45 }}>
      <path d="M10 11.4a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z" />
      <path d="M10 6.9c1.58 0 3.02.61 4.09 1.61a.88.88 0 1 1-1.2 1.28A4.17 4.17 0 0 0 10 8.66c-1.08 0-2.07.41-2.85 1.11a.88.88 0 1 1-1.18-1.3A6 6 0 0 1 10 6.9Z" />
      <path d="M10 2.8a9.9 9.9 0 0 1 6.88 2.77.88.88 0 1 1-1.22 1.27A8.13 8.13 0 0 0 10 4.57a8.13 8.13 0 0 0-5.66 2.27.88.88 0 1 1-1.22-1.27A9.9 9.9 0 0 1 10 2.8Z" />
      {!on && <path d="M2.6 1 17.6 13.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
    </svg>
  )
}

function BatteryStatus({ level = 87 }) {
  return (
    <svg width="25" height="12" viewBox="0 0 27 13" fill="none">
      <rect x="0.6" y="0.6" width="22" height="11.8" rx="3.4"
            stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.1" />
      <rect x="2.2" y="2.2" width={Math.max(2, (level / 100) * 18.8)} height="8.6" rx="2.1"
            fill="currentColor" />
      <path d="M24.6 4.4c.9.35 1.5 1.2 1.5 2.1s-.6 1.75-1.5 2.1V4.4Z"
            fill="currentColor" fillOpacity="0.45" />
    </svg>
  )
}

// ── Clipio's menu ─────────────────────────────────────────────────────────────
// Hung from the glyph's bottom-left corner, as a status-item menu is, and
// portalled so its glass samples the desktop rather than the bar. A component
// of its own, not a bare portal: AnimatePresence only tracks elements.

function ClipioMenu({ anchor, onOpen, onClose }) {
  const r = anchor?.getBoundingClientRect()
  if (!r) return null
  return createPortal(
    <Panel
      className="mac-menu--bar"
      items={clipioMenu(onOpen)}
      at={{ x: Math.round(r.left), y: Math.round(r.bottom + 3) }}
      onClose={onClose}
    />,
    document.body,
  )
}

// ── Main TopBar ───────────────────────────────────────────────────────────────

export default function TopBar() {
  const wifi          = useSettingsStore(s => s.wifi)
  const showBattery   = useSettingsStore(s => s.menuBarShowBattery)

  const toggleNotificationCenter = useWindowStore((s) => s.toggleNotificationCenter)
  const openWindow               = useWindowStore((s) => s.openWindow)

  const [openPanel,    setOpenPanel]    = useState(null) // 'clipio' | 'control' | null
  /* Spotlight's open state lives in the store, not here: the What's New
     window raises it from the other side of the app. */
  const spotOpen        = useWindowStore((s) => s.spotlight)
  const setSpotlight    = useWindowStore((s) => s.openSpotlight)
  const closeSpotlight  = useWindowStore((s) => s.closeSpotlight)
  const toggleSpotlight = useWindowStore((s) => s.toggleSpotlight)
  /* Mikuda's ask field, likewise: the menu bar raises it, the field itself
     and the chat window close it. */
  const askOpen        = useWindowStore((s) => s.mikudaAsk)
  const toggleMikudaAsk = useWindowStore((s) => s.toggleMikudaAsk)
  const closeMikudaAsk  = useWindowStore((s) => s.closeMikudaAsk)
  /* The home page already has the full chat on screen, so the extra drops off
     the bar there rather than opening a second one — the same rule the
     floating button used to follow. */
  const activePage     = useWindowStore((s) => s.activePage)
  const showMikuda     = activePage !== 'home'
  const [isFullscreen, setIsFullscreen] = useState(false)

  const barRef  = useRef(null)
  const siriRef = useRef(null)
  const clipioRef = useRef(null)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // Close the Control Centre or Clipio's menu on an outside click. Clipio's
  // menu is portalled out of the bar, so a press inside it is not outside.
  useEffect(() => {
    if (!openPanel) return
    const handler = (e) => {
      if (barRef.current && !barRef.current.contains(e.target) && !e.target.closest?.('.mac-menu')) setOpenPanel(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openPanel])

  // ⌘Space opens Spotlight, Escape closes whatever is up
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setOpenPanel(null); closeSpotlight(); closeMikudaAsk(); return }
      if (e.code === 'Space' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpenPanel(null)
        closeMikudaAsk()
        toggleSpotlight()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <div ref={barRef} className="topbar" style={{ zIndex: 50 }}>
        {/* ── Left: Apple menu + the front app's menus ─────────────────────
             The three nav buttons that used to sit here moved into the Go
             menu: no Mac puts loose page links on the menu bar, and Go is
             where Finder keeps navigation. */}
        <MenuBar
          onOpenSpotlight={() => { setOpenPanel(null); setSpotlight() }}
          onMenuOpen={() => { setOpenPanel(null); closeSpotlight() }}
        />

        {/* ── Right: menu-bar extras ───────────────────────────────────────── */}
        <div className="topbar-extras">

          {/* Clipio — Ferdous's screen recorder, as its menu-bar extra sits on
              his Mac. Third-party extras come before the system ones. */}
          <Tip label="Clipio" hidden={openPanel === 'clipio'}>
            <button
              ref={clipioRef}
              className={`topbar-icon-btn ${openPanel === 'clipio' ? 'active' : ''}`}
              onClick={() => { closeSpotlight(); closeMikudaAsk(); setOpenPanel(p => p === 'clipio' ? null : 'clipio') }}
            >
              <span className="topbar-clipio" style={{ '--tpl': `url("${CLIPIO_TRAY}")` }} />
            </button>
          </Tip>

          {showBattery && (
            <Tip label="Battery — 87%">
              <button className="topbar-icon-btn topbar-icon-btn--wide">
                <BatteryStatus />
              </button>
            </Tip>
          )}

          <Tip label={wifi ? 'Wi-Fi: On' : 'Wi-Fi: Off'}>
            <button className="topbar-icon-btn" onClick={() => setOpenPanel(p => p === 'control' ? null : 'control')}>
              <WifiStatus on={wifi} />
            </button>
          </Tip>

          {/* Spotlight — its own control, set apart from Control Centre */}
          <Tip label="Spotlight Search (⌘Space)" hidden={spotOpen}>
            <button
              className={`topbar-icon-btn ${spotOpen ? 'active' : ''}`}
              onClick={() => { setOpenPanel(null); toggleSpotlight() }}
            >
              <img src={macSearchUrl} alt="" width={13} height={13} />
            </button>
          </Tip>

          {/* Control Centre */}
          <div className="relative">
            <Tip label="Control Centre" hidden={openPanel === 'control'}>
              <button
                className={`topbar-icon-btn ${openPanel === 'control' ? 'active' : ''}`}
                onClick={() => { closeSpotlight(); setOpenPanel(p => p === 'control' ? null : 'control') }}
              >
                <img src={macSettingUrl} alt="" width={13} height={13} />
              </button>
            </Tip>
            <AnimatePresence>
              {openPanel === 'control' && <ControlCenter onClose={() => setOpenPanel(null)} />}
            </AnimatePresence>
          </div>

          {/* Mikuda — sits right of Control Centre, which is where macOS puts
              Siri. The orb keeps its own colour: it is the one menu-bar extra
              Apple does not draw as a monochrome template. */}
          {showMikuda && (
            <Tip label="Mikuda" hidden={askOpen}>
              <button
                ref={siriRef}
                className={`topbar-icon-btn topbar-icon-btn--siri ${askOpen ? 'active' : ''}`}
                onClick={() => { setOpenPanel(null); closeSpotlight(); toggleMikudaAsk() }}
              >
                <img src={siriIconUrl} alt="" width={16} height={16} draggable={false} />
              </button>
            </Tip>
          )}

          <Tip label={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fit to screen'}>
            <button
              className={`topbar-icon-btn ${isFullscreen ? 'active' : ''}`}
              onClick={toggleFullscreen}
            >
              <img src={macFitUrl} alt="fit" width={13} height={13} style={{ opacity: isFullscreen ? 1 : 0.85 }} />
            </button>
          </Tip>

          <div className="topbar-sep" />

          {/* Clicking the clock opens Notification Centre — that is how you
              reach it on a Mac. */}
          <button
            className="topbar-clock-btn"
            onClick={() => { setOpenPanel(null); closeSpotlight(); toggleNotificationCenter() }}
          >
            <Clock />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {openPanel === 'clipio' && (
          <ClipioMenu
            key="clipio"
            anchor={clipioRef.current}
            onOpen={() => openWindow('clipio')}
            onClose={() => setOpenPanel(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {spotOpen && <Spotlight onClose={closeSpotlight} />}
      </AnimatePresence>

      <AnimatePresence>
        {askOpen && showMikuda && <MikudaAsk anchorRef={siriRef} />}
      </AnimatePresence>
    </>
  )
}
