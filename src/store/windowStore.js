import { create } from 'zustand'

const gap      = 8
const profileW = 308, pacmanW = 620, winH = 482
const totalW   = profileW + gap + pacmanW
const vw       = window.innerWidth
const vh       = window.innerHeight
const startX   = Math.max(20, (vw - totalW) / 2)
const startY   = Math.max(20, (vh - winH) / 2 - 40)

const portfolioW = 946, portfolioH = 582
const notesW     = 900, notesH     = 580
const finderW    = 900, finderH    = 560
const terminalW  = 700, terminalH  = 460
const smallW     = 420, smallH     = 360
const initW      = vw <= 1440 ? Math.round(portfolioW * 0.9) : portfolioW
const initH      = vw <= 1440 ? Math.round(portfolioH * 0.9) : portfolioH

const TOPBAR_H  = 28
const DOCK_SAFE = 88

const centeredInUsableArea = (w, h) => {
  const liveVW  = window.innerWidth
  const liveVH  = window.innerHeight
  const usableH = liveVH - TOPBAR_H - DOCK_SAFE
  return {
    x: Math.max(0, Math.round((liveVW - w) / 2)),
    y: Math.max(TOPBAR_H, Math.round(TOPBAR_H + (usableH - h) / 2)),
  }
}
const toolX      = Math.max(20, (vw - initW) / 2)
const toolY      = Math.max(20, (vh - initH) / 2 - 30)

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
  isOpen: id === 'color-contrast',   // open color-contrast on first load
  isMinimized: false,
  // color-contrast gets a left-aligned position for the initial landing layout
  position: id === 'color-contrast'
    ? { x: Math.max(20, (vw - initW) / 2), y: Math.max(20, (vh - initH) / 2) }
    : { x: toolX + i * 6, y: toolY + i * 4 },
  size: { width: initW, height: initH },
  zIndex: 3,
}))

const docW = 340, docH = 380

const defaultWindows = [
  {
    id: 'bio',
    title: 'about_me.txt',
    isOpen: false,
    isMinimized: false,
    position: { x: Math.max(20, vw - docW - 24), y: 80 },
    size: { width: docW, height: docH },
    zIndex: 3,
  },
  {
    id: 'skills',
    title: 'skills.txt',
    isOpen: false,
    isMinimized: false,
    position: { x: Math.max(20, vw - docW - 60), y: 100 },
    size: { width: docW, height: docH },
    zIndex: 3,
  },
  {
    id: 'contact',
    title: 'contact.txt',
    isOpen: false,
    isMinimized: false,
    position: { x: Math.max(20, vw - docW - 96), y: 120 },
    size: { width: docW, height: docH },
    zIndex: 3,
  },
  {
    id: 'profile',
    title: 'About Me',
    isOpen: false,   // not shown on initial tools page
    isMinimized: false,
    position: { x: startX, y: startY },
    size: { width: profileW, height: winH },
    zIndex: 1,
  },
  {
    id: 'pacman',
    title: 'Play',
    isOpen: false,   // not shown on initial tools page
    isMinimized: false,
    position: { x: startX + profileW + gap, y: startY },
    size: { width: pacmanW, height: winH },
    zIndex: 2,
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    isOpen: true,    // open by default for the initial landing layout
    isMinimized: false,
    position: { x: Math.max(20, (vw - initW) / 2), y: Math.max(20, (vh - initH) / 2) },
    size: { width: initW, height: initH },
    zIndex: 4,  // above the tool window
  },
  {
    id: 'shop',
    title: 'Shop',
    isOpen: false,
    isMinimized: false,
    position: { x: Math.max(20, (vw - smallW) / 2), y: Math.max(20, (vh - smallH) / 2) },
    size: { width: smallW, height: smallH },
    zIndex: 3,
  },
  {
    id: 'notes',
    title: 'Notes',
    isOpen: false,
    isMinimized: false,
    position: { x: Math.max(20, (vw - notesW) / 2), y: Math.max(20, (vh - notesH) / 2) },
    size: { width: notesW, height: notesH },
    zIndex: 3,
  },
  {
    id: 'terminal',
    title: 'Terminal',
    isOpen: false,
    isMinimized: false,
    position: centeredInUsableArea(terminalW, terminalH),
    size: { width: terminalW, height: terminalH },
    zIndex: 3,
  },
  {
    id: 'finder',
    title: 'Finder',
    isOpen: false,
    isMinimized: false,
    position: centeredInUsableArea(finderW, finderH),
    size: { width: finderW, height: finderH },
    zIndex: 3,
  },
  ...toolWindows,
]

