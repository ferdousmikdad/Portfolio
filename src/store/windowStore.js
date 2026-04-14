import { create } from 'zustand'

const gap      = 20
const profileW = 308, pacmanW = 620, winH = 482
const totalW   = profileW + gap + pacmanW
const vw       = window.innerWidth
const vh       = window.innerHeight
const startX   = Math.max(20, (vw - totalW) / 2)
const startY   = Math.max(20, (vh - winH) / 2 - 40)

const portfolioW = 946, portfolioH = 582
const notesW     = 900, notesH     = 580
const smallW     = 420, smallH     = 360
const toolX      = Math.max(20, (vw - portfolioW) / 2)
const toolY      = Math.max(20, (vh - portfolioH) / 2 - 30)

// All tool window IDs — must match ids in data/tools.js
export const TOOL_IDS = [
  'color-contrast',
  'color-palette',
  'retro-dot',
  'ascii-art',
  'image-trace',
  'qr-code',
  'image-converter',
  'print-setup',
  'image-text',
  'typing-tool',
]

const toolWindows = TOOL_IDS.map((id, i) => ({
  id,
  title: id,           // overridden at render time by ToolWindow
  isOpen: false,
  isMinimized: false,
  position: { x: toolX + i * 6, y: toolY + i * 4 },   // slight cascade offset
  size: { width: portfolioW, height: portfolioH },
  zIndex: 3,
}))

const defaultWindows = [
  {
    id: 'profile',
    title: 'About Me',
    isOpen: true,
    isMinimized: false,
    position: { x: startX, y: startY },
    size: { width: profileW, height: winH },
    zIndex: 1,
  },
  {
    id: 'pacman',
    title: 'Play',
    isOpen: true,
    isMinimized: false,
    position: { x: startX + profileW + gap, y: startY },
    size: { width: pacmanW, height: winH },
    zIndex: 2,
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    isOpen: false,
    isMinimized: false,
    position: { x: Math.max(20, (vw - portfolioW) / 2), y: Math.max(20, (vh - portfolioH) / 2 - 30) },
    size: { width: portfolioW, height: portfolioH },
    zIndex: 3,
  },
  {
    id: 'shop',
    title: 'Shop',
    isOpen: false,
    isMinimized: false,
    position: { x: Math.max(20, (vw - smallW) / 2 + 20), y: Math.max(20, (vh - smallH) / 2 - 20) },
    size: { width: smallW, height: smallH },
    zIndex: 3,
  },
  {
    id: 'notes',
    title: 'Notes',
    isOpen: false,
    isMinimized: false,
    position: { x: Math.max(20, (vw - notesW) / 2), y: Math.max(20, (vh - notesH) / 2 - 30) },
    size: { width: notesW, height: notesH },
    zIndex: 3,
  },
  ...toolWindows,
]

let topZ = 10

const useWindowStore = create((set, get) => ({
  windows: defaultWindows,
  activeWindowId: 'pacman',
  activePage: null,
  previewProject: null,

  navigate: (page) => set({ activePage: page }),

  openProjectPreview: (project) => {
    if (project?.slug) {
      window.history.replaceState(null, '', `#project/${project.slug}`)
    }
    set({ previewProject: project })
  },
  closeProjectPreview: () => {
    window.history.replaceState(
      null, '',
      window.location.pathname + window.location.search
    )
    set({ previewProject: null })
  },

  openWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isOpen: true, isMinimized: false, zIndex: ++topZ } : w
      ),
      activeWindowId: id,
    })),

  closeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isOpen: false } : w
      ),
    })),

  minimizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w
      ),
    })),

  focusWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, zIndex: ++topZ } : w
      ),
      activeWindowId: id,
    })),

  // Open one tool, close all other non-minimized tool windows
  switchTool: (toolId) =>
    set((state) => ({
      windows: state.windows.map((w) => {
        if (!TOOL_IDS.includes(w.id)) return w
        if (w.id === toolId) return { ...w, isOpen: true, isMinimized: false, zIndex: ++topZ }
        if (w.isMinimized)   return w          // keep minimized tools in trash
        return { ...w, isOpen: false }         // hide other open tools
      }),
      activeWindowId: toolId,
    })),

  closeAllExcept: (keepIds = []) =>
    set((state) => ({
      windows: state.windows.map((w) => {
        if (keepIds.includes(w.id)) return w
        if (w.isMinimized)          return w
        return { ...w, isOpen: false }
      }),
    })),

  toggleMaximize: (id) =>
    set((state) => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      return {
        windows: state.windows.map((w) => {
          if (w.id !== id) return w
          if (w.isMaximized) {
            return {
              ...w,
              isMaximized: false,
              position: w._savedPosition,
              size:     w._savedSize,
              _savedPosition: null,
              _savedSize:     null,
            }
          }
          return {
            ...w,
            isMaximized:    true,
            _savedPosition: w.position,
            _savedSize:     w.size,
            position: { x: 0, y: 0 },
            size:     { width: vw, height: vh },
          }
        }),
      }
    }),

  updatePosition: (id, position) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, position } : w
      ),
    })),

  getWindow:        (id) => get().windows.find((w) => w.id === id),
  openWindows:      ()   => get().windows.filter((w) => w.isOpen && !w.isMinimized),
  minimizedWindows: ()   => get().windows.filter((w) => w.isMinimized),
}))

export default useWindowStore
