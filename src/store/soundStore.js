import { create } from 'zustand'
import { Howl } from 'howler'

// Lazily instantiated Howl instances — created on first play, not on import.
// This avoids browser autoplay policy issues before any user interaction.
const howls = {}

function getHowl(key) {
  if (howls[key]) return howls[key]

  const sources = {
    click:        ['/sounds/click.mp3', '/sounds/click.wav'],
    open:         ['/sounds/click.mp3'],
    close:        ['/sounds/close.wav'],
    minimize:     ['/sounds/minimize.wav'],
    notification: ['/sounds/notification.wav'],
  }

  if (!sources[key]) return null

  howls[key] = new Howl({
    src: sources[key],
    volume: 0.6,
    preload: true,
  })

  return howls[key]
}

const useSoundStore = create((set, get) => ({
  isEnabled: true,

  toggleSound: () => {
    const next = !get().isEnabled
    // Mute / unmute all loaded Howl instances globally
    Howler.mute(!next)
    set({ isEnabled: next })
  },

  play: (soundKey) => {
    if (!get().isEnabled) return
    try {
      const howl = getHowl(soundKey)
      if (howl) howl.play()
    } catch {
      // silently fail
    }
  },
}))

export default useSoundStore
