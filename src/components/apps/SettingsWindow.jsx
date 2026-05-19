import { useState, useCallback } from 'react'
import { Palette, Monitor, Volume2, MousePointer2, ChevronRight, ChevronLeft } from 'lucide-react'
import Window from '@/components/window/Window'
import WindowControls from '@/components/window/WindowControls'
import useThemeStore from '@/store/themeStore'
import useSoundStore from '@/store/soundStore'
import useSettingsStore, { ACCENT_PRESETS } from '@/store/settingsStore'
import useCursorStore, { CURSOR_PACKS } from '@/store/cursorStore'
import useWindowStore from '@/store/windowStore'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'

// ── Primitives ────────────────────────────────────────────────────────────────

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

// ── macOS-style card group + row ──────────────────────────────────────────────

function CardGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <p style={{
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em',
          color: 'var(--body)', opacity: 0.45, fontFamily: "'SF Pro Text'",
          marginBottom: 6, paddingLeft: 2,
        }}>{label}</p>
      )}
      <div style={{
        borderRadius: 12, overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'rgba(128,128,128,0.06)',
      }}>
        {children}
      </div>
    </div>
  )
}

function CardRow({ label, description, value, children, onClick, isLast }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', minHeight: 44,
        borderBottom: isLast ? 'none' : '1px solid rgba(128,128,128,0.1)',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseEnter={onClick ? e => (e.currentTarget.style.background = 'rgba(128,128,128,0.06)') : undefined}
      onMouseLeave={onClick ? e => (e.currentTarget.style.background = 'transparent') : undefined}
    >
      <div style={{ flex: 1, paddingRight: 12 }}>
        <p style={{ color: 'var(--headline)', fontSize: 13, fontWeight: 500, fontFamily: "'SF Pro Text'" }}>{label}</p>
        {description && (
          <p style={{ color: 'var(--body)', fontSize: 11, marginTop: 2, opacity: 0.5, fontFamily: "'SF Pro Text'" }}>{description}</p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {value && <span style={{ fontSize: 13, color: 'var(--body)', opacity: 0.4, fontFamily: "'SF Pro Text'" }}>{value}</span>}
        {children}
        {onClick && <ChevronRight size={14} style={{ color: 'var(--body)', opacity: 0.3 }} />}
      </div>
    </div>
  )
}

// ── Section content ───────────────────────────────────────────────────────────

function AppearanceSection() {
  const { isDark, toggleTheme } = useThemeStore()
  const { background, accentColor, setBackground, setAccentColor } = useSettingsStore()

  return (
    <>
      <CardGroup label="Display">
        <CardRow label="Theme" description="Dark or light interface">
          <Segment
            options={[{ value: true, label: 'Dark' }, { value: false, label: 'Light' }]}
            value={isDark}
            onChange={(val) => { if (val !== isDark) toggleTheme() }}
          />
        </CardRow>
        <CardRow label="Background" description="Animated canvas or static wallpaper" isLast>
          <Segment
            options={[{ value: 'animated', label: 'Animated' }, { value: 'static', label: 'Static' }]}
            value={background}
            onChange={setBackground}
          />
        </CardRow>
      </CardGroup>

      <CardGroup label="Accent Color">
        <CardRow label="Choose a color" isLast>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {ACCENT_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => setAccentColor(preset.color)}
                title={preset.label}
                style={{
                  width: 22, height: 22, borderRadius: '50%', cursor: 'pointer',
                  background: preset.color, flexShrink: 0,
                  border: accentColor === preset.color ? '2.5px solid var(--window-bg)' : '2.5px solid transparent',
                  outline: accentColor === preset.color ? `2px solid ${preset.color}` : 'none',
                  transform: accentColor === preset.color ? 'scale(1.2)' : 'scale(1)',
                  transition: 'transform 0.15s, outline 0.15s',
                }}
              />
            ))}
          </div>
        </CardRow>
      </CardGroup>
    </>
  )
}

