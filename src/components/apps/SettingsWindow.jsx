import { useState } from 'react'
import { Palette, Monitor, Volume2, MousePointer2, Info } from 'lucide-react'
import Window from '@/components/window/Window'
import useThemeStore from '@/store/themeStore'
import useSoundStore from '@/store/soundStore'
import useSettingsStore, { ACCENT_PRESETS } from '@/store/settingsStore'
import useCursorStore, { CURSOR_PACKS } from '@/store/cursorStore'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'

// ── Shared primitives ──────────────────────────────────────────────────────────

function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: 11, cursor: 'pointer', flexShrink: 0,
        background: value ? 'var(--brand)' : 'var(--border)',
        position: 'relative', transition: 'background 0.2s',
      }}
    >
      <div style={{
        position: 'absolute', top: 2,
        left: value ? 20 : 2, width: 18, height: 18,
        borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </div>
  )
}

function Segment({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', background: 'rgba(128,128,128,0.12)', borderRadius: 8, padding: 2 }}>
      {options.map(opt => (
        <button key={String(opt.value)} onClick={() => onChange(opt.value)} style={{
          padding: '3px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
          fontFamily: "'SF Pro Text'",
          background: value === opt.value ? 'var(--window-bg)' : 'transparent',
          color: value === opt.value ? 'var(--headline)' : 'var(--body)',
          boxShadow: value === opt.value ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
          transition: 'all 0.15s', cursor: 'pointer',
        }}>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function Row({ label, description, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '11px 0', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ flex: 1, paddingRight: 16 }}>
        <p style={{ color: 'var(--headline)', fontSize: 13, fontWeight: 500, fontFamily: "'SF Pro Text'" }}>{label}</p>
        {description && <p style={{ color: 'var(--body)', fontSize: 11, marginTop: 2, opacity: 0.55, fontFamily: "'SF Pro Text'" }}>{description}</p>}
      </div>
      {children}
    </div>
  )
}

function GroupLabel({ children }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
      color: 'var(--body)', opacity: 0.45, fontFamily: "'SF Pro Text'",
      marginTop: 20, marginBottom: 2, paddingBottom: 4,
    }}>
      {children}
    </p>
  )
}

// ── Section components ─────────────────────────────────────────────────────────

function AppearanceSection() {
  const { isDark, toggleTheme } = useThemeStore()
  const { background, accentColor, setBackground, setAccentColor } = useSettingsStore()

  return (
    <>
      <GroupLabel>Display</GroupLabel>
      <Row label="Theme" description="Dark or light interface">
        <Segment
          options={[{ value: true, label: 'Dark' }, { value: false, label: 'Light' }]}
          value={isDark}
          onChange={(val) => { if (val !== isDark) toggleTheme() }}
        />
      </Row>
      <Row label="Background" description="Animated canvas or static wallpaper">
        <Segment
          options={[{ value: 'animated', label: 'Animated' }, { value: 'static', label: 'Static' }]}
          value={background}
          onChange={setBackground}
        />
      </Row>

      <GroupLabel>Accent Color</GroupLabel>
      <div style={{ display: 'flex', gap: 10, paddingTop: 8, paddingBottom: 4 }}>
        {ACCENT_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => setAccentColor(preset.color)}
            title={preset.label}
            style={{
              width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
              background: preset.color,
              border: accentColor === preset.color ? '3px solid var(--window-bg)' : '3px solid transparent',
              outline: accentColor === preset.color ? `2px solid ${preset.color}` : 'none',
              transform: accentColor === preset.color ? 'scale(1.18)' : 'scale(1)',
              transition: 'transform 0.15s, outline 0.15s',
            }}
          />
        ))}
      </div>
    </>
  )
}

function DesktopSection() {
  const { reduceMotion, showDesktopIcons, setReduceMotion, setShowDesktopIcons } = useSettingsStore()

  return (
    <>
      <GroupLabel>Accessibility</GroupLabel>
      <Row label="Reduce Motion" description="Minimizes animations and transitions across the UI">
        <Toggle value={reduceMotion} onChange={setReduceMotion} />
      </Row>

      <GroupLabel>Desktop</GroupLabel>
      <Row label="Desktop Icons" description="Show document icons on the desktop surface">
        <Toggle value={showDesktopIcons} onChange={setShowDesktopIcons} />
      </Row>
    </>
  )
}

function SoundSection() {
  const { isEnabled, toggleSound } = useSoundStore()

  return (
    <>
      <GroupLabel>Audio</GroupLabel>
      <Row label="Sound Effects" description="UI interaction sounds throughout the portfolio">
        <Toggle value={isEnabled} onChange={() => toggleSound()} />
      </Row>
    </>
  )
}

