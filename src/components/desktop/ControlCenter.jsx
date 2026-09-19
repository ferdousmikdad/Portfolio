/* ── Control Centre ─────────────────────────────────────────────────────────
   The menu-bar panel, laid out off the real macOS 26 one: a 320pt glass sheet
   on a two-column grid. Wi-Fi, Bluetooth and AirDrop stack down the wide left
   column as capsules — every tile in Tahoe is fully rounded, radius = half
   height — with Now Playing spanning two rows on the right and the Stage
   Manager / Screen Mirroring squares tucked under it.

   Below that: the round toggles (an active one inverts to a white fill with a
   black glyph, which is the only state signal Tahoe gives them), then the
   Display and Sound slider cards, whose fill is white rather than accent.   */

import { motion } from 'framer-motion'
import { Moon, AirplayIcon } from 'lucide-react'
import useSettingsStore, { AIRDROP_MODES } from '@/store/settingsStore'
import useThemeStore from '@/store/themeStore'
import useSoundStore from '@/store/soundStore'
import useWindowStore from '@/store/windowStore'

// ── Glyphs ────────────────────────────────────────────────────────────────────

function WifiGlyph({ off }) {
  return (
    <svg width="17" height="13" viewBox="0 0 20 15" fill="currentColor">
      <path d="M10 12.2a1.85 1.85 0 1 0 0 3.7 1.85 1.85 0 0 0 0-3.7Z" />
      <path d="M10 7.5c1.6 0 3.06.62 4.14 1.63a.9.9 0 0 1-1.23 1.3A4.24 4.24 0 0 0 10 9.3c-1.1 0-2.1.42-2.9 1.13a.9.9 0 1 1-1.2-1.34A6.03 6.03 0 0 1 10 7.5Z" />
      <path d="M10 3.4a10 10 0 0 1 6.96 2.8.9.9 0 1 1-1.25 1.3A8.2 8.2 0 0 0 10 5.2a8.2 8.2 0 0 0-5.71 2.3.9.9 0 0 1-1.25-1.3A10 10 0 0 1 10 3.4Z" />
      {off && <path d="M2 1.4 18.6 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />}
    </svg>
  )
}

function BluetoothGlyph() {
  return (
    <svg width="12" height="18" viewBox="0 0 12 18" fill="none" stroke="currentColor"
         strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round">
      <path d="M2 4.6 10 13.4 6 17V1l4 3.6L2 13.4" />
    </svg>
  )
}

function AirDropGlyph() {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" stroke="currentColor"
         strokeWidth="1.55" strokeLinecap="round">
      <circle cx="10" cy="10" r="8.4" strokeWidth="1.3" strokeOpacity="0.9" />
      <circle cx="10" cy="12.4" r="1.45" fill="currentColor" stroke="none" />
      <path d="M7.4 10.5a3.4 3.4 0 0 1 5.2 0" />
      <path d="M5.6 7.9a6.1 6.1 0 0 1 8.8 0" />
    </svg>
  )
}

function AppearanceGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10 1a9 9 0 0 1 0 18Z" fill="currentColor" />
    </svg>
  )
}

function SoundBarsGlyph() {
  const heights = [6, 12, 18, 12, 7]
  return (
    <svg width="20" height="20" viewBox="0 0 22 22">
      {heights.map((h, i) => (
        <rect key={i} x={2 + i * 4.2} y={(22 - h) / 2} width="2.2" height={h} rx="1.1" fill="currentColor" />
      ))}
    </svg>
  )
}

function StageManagerGlyph() {
  return (
    <svg width="22" height="18" viewBox="0 0 24 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="8.5" y="3" width="14" height="14" rx="3" />
      <circle cx="3" cy="5.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="3" cy="10"  r="1.5" fill="currentColor" stroke="none" />
      <circle cx="3" cy="14.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function MirrorGlyph() {
  return (
    <svg width="22" height="19" viewBox="0 0 24 21" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="1.5" y="1.5" width="15" height="13" rx="3" />
      <path d="M7.5 18.5h12a3 3 0 0 0 3-3V6" />
    </svg>
  )
}

function BrightnessGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4
        return <line key={i}
          x1={12 + Math.cos(a) * 7} y1={12 + Math.sin(a) * 7}
          x2={12 + Math.cos(a) * 9.5} y2={12 + Math.sin(a) * 9.5} />
      })}
    </svg>
  )
}

function VolumeGlyph({ level }) {
  return (
    <svg width="17" height="14" viewBox="0 0 20 16" fill="currentColor">
      <path d="M8.4 1.2 4.6 4.6H1.8A.8.8 0 0 0 1 5.4v5.2a.8.8 0 0 0 .8.8h2.8l3.8 3.4a.7.7 0 0 0 1.2-.5V1.7a.7.7 0 0 0-1.2-.5Z" />
      {level > 0 && <path d="M12.6 4.8a.75.75 0 0 1 1.05.13 5 5 0 0 1 0 6.14.75.75 0 1 1-1.18-.92 3.5 3.5 0 0 0 0-4.3.75.75 0 0 1 .13-1.05Z" />}
      {level > 55 && <path d="M15.3 2.2a.75.75 0 0 1 1.05.1 8.5 8.5 0 0 1 0 11.4.75.75 0 1 1-1.14-.98 7 7 0 0 0 0-9.44.75.75 0 0 1 .09-1.08Z" />}
    </svg>
  )
}

// ── Tiles ─────────────────────────────────────────────────────────────────────

function Capsule({ icon, title, sub, on, onClick, className = '' }) {
  return (
    <button className={`cc-tile cc-capsule ${className}`} onClick={onClick} type="button">
      <span className="cc-badge" data-on={!!on}>{icon}</span>
      <span className="cc-capsule__text">
        <span className="cc-capsule__title">{title}</span>
        {sub && <span className="cc-capsule__sub">{sub}</span>}
      </span>
    </button>
  )
}