function DesktopSection() {
  const { reduceMotion, showDesktopIcons, setReduceMotion, setShowDesktopIcons } = useSettingsStore()

  return (
    <>
      <CardGroup label="Accessibility">
        <CardRow label="Reduce Motion" description="Minimizes animations and transitions across the UI" isLast>
          <Toggle value={reduceMotion} onChange={setReduceMotion} />
        </CardRow>
      </CardGroup>
      <CardGroup label="Desktop">
        <CardRow label="Desktop Icons" description="Show document icons on the desktop surface" isLast>
          <Toggle value={showDesktopIcons} onChange={setShowDesktopIcons} />
        </CardRow>
      </CardGroup>
    </>
  )
}

function SoundSection() {
  const { isEnabled, toggleSound } = useSoundStore()

  return (
    <CardGroup label="Audio">
      <CardRow label="Sound Effects" description="UI interaction sounds throughout the portfolio" isLast>
        <Toggle value={isEnabled} onChange={() => toggleSound()} />
      </CardRow>
    </CardGroup>
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
        <path d="M6 0C4.9 0 4 .9 4 2v7.1C3.1 9.4 2.5 10.2 2.5 11v5C2.5 19.6 5.1 22 8.5 22S14.5 19.6 14.5 16v-5c0-.8-.6-1.6-1.5-1.9V5c0-1.1-.9-2-2-2s-2 .9-2 2v-.5C9 3.4 8.1 2.5 7 2.5S5 3.4 5 4.5V2C5 .9 5.5 0 6 0z" />
      </svg>
    ),
  }

  return (
    <>
      <p style={{ fontSize: 12, color: 'var(--body)', opacity: 0.5, marginBottom: 14, fontFamily: "'SF Pro Text'" }}>
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
              <span style={{ fontSize: 10, color: 'var(--body)', opacity: 0.5, fontFamily: "'SF Pro Text'", textAlign: 'center', lineHeight: 1.3 }}>
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
  const openMailWindow = useWindowStore(s => s.openMailWindow)

  const socials = [
    { label: 'LinkedIn',  onClick: () => window.open('https://www.linkedin.com/in/ferdousmikdad/', '_blank') },
    { label: 'Instagram', onClick: () => window.open('https://www.instagram.com/ferdousmikdad/', '_blank') },
    { label: 'Email',     onClick: () => openMailWindow() },
  ]

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, paddingBottom: 24, paddingTop: 6 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(128,128,128,0.1)',
          border: '2px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <img src={mikdadHeadUrl} alt="Mikdad" style={{ width: '76%', height: '76%', objectFit: 'contain' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--headline)', fontFamily: "'SF Pro Display'", marginBottom: 3 }}>Ferdous Mikdad</p>
          <p style={{ fontSize: 12, color: 'var(--body)', opacity: 0.5, fontFamily: "'SF Pro Text'" }}>mikdadtaqi2024@gmail.com</p>
        </div>
      </div>

      <CardGroup>
        {socials.map((s, i) => (
          <CardRow
            key={s.label}
            label={s.label}
            onClick={s.onClick}
            isLast={i === socials.length - 1}
          />
        ))}
      </CardGroup>

      <CardGroup label="About">
        <CardRow label="Version" value="Portfolio v1.0" isLast={false} />
        <CardRow label="Built with" value="React + Vite" isLast />
      </CardGroup>
    </>
  )
}

// ── Sections config ───────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'appearance', label: 'Appearance', icon: Palette,       iconBg: '#7c3aed', iconBgLight: '#9d5cf5', Content: AppearanceSection },
  { id: 'desktop',    label: 'Desktop',    icon: Monitor,       iconBg: '#0ea5e9', iconBgLight: '#38bdf8', Content: DesktopSection    },
  { id: 'sound',      label: 'Sound',      icon: Volume2,       iconBg: '#f97316', iconBgLight: '#fb923c', Content: SoundSection      },
  { id: 'cursor',     label: 'Cursor',     icon: MousePointer2, iconBg: '#0d9488', iconBgLight: '#14b8a6', Content: CursorSection     },
]

// ── Main window ───────────────────────────────────────────────────────────────

