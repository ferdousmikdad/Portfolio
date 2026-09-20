import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Search, ChevronRight, ChevronLeft, X } from 'lucide-react'
import Window from '@/components/window/Window'
import WindowSidebar from '@/components/window/WindowSidebar'
import useThemeStore from '@/store/themeStore'
import useSoundStore from '@/store/soundStore'
import useCursorStore, { CURSOR_PACKS } from '@/store/cursorStore'
import useWindowStore from '@/store/windowStore'
import useSettingsStore, {
  ACCENT_PRESETS, WALLPAPERS, AIRDROP_MODES, RESOLUTIONS,
} from '@/store/settingsStore'
import { PANE_ICONS, SIDEBAR_GROUPS, PANE_TITLES } from '@/data/settingsPanes'
import {
  Group, Row, StackRow, Switch, Popup, Slider, GlassSlider, Checkbox,
  PushButton, ThumbOption, Swatch,
} from '@/components/ui/MacControls'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'

const OWNER = { name: 'Ferdous Mikdad', email: 'mikdadtaqi2024@gmail.com' }

// ── Pane preview tiles ────────────────────────────────────────────────────────
// Appearance's three options are drawn, not photographed: a window over a
// desktop, split down the middle for Auto.

const LIGHTS = ['#ff5f57', '#febc2e', '#28c840']

/* A desktop with a window floating over its lower-right, matching how the
   real Appearance tiles are drawn — including the traffic lights, which are
   what make a 76×48 rectangle read as macOS at all. */
function MiniDesktop({ dark }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: dark
        ? 'linear-gradient(155deg,#2a3c5c 0%,#16233a 55%,#0b1120 100%)'
        : 'linear-gradient(155deg,#dceaf8 0%,#a8ccec 55%,#7fb0dd 100%)',
    }}>
      {/* menu bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '13%',
        background: dark ? 'rgba(0,0,0,0.34)' : 'rgba(255,255,255,0.42)',
      }} />
      {/* window */}
      <div style={{
        position: 'absolute', left: '17%', top: '30%', right: '8%', bottom: '10%',
        background: dark ? '#26262a' : '#fbfbfd',
        borderRadius: 3.5,
        boxShadow: dark ? '0 2px 5px rgba(0,0,0,0.5)' : '0 2px 5px rgba(0,0,0,0.22)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '30%', minHeight: 8,
          background: dark ? '#313135' : '#ececf0',
          display: 'flex', alignItems: 'center', gap: 2, padding: '0 3px',
        }}>
          {LIGHTS.map(c => (
            <span key={c} style={{ width: 3, height: 3, borderRadius: '50%', background: c, display: 'block' }} />
          ))}
        </div>
        <div style={{ padding: '3px 4px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ height: 2.5, width: '78%', borderRadius: 2, background: dark ? '#0a84ff' : '#1e73d8' }} />
          <span style={{ height: 2, width: '56%', borderRadius: 2, background: dark ? '#4a4a4e' : '#d2d2d7' }} />
          <span style={{ height: 2, width: '66%', borderRadius: 2, background: dark ? '#3c3c40' : '#dedee3' }} />
        </div>
      </div>
    </div>
  )
}

function AppearanceTile({ mode }) {
  if (mode === 'light') return <MiniDesktop />
  if (mode === 'dark')  return <MiniDesktop dark />
  // Auto is the two halves butted together down the middle
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(0 0,50% 0,50% 100%,0 100%)' }}>
        <MiniDesktop />
      </div>
      <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(50% 0,100% 0,100% 100%,50% 100%)' }}>
        <MiniDesktop dark />
      </div>
    </>
  )
}

function GlassTile({ tinted }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: tinted
        ? 'linear-gradient(135deg,#3b2a8c,#5b3fd6 45%,#2a1c63)'
        : 'linear-gradient(135deg,#3a35c9,#6f6bff 45%,#241f8a)',
    }}>
      <div style={{
        position: 'absolute', left: '-10%', top: '30%', width: '130%', height: '42%',
        transform: 'rotate(-24deg)',
        background: tinted
          ? 'linear-gradient(90deg,rgba(255,255,255,0.05),rgba(255,255,255,0.22),rgba(255,255,255,0.04))'
          : 'linear-gradient(90deg,rgba(255,255,255,0.12),rgba(255,255,255,0.55),rgba(255,255,255,0.10))',
        filter: 'blur(0.4px)',
      }} />
    </div>
  )
}