function SquareToggle({ children, label, on, onClick }) {
  return (
    <button className="cc-tile cc-square" data-on={!!on} onClick={onClick} type="button" aria-label={label}>
      {children}
    </button>
  )
}

function RoundToggle({ children, label, on, onClick }) {
  return (
    <button className="cc-tile cc-round" data-on={!!on} onClick={onClick} type="button" aria-label={label}>
      {children}
    </button>
  )
}

/* The slider cards. macOS draws these as a white fill inside a tall rounded
   trough with the glyphs sitting *on* the fill, not beside it. */
function SliderCard({ label, value, onChange, glyph, trailing }) {
  const onPointerDown = (e) => {
    const track = e.currentTarget
    const apply = (clientX) => {
      const { left, width } = track.getBoundingClientRect()
      onChange(Math.round(Math.min(1, Math.max(0, (clientX - left) / width)) * 100))
    }
    apply(e.clientX)
    const move = (ev) => apply(ev.clientX)
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div className="cc-tile cc-slidercard">
      <span className="cc-slidercard__label">{label}</span>
      <div className="cc-slidercard__body">
        <div className="cc-trough" onPointerDown={onPointerDown}>
          <div className="cc-trough__fill" style={{ width: `${Math.max(9, value)}%` }} />
          <span className="cc-trough__glyph">{glyph}</span>
        </div>
        {trailing}
      </div>
    </div>
  )
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export default function ControlCenter({ onClose }) {
  const s = useSettingsStore()
  const { isDark, toggleTheme } = useThemeStore()
  const { isEnabled, toggleSound } = useSoundStore()
  const openWindow = useWindowStore(st => st.openWindow)

  const airdropLabel = AIRDROP_MODES.find(m => m.id === s.airdrop)?.label ?? 'Off'
  const cycleAirdrop = () => {
    const i = AIRDROP_MODES.findIndex(m => m.id === s.airdrop)
    s.setAirdrop(AIRDROP_MODES[(i + 1) % AIRDROP_MODES.length].id)
  }

  return (
    <motion.div
      className="cc-panel"
      initial={{ y: -8, scale: 0.96 }}
      animate={{ y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
    >
      <div className="cc-grid">
        <Capsule
          className="cc-a-wifi"
          icon={<WifiGlyph off={!s.wifi} />}
          title="Wi-Fi"
          sub={s.wifi ? s.wifiNetwork : 'Off'}
          on={s.wifi}
          onClick={s.toggleWifi}
        />

        <button className="cc-tile cc-nowplaying cc-a-np" onClick={() => openWindow('spotify')} type="button">
          <span className="cc-np__art" />
          <span className="cc-np__title">Portfolio Radio</span>
          <span className="cc-np__artist">Ferdous Mikdad</span>
          <span className="cc-np__transport">
            <svg width="15" height="11" viewBox="0 0 16 12" fill="currentColor"><path d="M7.5 6 15 .8v10.4zM0 6 7.5.8v10.4z" /></svg>
            <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor"><path d="M1 .7 11.5 7 1 13.3z" /></svg>
            <svg width="15" height="11" viewBox="0 0 16 12" fill="currentColor"><path d="M8.5 6 1 .8v10.4zM16 6 8.5.8v10.4z" /></svg>
          </span>
        </button>

        <Capsule
          className="cc-a-bt"
          icon={<BluetoothGlyph />}
          title="Bluetooth"
          sub={s.bluetooth ? 'On' : 'Off'}
          on={s.bluetooth}
          onClick={s.toggleBluetooth}
        />

        <Capsule
          className="cc-a-ad"
          icon={<AirDropGlyph />}
          title="AirDrop"
          sub={airdropLabel}
          on={s.airdrop !== 'off'}
          onClick={cycleAirdrop}
        />

        <div className="cc-a-sq">
          <SquareToggle label="Stage Manager" on={s.stageManager}
                        onClick={() => s.update({ stageManager: !s.stageManager })}>
            <StageManagerGlyph />
          </SquareToggle>
          <SquareToggle label="Screen Mirroring" on={false} onClick={() => {}}>
            <MirrorGlyph />
          </SquareToggle>
        </div>

        <div className="cc-a-toggles">
          <RoundToggle label="Dark Mode" on={isDark} onClick={toggleTheme}>
            <AppearanceGlyph />
          </RoundToggle>
          <RoundToggle label="Sound effects" on={isEnabled} onClick={() => toggleSound()}>
            <SoundBarsGlyph />
          </RoundToggle>
          <button className="cc-tile cc-focus" data-on={s.focus} onClick={s.toggleFocus} type="button">
            <span className="cc-badge cc-badge--plain" data-on={s.focus}><Moon size={15} fill="currentColor" /></span>
            <span className="cc-capsule__title">Focus</span>
          </button>
        </div>

        <div className="cc-a-display">
          <SliderCard label="Display" value={s.brightness} onChange={s.setBrightness}
                      glyph={<BrightnessGlyph />} />
        </div>

        <div className="cc-a-sound">
          <SliderCard
            label="Sound"
            value={s.volume}
            onChange={s.setVolume}
            glyph={<VolumeGlyph level={s.volume} />}
            trailing={
              <button className="cc-airplay" type="button" aria-label="AirPlay output">
                <AirplayIcon size={15} />
              </button>
            }
          />
        </div>
      </div>

      <button className="cc-edit" type="button" onClick={() => { openWindow('settings'); onClose?.() }}>
        System Settings…
      </button>
    </motion.div>
  )
}