export default function SettingsWindow() {
  const [history, setHistory] = useState(['appearance'])
  const [histIndex, setHistIndex] = useState(0)

  const active = history[histIndex]
  const canGoBack    = histIndex > 0
  const canGoForward = histIndex < history.length - 1

  const navigate = useCallback((id) => {
    setHistory(prev => [...prev.slice(0, histIndex + 1), id])
    setHistIndex(i => i + 1)
  }, [histIndex])

  const goBack    = () => { if (canGoBack)    setHistIndex(i => i - 1) }
  const goForward = () => { if (canGoForward) setHistIndex(i => i + 1) }

  const activeSection = SECTIONS.find(s => s.id === active)
  const Content = activeSection ? activeSection.Content : AboutSection
  const windowTitle = activeSection ? activeSection.label : 'About'

  // Back / forward nav buttons — rendered in the right-panel titlebar via navSlot
  const navSlot = (
    <div style={{ display: 'flex', gap: 3, marginLeft: 8 }}>
      {[
        { onClick: goBack,    disabled: !canGoBack,    Icon: ChevronLeft  },
        { onClick: goForward, disabled: !canGoForward, Icon: ChevronRight },
      ].map(({ onClick, disabled, Icon }, i) => (
        <button
          key={i}
          onClick={onClick}
          disabled={disabled}
          style={{
            width: 24, height: 20, borderRadius: 5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(128,128,128,0.13)',
            border: '1px solid rgba(128,128,128,0.18)',
            cursor: disabled ? 'default' : 'pointer',
            opacity: disabled ? 0.3 : 1,
            transition: 'opacity 0.15s',
            color: 'var(--body)',
          }}
        >
          <Icon size={12} />
        </button>
      ))}
    </div>
  )

  // Left sidebar — exact Notes style: padded outer, inner rounded card
  const sidebarContent = ({ onClose, onMinimize, onMaximize }) => (
    <div style={{ width: 210, padding: '6px 4px 6px 6px', height: '100%', boxSizing: 'border-box' }}>
      <div style={{
        background: '#1B1B1B',
        border: '1px solid #404040',
        borderRadius: 18,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Traffic lights */}
        <div style={{ height: 40, display: 'flex', alignItems: 'center', padding: '0 12px', flexShrink: 0 }}>
          <WindowControls onClose={onClose} onMinimize={onMinimize} onMaximize={onMaximize} />
        </div>

        {/* Profile card */}
        <button
          onClick={() => navigate('about')}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            margin: '0 8px 6px', padding: '8px 10px', borderRadius: 10,
            background: active === 'about' ? 'rgba(255,255,255,0.07)' : 'transparent',
            cursor: 'pointer', textAlign: 'left',
            transition: 'background 0.12s',
          }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(255,255,255,0.06)',
            border: '1.5px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <img src={mikdadHeadUrl} alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
          </div>
          <div>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: '#D0CDC4', fontFamily: "'SF Pro Text'", lineHeight: 1.3 }}>Ferdous Mikdad</p>
            <p style={{ fontSize: 10, color: '#5E5C53', fontFamily: "'SF Pro Text'", marginTop: 1 }}>Portfolio Account</p>
          </div>
        </button>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 12px 6px' }} />

        {/* Nav items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <p style={{ padding: '0 4px 4px 4px', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: '#5E5C53', fontFamily: "'SF Pro Text'" }}>
            Settings
          </p>
          {SECTIONS.map(({ id, label, icon: Icon, iconBg, iconBgLight }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => navigate(id)}
                className={`w-full flex items-center px-3 py-[5px] rounded-md text-left text-[12px] font-medium transition-colors
                  ${isActive ? 'bg-white/5 text-[#D0CDC4]' : 'text-[#5E5C53] hover:bg-white/5'}`}
                style={{ fontFamily: "'SF Pro Text'", gap: 8 }}
              >
                {/* Small glass icon square */}
                <div style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                  background: `linear-gradient(145deg, ${iconBgLight} 0%, ${iconBg} 100%)`,
                  boxShadow: '0 1px 0 rgba(255,255,255,0.2) inset, 0 1px 4px rgba(0,0,0,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={12} color="white" />
                </div>
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <Window id="settings" title={windowTitle} navSlot={navSlot} sidebarContent={sidebarContent}>
      <div className="window-scroll" style={{ height: '100%', overflowY: 'auto', padding: '16px 24px 24px', boxSizing: 'border-box' }}>
        <Content />
      </div>
    </Window>
  )
}
