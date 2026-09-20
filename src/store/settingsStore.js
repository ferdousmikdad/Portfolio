import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const ACCENT_PRESETS = [
  { id: 'multicolour', label: 'Multicolour', color: '#0064d2', multi: true },
  { id: 'blue',        label: 'Blue',        color: '#0a84ff' },
  { id: 'purple',      label: 'Purple',      color: '#a259d9' },
  { id: 'pink',        label: 'Pink',        color: '#f0559c' },
  { id: 'red',         label: 'Red',         color: '#cf0506' },
  { id: 'orange',      label: 'Orange',      color: '#f0803c' },
  { id: 'yellow',      label: 'Yellow',      color: '#f5c518' },
  { id: 'green',       label: 'Green',       color: '#63c76a' },
  { id: 'graphite',    label: 'Graphite',    color: '#8c8c91' },
]

/* The Tahoe wallpaper picker groups its thumbnails; these are the two shipped
   with the project plus the two procedural backdrops the desktop can draw. */
export const WALLPAPERS = [
  { id: 'wallpaper.jpg',   label: 'Sonoma Horizon', kind: 'image' },
  { id: 'wallpaper-1.jpg', label: 'Tahoe Day',      kind: 'image' },
  { id: 'animated',        label: 'Aurora',         kind: 'animated' },
  { id: 'static',          label: 'Solid Colour',   kind: 'static'   },
]

/* ── Hot corners ───────────────────────────────────────────────────────────
   What each corner of the screen does when the pointer reaches it.

   macOS ships every corner set to nothing, and for good reason: a corner
   that fires on a passing cursor is infuriating. Only the bottom-left is on
   by default here — it is the one corner nothing else lives near, unlike the
   top-right where a visitor is reaching for their browser's own controls. */
export const HOT_CORNER_ACTIONS = [
  { id: 'none',        label: '—' },
  { id: 'mission',     label: 'Mission Control' },
  { id: 'launchpad',   label: 'Launchpad' },
  { id: 'desktop',     label: 'Show Desktop' },
  { id: 'saver',       label: 'Start Screen Saver' },
  { id: 'lock',        label: 'Lock Screen' },
  { id: 'notes',       label: 'Notification Centre' },
  { id: 'sleep',       label: 'Put Display to Sleep' },
]

export const AIRDROP_MODES = [
  { id: 'off',      label: 'No One'        },
  { id: 'contacts', label: 'Contacts Only' },
  { id: 'everyone', label: 'Everyone'      },
]

/* macOS lists scaled resolutions as a row of "Larger Text … More Space" steps
   rather than raw pixel counts; only the selected one names its dimensions. */
export const RESOLUTIONS = [
  { id: 0, label: '1024 × 640'  },
  { id: 1, label: '1280 × 800'  },
  { id: 2, label: '1440 × 900'  },
  { id: 3, label: '1680 × 1050' },
  { id: 4, label: '1920 × 1200' },
]

function applyAccent(color) {
  document.documentElement.style.setProperty('--brand', color)
}

/* Brightness is faked the way a screen dims: a black scrim over the desktop,
   never a filter on the root — a filter would create a containing block and
   every backdrop-filter in the app would stop sampling. */
function applyBrightness(value) {
  document.documentElement.style.setProperty('--screen-dim', String((100 - value) / 100 * 0.55))
}

const useSettingsStore = create(
  persist(
    (set) => ({
      // ── Appearance ────────────────────────────────────────────────────────
      /* Sonoma Horizon out of the box. `background` has to say 'wallpaper'
         too — `wallpaper` alone only names which image would be used. */
      background:       'wallpaper',       // 'animated' | 'static' | 'wallpaper'
      wallpaper:        'wallpaper.jpg',   // Sonoma Horizon
      accentColor:      '#0a84ff',   // Blue, matching the ACCENT_PRESETS entry
      sidebarIconSize:  'medium',         // 'small' | 'medium' | 'large'
      reduceMotion:     false,
      reduceTransparency: false,

      // ── Desktop & Dock ────────────────────────────────────────────────────
      showDesktopIcons: true,
      dockMagnification: true,
      dockSize:         52,
      autoHideDock:     false,
      stageManager:     false,
      hotCorners: {
        topLeft:     'none',
        topRight:    'none',
        bottomLeft:  'mission',
        bottomRight: 'none',
      },

      // ── Menu bar ──────────────────────────────────────────────────────────
      menuBarShowDate:    true,
      menuBarShowSeconds: false,
      menuBarClock24:     false,
      menuBarShowBattery: true,

      // ── Displays ──────────────────────────────────────────────────────────
      resolution:  2,
      brightness:  85,
      nightShift:  false,
      trueTone:    true,

      // ── Sound ─────────────────────────────────────────────────────────────
      volume: 65,
      muted:  false,

      // ── Network / sharing ─────────────────────────────────────────────────
      wifi:        true,
      wifiNetwork: 'Mikdad_5G',
      bluetooth:   true,
      airdrop:     'contacts',
      focus:       false,

      // ── Notifications ─────────────────────────────────────────────────────
      allowNotifications: true,
      notificationPreviews: 'unlocked',

      setBackground:  (bg)    => set({ background: bg }),
      setWallpaper:   (id)    => {
        const entry = WALLPAPERS.find(w => w.id === id)
        if (!entry) return
        if (entry.kind === 'image') set({ background: 'wallpaper', wallpaper: id })
        else set({ background: entry.kind })
      },
      setAccentColor: (color) => { applyAccent(color); set({ accentColor: color }) },
      setReduceMotion: (val)  => {
        document.documentElement.classList.toggle('reduce-motion', val)
        set({ reduceMotion: val })
      },
      setReduceTransparency: (val) => {
        document.documentElement.classList.toggle('reduce-transparency', val)
        set({ reduceTransparency: val })
      },
      setBrightness: (val) => { applyBrightness(val); set({ brightness: val }) },
      setVolume:     (val) => set({ volume: val, muted: val === 0 }),
      toggleWifi:      () => set(s => ({ wifi: !s.wifi })),
      toggleBluetooth: () => set(s => ({ bluetooth: !s.bluetooth })),
      toggleFocus:     () => set(s => ({ focus: !s.focus })),
      setAirdrop:      (m) => set({ airdrop: m }),
      setHotCorner: (corner, action) =>
        set((st) => ({ hotCorners: { ...st.hotCorners, [corner]: action } })),
      update: (patch) => set(patch),
    }),
    {
      name: 'portfolio-settings',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        applyAccent(state.accentColor)
        applyBrightness(state.brightness ?? 85)
        document.documentElement.classList.toggle('reduce-motion', state.reduceMotion)
        document.documentElement.classList.toggle('reduce-transparency', !!state.reduceTransparency)
      },
    }
  )
)

export default useSettingsStore
