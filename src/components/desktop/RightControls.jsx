import { Bell } from 'lucide-react'
import useThemeStore from '@/store/themeStore'
import useSoundStore from '@/store/soundStore'
import darkModeIcon from '@/assets/icons/darkmode.svg'
import Tip from '@/components/ui/Tip'

function SoundWaveIcon({ isEnabled }) {
  return (
    <div className="sound-wave-icon" data-active={isEnabled}>
      <span className="bar" style={{ '--i': 0 }} />
      <span className="bar" style={{ '--i': 1 }} />
      <span className="bar" style={{ '--i': 2 }} />
      <span className="bar" style={{ '--i': 3 }} />
    </div>
  )
}

export default function RightControls() {
  const { isDark, toggleTheme } = useThemeStore()
  const { isEnabled, toggleSound } = useSoundStore()

  return (
    <div className="absolute left-5 bottom-8 flex flex-col items-center gap-5 z-30">
      <Tip label="Notifications" placement="top">
        <button className="control-icon">
          <Bell size={18} />
        </button>
      </Tip>

      <Tip label={isEnabled ? 'Sound on' : 'Sound off'} placement="top">
        <button className="control-icon" onClick={toggleSound}>
          <SoundWaveIcon isEnabled={isEnabled} />
        </button>
      </Tip>

      <Tip label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} placement="top">
        <button
          className="control-icon"
          onClick={toggleTheme}
          style={{ opacity: isDark ? 1 : 0.5, transition: 'opacity 0.2s ease' }}
        >
          <img src={darkModeIcon} alt="theme toggle" width={21} height={21} />
        </button>
      </Tip>
    </div>
  )
}
