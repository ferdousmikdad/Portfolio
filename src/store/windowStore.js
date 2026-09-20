import { create } from 'zustand'

const gap      = 8
const profileW = 308, aboutW = 480, winH = 482
const totalW   = profileW + gap + aboutW
const vw       = window.innerWidth
const vh       = window.innerHeight
const startX   = Math.max(20, (vw - totalW) / 2)
const startY   = Math.max(20, (vh - winH) / 2 - 40)

const portfolioW = 946, portfolioH = 582
const notesW     = 900, notesH     = 580
const finderW    = 900, finderH    = 560
const terminalW  = 700, terminalH  = 460
const smallW     = 420, smallH     = 360
/* Shop gained a 200px sidebar; the window grows by it so the card grid keeps
   the width it was designed at instead of squeezing a column. */
const shopW      = 1180, shopH     = 620
const mailW      = 560, mailH      = 430
const calcW      = 272, calcH      = 462
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
  'image-text',
  'typing-tool',
  'print-setup',
]

const toolWindows = TOOL_IDS.map((id, i) => ({
  id,
  title: id,           // overridden at render time by ToolWindow
  isOpen: false,       // no tool opens on first load — Portfolio is the landing window
  isMinimized: false,
  position: { x: toolX + i * 6, y: toolY + i * 4 },
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
    title: 'Profile',
    isOpen: false,
    isMinimized: false,
    position: { x: startX, y: startY },
    size: { width: profileW, height: winH },
    zIndex: 1,
  },
  {
    id: 'about',
    title: 'About Me',
    isOpen: false,
    isMinimized: false,
    position: { x: startX + profileW + gap, y: startY },
    size: { width: aboutW, height: winH },
    zIndex: 2,
  },
  {
    id: 'pacman',
    title: 'Play',
    isOpen: false,
    isMinimized: false,
    position: { x: startX + profileW + gap, y: startY },
    size: { width: 620, height: winH },
    zIndex: 2,
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    isOpen: true,    // open by default for the initial landing layout
    isMinimized: false,
    /* Centred in the usable area, not the raw viewport: the dock owns the
       bottom strip, so viewport-centring reads as sitting low. */
    position: centeredInUsableArea(initW, initH),
    size: { width: initW, height: initH },
    zIndex: 4,
  },
  {
    id: 'shop',
    title: 'Store',
    isOpen: false,
    isMinimized: false,
    /* A shelf of animation cards needs the room a grid needs. */
    position: { x: Math.max(20, (vw - shopW) / 2), y: Math.max(20, (vh - shopH) / 2) },
    size: { width: Math.min(shopW, vw - 40), height: Math.min(shopH, vh - 140) },
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
    id: 'settings',
    title: 'Settings',
    isOpen: false,
    isMinimized: false,
    position: centeredInUsableArea(880, 620),
    size: { width: 880, height: 620 },
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
  {
    id: 'mail',
    title: 'New Message',
    isOpen: false,
    isMinimized: false,
    position: centeredInUsableArea(mailW, mailH),
    size: { width: mailW, height: mailH },
    zIndex: 3,
  },
  {
    id: 'home',
    title: 'Mikuda',
    isOpen: false,
    isMinimized: false,
    position: centeredInUsableArea(portfolioW, portfolioH),
    size: { width: portfolioW, height: portfolioH },
    zIndex: 3,
  },
  {
    id: 'calculator',
    title: 'Calculator',
    isOpen: false,
    isMinimized: false,
    position: centeredInUsableArea(calcW, calcH),
    size: { width: calcW, height: calcH },
    zIndex: 3,
  },
  {
    /* About This Mac. Fixed size, like the real panel — it does not resize. */
    id: 'about-mac',
    title: 'About This Mac',
    isOpen: false,
    isMinimized: false,
    position: centeredInUsableArea(392, 436),
    size: { width: 392, height: 436 },
    zIndex: 3,
  },
  {
    /* What's New. Sized like the real release-notes sheet: narrow, tall,
       and not worth resizing. */
    id: 'whats-new',
    title: '',
    isOpen: false,
    isMinimized: false,
    position: centeredInUsableArea(460, 560),
    size: { width: 460, height: 560 },
    zIndex: 3,
  },
  {
    id: 'photo-booth',
    title: 'Photo Booth',
    isOpen: false,
    isMinimized: false,
    position: centeredInUsableArea(660, 640),
    size: { width: 660, height: 640 },
    zIndex: 3,
  },
  {
    id: 'spotify',
    title: 'Spotify',
    isOpen: false,
    isMinimized: false,
    position: centeredInUsableArea(880, 560),
    size: { width: 880, height: 560 },
    zIndex: 3,
  },
  ...toolWindows,
]

let topZ = 10

const useWindowStore = create((set, get) => ({
  windows: defaultWindows,
  activeWindowId: 'portfolio',
  // The window a genie restore is currently drawing: it is mounted and
  // measurable but held invisible, so the warp lands on the real geometry.
  restoringId: null,
  activePage: null,
  navKey: 0,
  previewProject: null,
  noteRequest: null,
  mailTo: null,
  // Which location Finder is showing: 'applications' | 'trash' | a favourite id
  finderView: 'applications',

  navigate: (page) => set((state) => ({ activePage: page, navKey: state.navKey + 1 })),

  /* Which pane Settings should jump to when it next renders. Settings keeps
     its own history; this is only the request, cleared as soon as it lands,
     so reopening Settings afterwards returns to where you left it. */
  settingsPane: null,
  openSettingsAt: (pane) => { get().openWindow('settings'); set({ settingsPane: pane }) },
  clearSettingsPane: () => set({ settingsPane: null }),

  /* Spotlight. It used to be local to TopBar, which meant nothing outside
     the menu bar could raise it — the What's New window needs to. */
  spotlight: false,
  /* Both setters bail when the value is already what was asked for: these
     are called from click handlers that fire on every menu open, and a
     no-op `set` still hands every subscriber a new state object. */
  openSpotlight:   () => set((s) => (s.spotlight ? s : { spotlight: true })),
  closeSpotlight:  () => set((s) => (s.spotlight ? { spotlight: false } : s)),
  toggleSpotlight: () => set((s) => ({ spotlight: !s.spotlight })),

  /* The ⌘/ shortcuts sheet. A flag rather than a window: it is a reference
     you read and dismiss, and a window would turn up in Mission Control and
     the dock for no reason. */
  shortcuts: false,
  openShortcuts:   () => set((s) => (s.shortcuts ? s : { shortcuts: true })),
  closeShortcuts:  () => set((s) => (s.shortcuts ? { shortcuts: false } : s)),
  toggleShortcuts: () => set((s) => ({ shortcuts: !s.shortcuts })),

  /* ── Mikuda ─────────────────────────────────────────────────────────
     The Siri stand-in, in two halves: the ask field that drops out of the
     menu bar, and the chat window on the desktop layer. Neither can own the
     state — the menu bar opens the field and the field opens the chat — so
     it lives here.

     `mikudaPrompt` is the question the field handed over; the chat sends it
     on mount and clears it, so reopening the chat later starts clean. */
  mikudaAsk: false,
  mikudaChat: false,
  mikudaPrompt: null,
  toggleMikudaAsk: () => set((s) => ({ mikudaAsk: !s.mikudaAsk })),
  closeMikudaAsk:  () => set((s) => (s.mikudaAsk ? { mikudaAsk: false } : s)),
  /* Asking closes the field and hands the question to the chat, the way
     Siri drops its field once you commit to a question. */
  askMikuda: (text) => set({ mikudaAsk: false, mikudaChat: true, mikudaPrompt: text }),
  closeMikudaChat: () => set({ mikudaChat: false, mikudaPrompt: null }),
  clearMikudaPrompt: () => set({ mikudaPrompt: null }),

  /* Mission Control. Lives here rather than in Desktop's local state so the
     menu bar and the dock can both raise it. */
  missionControl: false,
  toggleMissionControl: () => set((s) => ({ missionControl: !s.missionControl, launchpad: false })),
  closeMissionControl: () => set({ missionControl: false }),

  /* Launchpad. Mutually exclusive with Mission Control — macOS never shows
     both, and either one covering the other reads as a bug. */
  launchpad: false,
  toggleLaunchpad: () => set((s) => ({ launchpad: !s.launchpad, missionControl: false })),
  closeLaunchpad: () => set({ launchpad: false }),

  /* ── Power ──────────────────────────────────────────────────────────
     Sleep and Restart, the two Apple-menu rows that were drawn disabled.

     The store only holds *which* state the machine is in; the timeline —
     fade, boot bar, chime — belongs to `PowerOverlay`, which is always
     mounted and so has nothing to survive.

     Both clear every overlay first. Coming back from a restart to a
     half-open Launchpad would give the game away immediately.           */
  power: null,                       // null | 'sleeping' | 'restarting'
  sleep: () => set({
    power: 'sleeping',
    launchpad: false, missionControl: false, screenSaver: false,
    spotlight: false, shortcuts: false, notificationCenter: false,
  }),
  /* Waking hands you the lock screen, which is what a Mac does when it
     comes back from sleep. */
  wake: () => set({ power: null, locked: true }),

  restart: () => set({
    power: 'restarting',
    launchpad: false, missionControl: false, screenSaver: false,
    spotlight: false, shortcuts: false, notificationCenter: false, locked: false,
  }),
  /* A restart really does close your windows. Minimised ones go too — this
     is the one place `closeAllExcept` is not the right tool, since it
     deliberately spares them. */
  finishRestart: () => set((state) => ({
    power: null,
    windows: state.windows.map((w) => ({ ...w, isOpen: false, isMinimized: false })),
  })),

  /* Screen saver. Starting it puts away anything else that is up, the way
     the display going to sleep would. */
  screenSaver: false,
  startScreenSaver: () => set({ screenSaver: true, launchpad: false, missionControl: false }),
  stopScreenSaver: () => set({ screenSaver: false }),

  /* Lock screen. Clears the overlays under it so unlocking returns to a
     plain desktop rather than whatever was mid-flight when it locked. */
  locked: false,
  lock: () => set({ locked: true, launchpad: false, missionControl: false, screenSaver: false }),
  unlock: () => set({ locked: false }),

  /* Notification Centre — the menu-bar clock and the side-rail bell. */
  /* AirDrop. Nothing is transferred — the send is a handshake that ends at
     the contact card, which is the only thing a visitor could usefully send
     a file about. */
  airDropping: false,
  startAirDrop: () => set({ airDropping: true }),
  finishAirDrop: () => set({ airDropping: false }),

  notificationCenter: false,
  toggleNotificationCenter: () => set((s) => ({ notificationCenter: !s.notificationCenter })),
  closeNotificationCenter: () => set({ notificationCenter: false }),

  openNoteRequest: (category, noteId) => {
    const liveVW = window.innerWidth
    set((state) => ({
      noteRequest: { category, noteId },
      windows: state.windows.map((w) => {
        if (w.id !== 'notes') return w
        return {
          ...w,
          isOpen: true,
          isMinimized: false,
          zIndex: ++topZ,
          position: { x: Math.max(0, liveVW - notesW - 20), y: TOPBAR_H + 20 },
          size: { width: notesW, height: notesH },
        }
      }),
    }))
  },
  clearNoteRequest: () => set({ noteRequest: null }),

  openMailWindow: (to = '') =>
    set((state) => ({
      mailTo: to,
      windows: state.windows.map((w) => {
        if (w.id !== 'mail') return w
        return {
          ...w,
          isOpen: true,
          isMinimized: false,
          zIndex: ++topZ,
          position: centeredInUsableArea(mailW, mailH),
          size: { width: mailW, height: mailH },
        }
      }),
      activeWindowId: 'mail',
    })),
  clearMailTo: () => set({ mailTo: null }),

  /* The Trash is not its own app — on a Mac it is a folder Finder opens, so
     the dock's basket brings up Finder pointed at that location. Already-open
     Finder windows just change location, which is what a single click does
     when a Finder window is already frontmost. */
  openFinderAt: (view) =>
    set((state) => ({
      finderView: view,
      windows: state.windows.map((w) => {
        if (w.id !== 'finder') return w
        return {
          ...w,
          isOpen: true,
          isMinimized: false,
          zIndex: ++topZ,
          position: w.isOpen && !w.isMinimized
            ? w.position
            : centeredInUsableArea(finderW, finderH),
        }
      }),
      activeWindowId: 'finder',
    })),

  setFinderView: (view) => set({ finderView: view }),

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
        if (id === 'portfolio' || id === 'home') {
          return {
            ...w,
            isOpen: true,
            isMinimized: false,
            zIndex: ++topZ,
            size:     { width: portfolioW, height: portfolioH },
            position: centeredInUsableArea(portfolioW, portfolioH),
          }
        }
        if (id === 'calculator') {
          return {
            ...w,
            isOpen: true,
            isMinimized: false,
            zIndex: ++topZ,
            size:     { width: calcW, height: calcH },
            position: centeredInUsableArea(calcW, calcH),
          }
        }
        if (id === 'spotify') {
          return {
            ...w,
            isOpen: true,
            isMinimized: false,
            zIndex: ++topZ,
            size:     { width: 880, height: 560 },
            position: centeredInUsableArea(880, 560),
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

  setRestoring: (id) => set({ restoringId: id }),

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