let topZ = 10

const useWindowStore = create((set, get) => ({
  windows: defaultWindows,
  activeWindowId: 'color-contrast',
  activePage: null,
  navKey: 0,
  previewProject: null,

  navigate: (page) => set((state) => ({ activePage: page, navKey: state.navKey + 1 })),

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
      windows: state.windows.map((w) => {
        if (w.id !== id) return w
        if (id === 'portfolio') {
          return {
            ...w,
            isOpen: true,
            isMinimized: false,
            zIndex: ++topZ,
            size:     { width: portfolioW, height: portfolioH },
            position: centeredInUsableArea(portfolioW, portfolioH),
          }
        }
        if (id === 'notes') {
          return {
            ...w,
            isOpen: true,
            isMinimized: false,
            zIndex: ++topZ,
            position: centeredInUsableArea(notesW, notesH),
          }
        }
        if (id === 'terminal') {
          return {
            ...w,
            isOpen: true,
            isMinimized: false,
            zIndex: ++topZ,
            position: centeredInUsableArea(terminalW, terminalH),
          }
        }
        if (id === 'finder') {
          return {
            ...w,
            isOpen: true,
            isMinimized: false,
            zIndex: ++topZ,
            position: centeredInUsableArea(finderW, finderH),
          }
        }
        return { ...w, isOpen: true, isMinimized: false, zIndex: ++topZ }
      }),
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

  // Open a tool without closing others — focus if already open, restore if minimized
  openTool: (toolId) =>
    set((state) => ({
      windows: state.windows.map((w) => {
        if (w.id !== toolId) return w
        if (w.isOpen && !w.isMinimized) return { ...w, zIndex: ++topZ }
        return {
          ...w,
          isOpen: true,
          isMinimized: false,
          zIndex: ++topZ,
          size:     { width: portfolioW, height: portfolioH },
          position: centeredInUsableArea(portfolioW, portfolioH),
        }
      }),
      activeWindowId: toolId,
    })),

  // Open one tool, close all other non-minimized tool windows
  switchTool: (toolId) =>
    set((state) => ({
      windows: state.windows.map((w) => {
        if (!TOOL_IDS.includes(w.id)) return w
        if (w.id === toolId) {
          return {
            ...w,
            isOpen: true,
            isMinimized: false,
            zIndex: ++topZ,
            size:     { width: portfolioW, height: portfolioH },
            position: centeredInUsableArea(portfolioW, portfolioH),
          }
        }
        if (w.isMinimized) return w
        return { ...w, isOpen: false }
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
              zIndex:   w._savedZIndex ?? ++topZ,
              _savedPosition: null,
              _savedSize:     null,
              _savedZIndex:   null,
            }
          }
          return {
            ...w,
            isMaximized:    true,
            _savedPosition: w.position,
            _savedSize:     w.size,
            _savedZIndex:   w.zIndex,
            position: { x: 0, y: 0 },
            size:     { width: vw, height: vh },
            zIndex:   9999,
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

  updateSizePosition: (id, size, position) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, size, position } : w
      ),
    })),

  getWindow:        (id) => get().windows.find((w) => w.id === id),
  openWindows:      ()   => get().windows.filter((w) => w.isOpen && !w.isMinimized),
  minimizedWindows: ()   => get().windows.filter((w) => w.isMinimized),
}))

export default useWindowStore
