import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const CURSOR_PACKS = [
  { id: 'system', label: 'System', description: 'OS default cursor'  },
  { id: 'dot',    label: 'Dot',    description: 'Minimal dot cursor'  },
  { id: 'hand',   label: 'Hand',   description: 'Friendly pointer'   },
]

const useCursorStore = create(
  persist(
    (set) => ({
      cursor:    'dot',
      setCursor: (cursor) => set({ cursor }),
    }),
    { name: 'cursor-pref' }
  )
)

export default useCursorStore
