import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const ACCENT_PRESETS = [
  { id: 'red',    label: 'Red',    color: '#cf0506' },
  { id: 'blue',   label: 'Blue',   color: '#0064d2' },
  { id: 'purple', label: 'Purple', color: '#7c3aed' },
  { id: 'green',  label: 'Green',  color: '#059669' },
  { id: 'orange', label: 'Orange', color: '#ea580c' },
]

function applyAccent(color) {
  document.documentElement.style.setProperty('--brand', color)
}

const useSettingsStore = create(
  persist(
    (set) => ({
      background:       'animated',  // 'animated' | 'static'
      accentColor:      '#cf0506',
      reduceMotion:     false,
      showDesktopIcons: true,

      setBackground:       (bg)    => set({ background: bg }),
      setAccentColor:      (color) => { applyAccent(color); set({ accentColor: color }) },
      setReduceMotion:     (val)   => {
        document.documentElement.classList.toggle('reduce-motion', val)
        set({ reduceMotion: val })
      },
      setShowDesktopIcons: (val)   => set({ showDesktopIcons: val }),
    }),
    {
      name: 'portfolio-settings',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        applyAccent(state.accentColor)
        document.documentElement.classList.toggle('reduce-motion', state.reduceMotion)
      },
    }
  )
)

export default useSettingsStore