function WallpaperTile({ entry, isDark }) {
  if (entry.kind === 'image') {
    return <img src={`/${entry.id}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  }
  if (entry.kind === 'animated') {
    return <div style={{ position: 'absolute', inset: 0, background:
      'radial-gradient(60% 70% at 20% 30%, rgba(207,5,6,0.75), transparent 70%),' +
      'radial-gradient(55% 65% at 75% 68%, rgba(140,70,20,0.7), transparent 70%),' +
      'radial-gradient(50% 60% at 50% 6%, rgba(40,35,90,0.8), transparent 70%), #0a0a0a' }} />
  }
  return <div style={{ position: 'absolute', inset: 0, background: isDark ? '#080808' : '#F2EDD9' }} />
}

// ── Panes ─────────────────────────────────────────────────────────────────────

function AppearancePane() {
  const { isDark, toggleTheme } = useThemeStore()
  const s = useSettingsStore()

  return (
    <>
      <Group>
        <Row label="Appearance" align="top">
          <div className="mac-thumb-row">
            {[
              { id: 'auto',  caption: 'Auto'  },
              { id: 'light', caption: 'Light' },
              { id: 'dark',  caption: 'Dark'  },
            ].map(opt => (
              <ThumbOption
                key={opt.id}
                caption={opt.caption}
                selected={opt.id === (isDark ? 'dark' : 'light')}
                onClick={() => { if ((opt.id === 'dark') !== isDark && opt.id !== 'auto') toggleTheme() }}
              >
                <AppearanceTile mode={opt.id} />
              </ThumbOption>
            ))}
          </div>
        </Row>
        <Row label="Liquid Glass" secondary="Choose your preferred look for Liquid Glass." align="top">
          <div className="mac-thumb-row">
            <ThumbOption caption="Clear" selected={!s.reduceTransparency}
                         onClick={() => s.setReduceTransparency(false)}>
              <GlassTile />
            </ThumbOption>
            <ThumbOption caption="Tinted" selected={s.reduceTransparency}
                         onClick={() => s.setReduceTransparency(true)}>
              <GlassTile tinted />
            </ThumbOption>
          </div>
        </Row>
      </Group>

      <Group title="Theme">
        <Row label="Colour" align="top">
          <div className="mac-swatch-row">
            {ACCENT_PRESETS.map(p => (
              <Swatch key={p.id} color={p.color} multi={p.multi} label={p.label}
                      selected={s.accentColor === p.color}
                      onClick={() => s.setAccentColor(p.color)} />
            ))}
          </div>
        </Row>
        <Row label="Text highlight colour">
          <Popup value="automatic" onChange={() => {}}
                 options={[{ value: 'automatic', label: 'Automatic' }]} />
        </Row>
      </Group>

      <Group title="Windows">
        <Row label="Sidebar icon size">
          <Popup value={s.sidebarIconSize}
                 onChange={(v) => s.update({ sidebarIconSize: v })}
                 options={[
                   { value: 'small',  label: 'Small'  },
                   { value: 'medium', label: 'Medium' },
                   { value: 'large',  label: 'Large'  },
                 ]} />
        </Row>
        <Row label="Show window title icons">
          <Switch value={!s.reduceMotion} onChange={(v) => s.setReduceMotion(!v)} />
        </Row>
      </Group>
    </>
  )
}

function WallpaperPane() {
  const isDark = useThemeStore(st => st.isDark)
  const s = useSettingsStore()
  const current = s.background === 'wallpaper' ? s.wallpaper : s.background

  return (
    <>
      <div className="mac-hero">
        <div className="mac-hero__preview">
          <WallpaperTile entry={WALLPAPERS.find(w => w.id === current) ?? WALLPAPERS[0]} isDark={isDark} />
        </div>
        <div className="mac-hero__body">
          <div className="mac-hero__head">
            <span className="mac-hero__title">
              {WALLPAPERS.find(w => w.id === current)?.label ?? 'Aurora'}
            </span>
            <Popup value="dynamic" onChange={() => {}}
                   options={[{ value: 'dynamic', label: 'Dynamic' }, { value: 'still', label: 'Still' }]} />
          </div>
          <p className="mac-hero__note">
            This wallpaper changes throughout the day, based on your location.
          </p>
          <div className="mac-hero__row">
            <span className="mac-row__label">Show on all Spaces</span>
            <Switch value onChange={() => {}} />
          </div>
        </div>
      </div>

      <Group title="Desktop Wallpapers">
        <Row align="top">
          <div className="mac-wall-grid">
            {WALLPAPERS.map(w => (
              <ThumbOption key={w.id} caption={w.label} wide={104}
                           selected={current === w.id}
                           onClick={() => s.setWallpaper(w.id)}>
                <WallpaperTile entry={w} isDark={isDark} />
              </ThumbOption>
            ))}
          </div>
        </Row>
      </Group>

      <Group title="Options">
        <Row label="Add wallpaper to Desktop & Screen Saver">
          <Switch value onChange={() => {}} />
        </Row>
        <Row label="Show desktop items">
          <Switch value={s.showDesktopIcons} onChange={(v) => s.update({ showDesktopIcons: v })} />
        </Row>
      </Group>
    </>
  )
}

function DesktopDockPane() {
  const s = useSettingsStore()
  return (
    <>
      <Group title="Dock">
        <StackRow label="Size">
          <Slider value={s.dockSize} min={36} max={78}
                  onChange={(v) => s.update({ dockSize: v })}
                  leading="Small" trailing="Large" />
        </StackRow>
        <Row label="Magnification">
          <Switch value={s.dockMagnification} onChange={(v) => s.update({ dockMagnification: v })} />
        </Row>
        <Row label="Position on screen">
          <Popup value="bottom" onChange={() => {}}
                 options={[{ value: 'left', label: 'Left' }, { value: 'bottom', label: 'Bottom' }, { value: 'right', label: 'Right' }]} />
        </Row>
        <Row label="Minimise windows using">
          <Popup value="genie" onChange={() => {}}
                 options={[{ value: 'genie', label: 'Genie Effect' }, { value: 'scale', label: 'Scale Effect' }]} />
        </Row>
        <Row label="Automatically hide and show the Dock">
          <Switch value={s.autoHideDock} onChange={(v) => s.update({ autoHideDock: v })} />
        </Row>
        <Row label="Show indicators for open applications">
          <Switch value onChange={() => {}} />
        </Row>
      </Group>

      <Group title="Desktop & Stage Manager">
        <Row label="Show items" secondary="On Desktop">
          <Switch value={s.showDesktopIcons} onChange={(v) => s.update({ showDesktopIcons: v })} />
        </Row>
        <Row label="Stage Manager" secondary="Organise windows into a single group">
          <Switch value={s.stageManager} onChange={(v) => s.update({ stageManager: v })} />
        </Row>
        <Row label="Click wallpaper to reveal desktop">
          <Popup value="stage" onChange={() => {}}
                 options={[{ value: 'always', label: 'Always' }, { value: 'stage', label: 'Only in Stage Manager' }]} />
        </Row>
      </Group>

      <Group title="Windows">
        <Row label="Tiled windows have margins">
          <Switch value onChange={() => {}} />
        </Row>
        <Row label="Drag windows to screen edges to tile">
          <Switch value onChange={() => {}} />
        </Row>
      </Group>
    </>
  )
}

function DisplaysPane() {
  const s = useSettingsStore()
  return (
    <>
      <Group>
        <Row align="top" label="Use as">
          <Popup value="main" onChange={() => {}} options={[{ value: 'main', label: 'Main display' }]} />
        </Row>
        <StackRow label="Resolution">
          <div className="mac-res-row">
            {RESOLUTIONS.map(r => (
              <ThumbOption key={r.id} selected={s.resolution === r.id}
                           onClick={() => s.update({ resolution: r.id })}
                           caption={s.resolution === r.id ? r.label : ''}>
                <div className="mac-res-tile" style={{ transform: `scale(${0.6 + r.id * 0.1})` }}>
                  <span /><span /><span />
                </div>
              </ThumbOption>
            ))}
          </div>
          <div className="mac-res-legend"><span>Larger Text</span><span>More Space</span></div>
        </StackRow>
      </Group>

      <Group title="Brightness">
        <StackRow>
          <GlassSlider value={s.brightness} onChange={s.setBrightness}
                       leading={<SunGlyph small />} trailing={<SunGlyph />} />
        </StackRow>
        <Row label="Automatically adjust brightness">
          <Switch value onChange={() => {}} />
        </Row>
        <Row label="True Tone" secondary="Automatically adapt display to make colours appear consistent">
          <Switch value={s.trueTone} onChange={(v) => s.update({ trueTone: v })} />
        </Row>
        <Row label="Night Shift" secondary="Shift colours to the warmer end after dark">
          <Switch value={s.nightShift} onChange={(v) => s.update({ nightShift: v })} />
        </Row>
      </Group>

      <Group title="Colour">
        <Row label="Colour profile">
          <Popup value="display" onChange={() => {}}
                 options={[{ value: 'display', label: 'Colour LCD' }, { value: 'srgb', label: 'sRGB IEC61966-2.1' }]} />
        </Row>
        <Row label="Refresh rate">
          <Popup value="60" onChange={() => {}}
                 options={[{ value: '60', label: '60 Hertz' }, { value: '120', label: 'ProMotion' }]} />
        </Row>
      </Group>
    </>
  )
}

function SunGlyph({ small }) {
  const r = small ? 6 : 9
  return (
    <svg width={r * 2} height={r * 2} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4
        return <line key={i}
          x1={12 + Math.cos(a) * 7} y1={12 + Math.sin(a) * 7}
          x2={12 + Math.cos(a) * 9.6} y2={12 + Math.sin(a) * 9.6} />
      })}
    </svg>
  )
}

function MenuBarPane() {
  const s = useSettingsStore()
  return (
    <>
      <Group title="Menu Bar">
        <Row label="Automatically hide and show the menu bar">
          <Popup value="never" onChange={() => {}}
                 options={[{ value: 'never', label: 'Never' }, { value: 'always', label: 'Always' },
                           { value: 'full', label: 'In Full Screen Only' }]} />
        </Row>
        <Row label="Recent documents, applications and servers">
          <Popup value="10" onChange={() => {}}
                 options={[{ value: '5', label: '5' }, { value: '10', label: '10' }, { value: '15', label: '15' }]} />
        </Row>
      </Group>

      <Group title="Control Centre Modules">
        <Row label="Wi-Fi" icon={<img src={PANE_ICONS.wifi} alt="" className="mac-row__glyph" />}>
          <Popup value="always" onChange={() => {}}
                 options={[{ value: 'always', label: 'Always Show in Menu Bar' }, { value: 'active', label: 'Show When Active' }]} />
        </Row>
        <Row label="Bluetooth" icon={<img src={PANE_ICONS.bluetooth} alt="" className="mac-row__glyph" />}>
          <Popup value="active" onChange={() => {}}
                 options={[{ value: 'always', label: 'Always Show in Menu Bar' }, { value: 'active', label: 'Show When Active' }]} />
        </Row>
        <Row label="Battery" icon={<img src={PANE_ICONS.battery} alt="" className="mac-row__glyph" />}>
          <Switch value={s.menuBarShowBattery} onChange={(v) => s.update({ menuBarShowBattery: v })} />
        </Row>
        <Row label="Focus" icon={<img src={PANE_ICONS.focus} alt="" className="mac-row__glyph" />}>
          <Popup value="active" onChange={() => {}}
                 options={[{ value: 'always', label: 'Always Show in Menu Bar' }, { value: 'active', label: 'Show When Active' }]} />
        </Row>
      </Group>

      <Group title="Clock">
        <Row label="Show date">
          <Switch value={s.menuBarShowDate} onChange={(v) => s.update({ menuBarShowDate: v })} />
        </Row>
        <Row label="Use a 24-hour clock">
          <Switch value={s.menuBarClock24} onChange={(v) => s.update({ menuBarClock24: v })} />
        </Row>
        <Row label="Display the time with seconds">
          <Switch value={s.menuBarShowSeconds} onChange={(v) => s.update({ menuBarShowSeconds: v })} />
        </Row>
      </Group>
    </>
  )
}

function SoundPane() {
  const { isEnabled, toggleSound } = useSoundStore()
  const s = useSettingsStore()
  return (
    <>
      <Group>
        <StackRow label="Alert volume">
          <Slider value={s.volume} onChange={s.setVolume}
                  leading={<SpeakerGlyph muted />} trailing={<SpeakerGlyph />} />
        </StackRow>
        <Row label="Play user interface sound effects">
          <Switch value={isEnabled} onChange={() => toggleSound()} />
        </Row>
        <Row label="Play feedback when volume is changed">
          <Switch value onChange={() => {}} />
        </Row>
      </Group>

      <Group title="Output">
        <Row label="MacBook Pro Speakers" secondary="Built-in">
          <Popup value="internal" onChange={() => {}}
                 options={[{ value: 'internal', label: 'Built-in' }, { value: 'airpods', label: 'AirPods Pro' }]} />
        </Row>
        <StackRow label="Balance">
          <Slider value={50} onChange={() => {}} leading="Left" trailing="Right" />
        </StackRow>
      </Group>

      <Group title="Sound Effects">
        <Row label="Alert sound">
          <Popup value="boop" onChange={() => {}}
                 options={[{ value: 'boop', label: 'Boop' }, { value: 'funk', label: 'Funk' }, { value: 'submarine', label: 'Submarine' }]} />
        </Row>
      </Group>
    </>
  )
}

function SpeakerGlyph({ muted }) {
  return (
    <svg width="16" height="14" viewBox="0 0 20 16" fill="currentColor">
      <path d="M8.4 1.2 4.6 4.6H1.8A.8.8 0 0 0 1 5.4v5.2a.8.8 0 0 0 .8.8h2.8l3.8 3.4a.7.7 0 0 0 1.2-.5V1.7a.7.7 0 0 0-1.2-.5Z" />
      {!muted && (
        <>
          <path d="M12.6 4.8a.75.75 0 0 1 1.05.13 5 5 0 0 1 0 6.14.75.75 0 1 1-1.18-.92 3.5 3.5 0 0 0 0-4.3.75.75 0 0 1 .13-1.05Z" />
          <path d="M15.3 2.2a.75.75 0 0 1 1.05.1 8.5 8.5 0 0 1 0 11.4.75.75 0 1 1-1.14-.98 7 7 0 0 0 0-9.44.75.75 0 0 1 .09-1.08Z" />
        </>
      )}
    </svg>
  )
}

function WifiPane() {
  const s = useSettingsStore()
  const networks = ['Wind Up.', 'Shop_5G', 'DevMiku-Guest', 'Airtel_4G_9021']
  return (
    <>
      <Group>
        <Row label="Wi-Fi">
          <Switch value={s.wifi} onChange={s.toggleWifi} />
        </Row>
      </Group>

      <Group title="Known Network">
        <Row label={s.wifiNetwork} secondary={s.wifi ? 'Connected' : 'Off'}
             icon={<img src={PANE_ICONS.wifi} alt="" className="mac-row__glyph" />}>
          <PushButton onClick={() => {}}>Details…</PushButton>
        </Row>
      </Group>

      <Group title="Other Networks">
        {networks.map(n => (
          <Row key={n} label={n}
               icon={<img src={PANE_ICONS.wifi} alt="" className="mac-row__glyph" style={{ opacity: 0.55 }} />}>
            <PushButton onClick={() => s.update({ wifiNetwork: n })}>Connect</PushButton>
          </Row>
        ))}
      </Group>

      <Group>
        <Row label="Ask to join networks">
          <Popup value="known" onChange={() => {}}
                 options={[{ value: 'off', label: 'Off' }, { value: 'known', label: 'Ask' }, { value: 'auto', label: 'Automatic' }]} />
        </Row>
      </Group>
    </>
  )
}

function BluetoothPane() {
  const s = useSettingsStore()
  const devices = [
    { name: 'Magic Keyboard',  status: 'Connected'    },
    { name: 'Magic Trackpad',  status: 'Connected'    },
    { name: 'AirPods Pro',     status: 'Not Connected' },
  ]
  return (
    <>
      <Group>
        <Row label="Bluetooth" secondary={s.bluetooth ? 'Now discoverable as “Mikdad’s MacBook Pro”' : undefined}>
          <Switch value={s.bluetooth} onChange={s.toggleBluetooth} />
        </Row>
      </Group>
      <Group title="My Devices">
        {devices.map(d => (
          <Row key={d.name} label={d.name} secondary={d.status}
               icon={<img src={PANE_ICONS.bluetooth} alt="" className="mac-row__glyph" />}>
            <PushButton onClick={() => {}}>
              {d.status === 'Connected' ? 'Disconnect' : 'Connect'}
            </PushButton>
          </Row>
        ))}
      </Group>
      <Group title="Nearby Devices">
        <Row label="Searching…" secondary="Make sure your device is in pairing mode" />
      </Group>
    </>
  )
}

function NetworkPane() {
  const s = useSettingsStore()
  return (
    <>
      <Group>
        <Row label="Wi-Fi" secondary={s.wifi ? s.wifiNetwork : 'Off'}
             icon={<img src={PANE_ICONS.wifi} alt="" className="mac-row__glyph" />}>
          <span className="mac-row__value">{s.wifi ? 'Connected' : 'Off'}</span>
        </Row>
        <Row label="Firewall" secondary="Blocks unwanted incoming connections"
             icon={<img src={PANE_ICONS.privacy} alt="" className="mac-row__glyph" />}>
          <Switch value onChange={() => {}} />
        </Row>
        <Row label="VPN" icon={<img src={PANE_ICONS.network} alt="" className="mac-row__glyph" />}>
          <span className="mac-row__value">Not Configured</span>
        </Row>
      </Group>
      <Group title="Services">
        <Row label="Thunderbolt Bridge" secondary="Not connected" />
        <Row label="AirDrop" secondary={AIRDROP_MODES.find(m => m.id === s.airdrop)?.label}>
          <Popup value={s.airdrop} onChange={s.setAirdrop}
                 options={AIRDROP_MODES.map(m => ({ value: m.id, label: m.label }))} />
        </Row>
      </Group>
    </>
  )
}

function BatteryPane() {
  return (
    <>
      <Group>
        <Row label="Battery Health" secondary="Normal">
          <PushButton onClick={() => {}}>Info…</PushButton>
        </Row>
        <StackRow label="Battery Level">
          <div className="mac-battery-bar"><div style={{ width: '87%' }} /></div>
        </StackRow>
      </Group>
      <Group title="Energy">
        <Row label="Low Power Mode">
          <Popup value="never" onChange={() => {}}
                 options={[{ value: 'never', label: 'Never' }, { value: 'always', label: 'Always' },
                           { value: 'battery', label: 'Only on Battery' }]} />
        </Row>
        <Row label="Optimise video streaming while on battery">
          <Switch value onChange={() => {}} />
        </Row>
        <Row label="Slightly dim the display while on battery power">
          <Switch value onChange={() => {}} />
        </Row>
      </Group>
    </>
  )
}

function AccessibilityPane() {
  const s = useSettingsStore()
  const { cursor, setCursor } = useCursorStore()
  return (
    <>
      <Group title="Vision">
        <Row label="Reduce motion" secondary="Minimise animations and transitions across the interface">
          <Switch value={s.reduceMotion} onChange={s.setReduceMotion} />
        </Row>
        <Row label="Reduce transparency" secondary="Replace the glass materials with solid fills">
          <Switch value={s.reduceTransparency} onChange={s.setReduceTransparency} />
        </Row>
        <Row label="Increase contrast">
          <Switch value={false} onChange={() => {}} />
        </Row>
      </Group>
      <Group title="Pointer Control">
        <Row label="Pointer style" align="top">
          <div className="mac-thumb-row">
            {CURSOR_PACKS.map(p => (
              <ThumbOption key={p.id} caption={p.label} selected={cursor === p.id}
                           onClick={() => setCursor(p.id)}>
                <div className="mac-cursor-tile">
                  {p.id === 'dot'
                    ? <span className="mac-cursor-dot" />
                    : <svg width="16" height="20" viewBox="0 0 10 13" fill="#fff"><path d="M0 0 L0 11 L3 8.2 L4.8 12.5 L6.5 11.8 L4.8 7.5 L8.5 7.5 Z" /></svg>}
                </div>
              </ThumbOption>
            ))}
          </div>
        </Row>
      </Group>
    </>
  )
}

function NotificationsPane() {
  const s = useSettingsStore()
  return (
    <>
      <Group title="Notification Centre">
        <Row label="Allow notifications">
          <Switch value={s.allowNotifications} onChange={(v) => s.update({ allowNotifications: v })} />
        </Row>
        <Row label="Show previews">
          <Popup value={s.notificationPreviews}
                 onChange={(v) => s.update({ notificationPreviews: v })}
                 options={[{ value: 'always', label: 'Always' },
                           { value: 'unlocked', label: 'When Unlocked' },
                           { value: 'never', label: 'Never' }]} />
        </Row>
        <Row label="Allow notifications when the display is sleeping">
          <Switch value={false} onChange={() => {}} />
        </Row>
      </Group>
      <Group title="Application Notifications">
        {['Mail', 'Notes', 'Spotify', 'Mikuda'].map(app => (
          <Row key={app} label={app} secondary="Banners, Sounds, Badges">
            <ChevronRight size={13} className="mac-row__chevron" />
          </Row>
        ))}
      </Group>
    </>
  )
}

function FocusPane() {
  const s = useSettingsStore()
  return (
    <>
      <Group>
        <Row label="Do Not Disturb" secondary="Silence notifications while you browse"
             icon={<img src={PANE_ICONS.focus} alt="" className="mac-row__glyph" />}>
          <Switch value={s.focus} onChange={s.toggleFocus} />
        </Row>
        <Row label="Work" secondary="Off"
             icon={<img src={PANE_ICONS.screentime} alt="" className="mac-row__glyph" />}>
          <ChevronRight size={13} className="mac-row__chevron" />
        </Row>
      </Group>
      <Group title="Focus Status">
        <Row label="Share Focus status" secondary="Let apps show when notifications are silenced">
          <Switch value onChange={() => {}} />
        </Row>
      </Group>
    </>
  )
}

function ScreenTimePane() {
  return (
    <Group title="This Week">
      <Row label="Screen Time" secondary="Daily average, 4 h 12 min">
        <span className="mac-row__value">29 h 24 min</span>
      </Row>
      <Row label="Most used" secondary="Design tools">
        <span className="mac-row__value">11 h 06 min</span>
      </Row>
      <Row label="Pickups" secondary="Daily average, 38">
        <span className="mac-row__value">266</span>
      </Row>
    </Group>
  )
}

function SpotlightPane() {
  const cats = ['Applications', 'Projects', 'Notes', 'Tools', 'Shop Items', 'Contacts', 'Developer']
  return (
    <>
      <Group title="Search Results"
             note="Only the selected categories will appear in Spotlight results.">
        {cats.map(c => (
          <Row key={c} label={c}>
            <Checkbox checked onChange={() => {}} />
          </Row>
        ))}
      </Group>
      <Group title="Privacy">
        <Row label="Prevent Spotlight from searching these locations">
          <PushButton onClick={() => {}}>Edit…</PushButton>
        </Row>
      </Group>
    </>
  )
}

function SiriPane() {
  return (
    <>
      <Group>
        <Row label="Mikuda" secondary="The assistant that knows this portfolio"
             icon={<img src={PANE_ICONS.siri} alt="" className="mac-row__glyph" />}>
          <span className="mac-row__value">On</span>
        </Row>
        <Row label="Listen for “Hey Mikuda”">
          <Switch value={false} onChange={() => {}} />
        </Row>
        <Row label="Language">
          <Popup value="en-GB" onChange={() => {}}
                 options={[{ value: 'en-GB', label: 'English (United Kingdom)' },
                           { value: 'en-US', label: 'English (United States)' },
                           { value: 'bn-BD', label: 'Bangla (Bangladesh)' }]} />
        </Row>
      </Group>
      <Group title="Suggestions">
        <Row label="Show suggestions in Spotlight"><Switch value onChange={() => {}} /></Row>
        <Row label="Learn from this portfolio"><Switch value onChange={() => {}} /></Row>
      </Group>
    </>
  )
}

function UsersPane({ onOpenAccount }) {
  return (
    <>
      <Group title="Users">
        <Row label={OWNER.name} secondary="Admin, Me"
             icon={<span className="mac-avatar mac-avatar--sm"><img src={mikdadHeadUrl} alt="" /></span>}
             onClick={onOpenAccount}>
          <ChevronRight size={13} className="mac-row__chevron" />
        </Row>
        <Row label="Guest User" secondary="Off">
          <ChevronRight size={13} className="mac-row__chevron" />
        </Row>
      </Group>
      <Group>
        <Row label="Automatically log in as">
          <Popup value="off" onChange={() => {}}
                 options={[{ value: 'off', label: 'Off' }, { value: 'me', label: OWNER.name }]} />
        </Row>
      </Group>
    </>
  )
}

function AccountPane() {
  const openMailWindow = useWindowStore(st => st.openMailWindow)
  const links = [
    { label: 'LinkedIn',  value: 'in/ferdousmikdad',  onClick: () => window.open('https://www.linkedin.com/in/ferdousmikdad/', '_blank') },
    { label: 'Instagram', value: '@ferdousmikdad',    onClick: () => window.open('https://www.instagram.com/ferdousmikdad/', '_blank') },
    { label: 'Email',     value: OWNER.email,         onClick: () => openMailWindow() },
  ]
  return (
    <>
      <div className="mac-account">
        <span className="mac-avatar mac-avatar--lg"><img src={mikdadHeadUrl} alt="" /></span>
        <div>
          <p className="mac-account__name">{OWNER.name}</p>
          <p className="mac-account__mail">{OWNER.email}</p>
        </div>
        <PushButton onClick={() => {}}>Edit Name, Phone, Email</PushButton>
      </div>
      <Group>
        {links.map(l => (
          <Row key={l.label} label={l.label} onClick={l.onClick}>
            <span className="mac-row__value">{l.value}</span>
            <ChevronRight size={13} className="mac-row__chevron" />
          </Row>
        ))}
      </Group>
      <Group title="Devices">
        <Row label="Mikdad’s MacBook Pro" secondary="This MacBook Pro 14”"
             icon={<img src={PANE_ICONS.about} alt="" className="mac-row__glyph" />}>
          <ChevronRight size={13} className="mac-row__chevron" />
        </Row>
      </Group>
    </>
  )
}

function PrivacyPane() {
  const items = ['Location Services', 'Contacts', 'Calendars', 'Photos', 'Camera', 'Microphone', 'Accessibility', 'Full Disk Access']
  return (
    <>
      <Group>
        {items.map(i => (
          <Row key={i} label={i}>
            <ChevronRight size={13} className="mac-row__chevron" />
          </Row>
        ))}
      </Group>
      <Group title="Security">
        <Row label="FileVault" secondary="FileVault secures the data on your disk">
          <span className="mac-row__value">On</span>
        </Row>
        <Row label="Lockdown Mode" secondary="Extreme protection for rare targeted attacks">
          <PushButton onClick={() => {}}>Turn On…</PushButton>
        </Row>
      </Group>
    </>
  )
}

function TouchIDPane() {
  return (
    <>
      <Group title="Touch ID">
        <Row label="Fingerprint 1" icon={<img src={PANE_ICONS.touchid} alt="" className="mac-row__glyph" />}>
          <PushButton onClick={() => {}}>Rename</PushButton>
        </Row>
        <Row label="Add Fingerprint…" onClick={() => {}} />
      </Group>
      <Group title="Use Touch ID for">
        <Row label="Unlocking your Mac"><Switch value onChange={() => {}} /></Row>
        <Row label="Apple Pay"><Switch value onChange={() => {}} /></Row>
        <Row label="Password AutoFill"><Switch value onChange={() => {}} /></Row>
      </Group>
    </>
  )
}

function LockScreenPane() {
  return (
    <>
      <Group>
        <Row label="Start Screen Saver when inactive">
          <Popup value="10" onChange={() => {}}
                 options={[{ value: '5', label: 'For 5 minutes' }, { value: '10', label: 'For 10 minutes' },
                           { value: 'never', label: 'Never' }]} />
        </Row>
        <Row label="Turn display off on battery when inactive">
          <Popup value="2" onChange={() => {}}
                 options={[{ value: '2', label: 'For 2 minutes' }, { value: '10', label: 'For 10 minutes' }]} />
        </Row>
        <Row label="Require password after screen saver begins">
          <Popup value="imm" onChange={() => {}}
                 options={[{ value: 'imm', label: 'Immediately' }, { value: '5m', label: 'After 5 minutes' }]} />
        </Row>
      </Group>
      <Group title="When Switching User">
        <Row label="Show large user names"><Switch value={false} onChange={() => {}} /></Row>
      </Group>
    </>
  )
}

function KeyboardPane() {
  return (
    <>
      <Group>
        <StackRow label="Key repeat rate">
          <Slider value={70} onChange={() => {}} leading="Slow" trailing="Fast" />
        </StackRow>
        <StackRow label="Delay until repeat">
          <Slider value={55} onChange={() => {}} leading="Long" trailing="Short" />
        </StackRow>
        <Row label="Adjust keyboard brightness in low light">
          <Switch value onChange={() => {}} />
        </Row>
      </Group>
      <Group title="Keyboard Shortcuts">
        <Row label="Command-F" secondary="Open the Finder" />
        <Row label="Command-K" secondary="Focus Spotlight search" />
        <Row label="Command-W" secondary="Close the front window" />
      </Group>
    </>
  )
}

function TrackpadPane() {
  return (
    <>
      <Group>
        <StackRow label="Tracking speed">
          <Slider value={65} onChange={() => {}} leading="Slow" trailing="Fast" />
        </StackRow>
        <Row label="Tap to click"><Switch value onChange={() => {}} /></Row>
        <Row label="Natural scrolling" secondary="Content tracks finger movement">
          <Switch value onChange={() => {}} />
        </Row>
      </Group>
      <Group title="Click">
        <Row label="Click pressure">
          <Popup value="medium" onChange={() => {}}
                 options={[{ value: 'light', label: 'Light' }, { value: 'medium', label: 'Medium' }, { value: 'firm', label: 'Firm' }]} />
        </Row>
      </Group>
    </>
  )
}

function MousePane() {
  return (
    <Group>
      <StackRow label="Tracking speed">
        <Slider value={60} onChange={() => {}} leading="Slow" trailing="Fast" />
      </StackRow>
      <Row label="Natural scrolling"><Switch value onChange={() => {}} /></Row>
      <Row label="Secondary click">
        <Popup value="right" onChange={() => {}}
               options={[{ value: 'right', label: 'Click Right Side' }, { value: 'left', label: 'Click Left Side' }]} />
      </Row>
    </Group>
  )
}

function PrintersPane() {
  return (
    <>
      <Group title="Printers">
        <Row label="No printers are available" secondary="Add a printer to get started" />
      </Group>
      <Group>
        <Row label="Default printer">
          <Popup value="last" onChange={() => {}} options={[{ value: 'last', label: 'Last Printer Used' }]} />
        </Row>
        <Row label="Default paper size">
          <Popup value="a4" onChange={() => {}}
                 options={[{ value: 'a4', label: 'A4' }, { value: 'letter', label: 'US Letter' }]} />
        </Row>
      </Group>
    </>
  )
}

function StoragePane() {
  const segments = [
    { label: 'Projects',     pct: 34, color: '#0a84ff' },
    { label: 'Applications', pct: 21, color: '#a259d9' },
    { label: 'Documents',    pct: 14, color: '#63c76a' },
    { label: 'Photos',       pct: 11, color: '#f5c518' },
    { label: 'System Data',  pct: 8,  color: '#f0803c' },
  ]
  return (
    <>
      <div className="mac-storage">
        <div className="mac-storage__head">
          <span className="mac-storage__free">176.4 GB available</span>
          <span className="mac-storage__total">of 512 GB</span>
        </div>
        <div className="mac-storage__bar">
          {segments.map(s => (
            <span key={s.label} style={{ width: `${s.pct}%`, background: s.color }} />
          ))}
        </div>
        <div className="mac-storage__legend">
          {segments.map(s => (
            <span key={s.label}><i style={{ background: s.color }} />{s.label}</span>
          ))}
        </div>
      </div>
      <Group title="Recommendations">
        <Row label="Store in iCloud" secondary="Keep recent files on this Mac only">
          <PushButton onClick={() => {}}>Turn On…</PushButton>
        </Row>
        <Row label="Empty Bin Automatically" secondary="Erase items after 30 days in the Bin">
          <PushButton onClick={() => {}}>Turn On…</PushButton>
        </Row>
      </Group>
    </>
  )
}

function SoftwareUpdatePane() {
  return (
    <>
      <Group>
        <Row label="macOS Tahoe 26.5.1" secondary="Your Mac is up to date"
             icon={<img src={PANE_ICONS.softwareupdate} alt="" className="mac-row__glyph" />}>
          <PushButton onClick={() => {}}>Check Now</PushButton>
        </Row>
      </Group>
      <Group title="Automatic Updates">
        <Row label="Check for updates"><Switch value onChange={() => {}} /></Row>
        <Row label="Download new updates when available"><Switch value onChange={() => {}} /></Row>
        <Row label="Install macOS updates"><Switch value={false} onChange={() => {}} /></Row>
      </Group>
    </>
  )
}

function GeneralPane({ onNavigate }) {
  const rows = [
    { id: 'about',          label: 'About',              icon: 'about'          },
    { id: 'softwareupdate', label: 'Software Update',    icon: 'softwareupdate' },
    { id: 'storage',        label: 'Storage',            icon: 'storage'        },
    { id: 'sharing',        label: 'Sharing',            icon: 'sharing',       stub: true },
    { id: 'datetime',       label: 'Date & Time',        icon: 'datetime',      stub: true },
    { id: 'language',       label: 'Language & Region',  icon: 'language',      stub: true },
    { id: 'loginitems',     label: 'Login Items',        icon: 'loginitems',    stub: true },
    { id: 'timemachine',    label: 'Time Machine',       icon: 'timemachine',   stub: true },
    { id: 'transferreset',  label: 'Transfer or Reset',  icon: 'transferreset', stub: true },
  ]
  return (
    <Group>
      {rows.map(r => (
        <Row key={r.id} label={r.label}
             icon={<img src={PANE_ICONS[r.icon]} alt="" className="mac-row__glyph" />}
             onClick={r.stub ? undefined : () => onNavigate(r.id)}>
          <ChevronRight size={13} className="mac-row__chevron" />
        </Row>
      ))}
    </Group>
  )
}

function AboutPane() {
  const specs = [
    ['Name',      'Mikdad’s MacBook Pro'],
    ['Chip',      'Apple M3 Pro'],
    ['Memory',    '18 GB'],
    ['Serial',    'PORTFOLIO-OS-2026'],
    ['macOS',     'Tahoe 26.5.1'],
  ]
  return (
    <>
      <div className="mac-about">
        <img src={PANE_ICONS.about} alt="" className="mac-about__icon" />
        <p className="mac-about__name">MacBook Pro</p>
        <p className="mac-about__sub">14-inch, 2024</p>
      </div>
      <Group>
        {specs.map(([k, v]) => (
          <Row key={k} label={k}><span className="mac-row__value">{v}</span></Row>
        ))}
      </Group>
      <Group title="Portfolio OS">
        <Row label="Version"><span className="mac-row__value">1.0 (build 2026.09)</span></Row>
        <Row label="Built with"><span className="mac-row__value">React · Vite · Framer Motion</span></Row>
        <Row label="Designed by"><span className="mac-row__value">{OWNER.name}</span></Row>
      </Group>
    </>
  )
}

// ── Pane registry ─────────────────────────────────────────────────────────────

const PANES = {
  wifi: WifiPane, bluetooth: BluetoothPane, network: NetworkPane, battery: BatteryPane,
  general: GeneralPane, accessibility: AccessibilityPane, appearance: AppearancePane,
  siri: SiriPane, desktopdock: DesktopDockPane, displays: DisplaysPane,
  menubar: MenuBarPane, spotlight: SpotlightPane, wallpaper: WallpaperPane,
  notifications: NotificationsPane, sound: SoundPane, focus: FocusPane,
  screentime: ScreenTimePane, privacy: PrivacyPane, touchid: TouchIDPane,
  users: UsersPane, lockscreen: LockScreenPane, keyboard: KeyboardPane,
  trackpad: TrackpadPane, mouse: MousePane, printers: PrintersPane,
  storage: StoragePane, softwareupdate: SoftwareUpdatePane, about: AboutPane,
  account: AccountPane,
}

// ── Window ────────────────────────────────────────────────────────────────────

export default function SettingsWindow() {
  const [history, setHistory]   = useState(['appearance'])
  const [histIndex, setHistIdx] = useState(0)
  const [query, setQuery]       = useState('')
  const scrollRef = useRef(null)

  const active = history[histIndex]
  const canBack    = histIndex > 0
  const canForward = histIndex < history.length - 1

  const navigate = useCallback((id) => {
    if (history[histIndex] === id) return
    setHistory(prev => [...prev.slice(0, histIndex + 1), id])
    setHistIdx(i => i + 1)
  }, [histIndex, history])

  // A pane change starts at the top, the way pushing a settings pane does
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }) }, [active])

  const allPanes = useMemo(() => SIDEBAR_GROUPS.flat(), [])
  const matches = query.trim()
    ? allPanes.filter(p => p.label.toLowerCase().includes(query.trim().toLowerCase()))
    : null

  const Pane = PANES[active] ?? AppearancePane
  const title = active === 'account' ? 'Apple Account' : (PANE_TITLES[active] ?? 'Settings')

  const navSlot = (
    <div className="mac-nav">
      <button onClick={() => canBack && setHistIdx(i => i - 1)} disabled={!canBack} aria-label="Back">
        <ChevronLeft size={15} />
      </button>
      <span className="mac-nav__div" />
      <button onClick={() => canForward && setHistIdx(i => i + 1)} disabled={!canForward} aria-label="Forward">
        <ChevronRight size={15} />
      </button>
    </div>
  )

  const sidebarContent = ({ onClose, onMinimize, onMaximize }) => (
    <WindowSidebar width={232} gutter="6px 0 6px 6px" controls={{ onClose, onMinimize, onMaximize }}>
      <div className="set-sidebar">
        <label className="set-search">
          <Search size={12} strokeWidth={2.4} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
          {query && <button onClick={() => setQuery('')} aria-label="Clear"><X size={11} /></button>}
        </label>

        <button className={`set-account${active === 'account' ? ' is-active' : ''}`}
                onClick={() => navigate('account')}>
          <span className="mac-avatar mac-avatar--md"><img src={mikdadHeadUrl} alt="" /></span>
          <span>
            <span className="set-account__name">{OWNER.name}</span>
            <span className="set-account__sub">Apple Account</span>
          </span>
        </button>

        <nav className="set-nav">
          {matches
            ? (matches.length
                ? <ul>{matches.map(p => (
                    <li key={p.id}>
                      <button className={active === p.id ? 'is-active' : ''} onClick={() => navigate(p.id)}>
                        <img src={PANE_ICONS[p.icon]} alt="" />
                        <span>{p.label}</span>
                      </button>
                    </li>))}
                  </ul>
                : <p className="set-nav__empty">No results</p>)
            : SIDEBAR_GROUPS.map((group, gi) => (
                <ul key={gi}>
                  {group.map(p => (
                    <li key={p.id}>
                      <button className={active === p.id ? 'is-active' : ''} onClick={() => navigate(p.id)}>
                        <img src={PANE_ICONS[p.icon]} alt="" />
                        <span>{p.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ))}
        </nav>
      </div>
    </WindowSidebar>
  )

  return (
    <Window id="settings" title={title} navSlot={navSlot} sidebarContent={sidebarContent}
            minSize={{ width: 720, height: 460 }}>
      <div className="window-scroll set-content" ref={scrollRef}>
        <Pane onNavigate={navigate} onOpenAccount={() => navigate('account')} />
      </div>
    </Window>
  )
}