function CursorSection() {
  const { cursor, setCursor } = useCursorStore()

  const previews = {
    system: (
      <svg width="18" height="20" viewBox="0 0 10 13" fill="var(--headline)">
        <path d="M0 0 L0 11 L3 8.2 L4.8 12.5 L6.5 11.8 L4.8 7.5 L8.5 7.5 Z" />
      </svg>
    ),
    dot: <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--brand)' }} />,
    hand: (
      <svg width="16" height="20" viewBox="0 0 18 22" fill="var(--headline)">
        <path d="M6 0C4.9 0 4 .9 4 2v7.1C3.1 9.4 2.5 10.2 2.5 11v5C2.5 19.6 5.1 22 8.5 22S14.5 19.6 14.5 16v-5c0-.8-.6-1.6-1.5-1.9V5c0-1.1-.9-2-2-2s-2 .9-2 2v-.5C9 3.4 8.1 2.5 7 2.5S5 3.4 5 4.5V2C5 .9 5.5 0 6 0z"/>
      </svg>
    ),
  }

  return (
    <>
      <GroupLabel>Cursor Style</GroupLabel>
      <p style={{ fontSize: 12, color: 'var(--body)', opacity: 0.55, marginBottom: 14, fontFamily: "'SF Pro Text'" }}>
        More cursor packs coming soon
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {CURSOR_PACKS.map(pack => {
          const active = cursor === pack.id
          return (
            <button
              key={pack.id}
              onClick={() => setCursor(pack.id)}
              style={{
                padding: '16px 10px', borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
                background: active ? 'rgba(128,128,128,0.06)' : 'transparent',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {previews[pack.id]}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "'SF Pro Text'", color: active ? 'var(--brand)' : 'var(--headline)' }}>
                {pack.label}
              </span>
              <span style={{ fontSize: 10, color: 'var(--body)', opacity: 0.55, fontFamily: "'SF Pro Text'", textAlign: 'center', lineHeight: 1.3 }}>
                {pack.description}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}

function AboutSection() {
  const socials = [
    { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/ferdousmikdad/' },
    { label: 'Instagram', href: 'https://www.instagram.com/ferdousmikdad/' },
    { label: 'Email',     href: 'mailto:ferdousmikdad@gmail.com' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14, paddingBottom: 24 }}>
      <img src={mikdadHeadUrl} alt="Mikdad" style={{ width: 72, height: 72, objectFit: 'contain' }} />
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--headline)', fontFamily: "'SF Pro Display'" }}>Ferdous Mikdad</p>
        <p style={{ fontSize: 12, color: 'var(--body)', opacity: 0.55, fontFamily: "'SF Pro Text'" }}>Designer & Developer · Portfolio v1.0</p>
        <p style={{ fontSize: 11, color: 'var(--body)', opacity: 0.38, fontFamily: "'SF Pro Text'" }}>Built with React + Vite</p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {socials.map(s => (
          <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="social-badge">{s.label}</a>
        ))}
      </div>
    </div>
  )
}

// ── Main window ────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'appearance', label: 'Appearance', icon: Palette,       Content: AppearanceSection },
  { id: 'desktop',    label: 'Desktop',    icon: Monitor,        Content: DesktopSection    },
  { id: 'sound',      label: 'Sound',      icon: Volume2,        Content: SoundSection      },
  { id: 'cursor',     label: 'Cursor',     icon: MousePointer2,  Content: CursorSection     },
  { id: 'about',      label: 'About',      icon: Info,           Content: AboutSection      },
]

export default function SettingsWindow() {
  const [active, setActive] = useState('appearance')
  const { Content } = SECTIONS.find(s => s.id === active) ?? SECTIONS[0]

  return (
    <Window id="settings" title="Settings">
      <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

        {/* ── Left sidebar ── */}
        <div style={{
          width: 185, flexShrink: 0,
          borderRight: '1px solid var(--border)',
          background: 'var(--titlebar-bg)',
          padding: '8px 8px',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  width: '100%', padding: '7px 10px', borderRadius: 8,
                  background: isActive ? 'rgba(128,128,128,0.12)' : 'transparent',
                  color: isActive ? 'var(--headline)' : '#5E5C53',
                  fontSize: 13, fontWeight: 500, fontFamily: "'SF Pro Text'",
                  transition: 'background 0.12s, color 0.12s', cursor: 'pointer',
                }}
              >
                <Icon size={15} style={{ flexShrink: 0, color: isActive ? 'var(--brand)' : 'currentColor' }} />
                {label}
              </button>
            )
          })}
        </div>

        {/* ── Right content ── */}
        <div
          className="window-scroll"
          style={{ flex: 1, padding: '4px 24px 24px', overflowY: 'auto', boxSizing: 'border-box' }}
        >
          <Content />
        </div>

      </div>
    </Window>
  )
}
