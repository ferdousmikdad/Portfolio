import { create } from 'zustand'

// Apply dark class immediately on load
document.documentElement.classList.add('dark')

const useThemeStore = create((set) => ({
  isDark: true,

  toggleTheme: () =>
    set((state) => {
      const next = !state.isDark
      if (next) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { isDark: next }
    }),
}))

export default useThemeStore
