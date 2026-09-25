import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TopBar from './TopBar'
import WelcomeModal from './WelcomeModal'
import Background from './Background'
import ToolsPageDock from '@/components/dock/ToolsPageDock'
import { GlassDefs } from '@/components/ui/LiquidGlass'
import MenuWindow from '@/components/dock/MenuWindow'
import ContactsWindow from '@/components/apps/ContactsWindow'
import PacmanWindow from '@/components/apps/PacmanWindow'
import DocWindow from '@/components/apps/BioWindow'
import WorkWindow from '@/components/apps/WorkWindow'
import ShopWindow from '@/components/apps/ShopWindow'
import NotesWindow from '@/components/apps/NotesWindow'
import ToolWindow from '@/components/apps/ToolWindow'
import FinderWindow from '@/components/apps/FinderWindow'
import TerminalWindow from '@/components/apps/TerminalWindow'
import useWindowStore, { TOOL_IDS } from '@/store/windowStore'
import useSettingsStore from '@/store/settingsStore'
import useTrashStore, { trashedFrom } from '@/store/trashStore'
import useDragStore from '@/store/dragStore'
import DragGhost from '@/components/ui/DragGhost'
import DESKTOP_FILES from '@/data/desktopFiles'
import useSound from '@/hooks/useSound'
import HomeWindow from '@/components/apps/HomeWindow'
import MusicWindow from '@/components/apps/MusicWindow'
import PreviewWindow from '@/components/apps/PreviewWindow'
/* Chess carries three.js and a 3D set, so it is only fetched once opened. */
const ChessWindow = lazy(() => import('@/components/apps/ChessWindow'))
import SettingsWindow from '@/components/apps/SettingsWindow'
import MailWindow from '@/components/apps/MailWindow'
import CalculatorWindow from '@/components/apps/CalculatorWindow'
import AboutMacWindow from '@/components/apps/AboutMacWindow'
import PhotoBoothWindow from '@/components/apps/PhotoBoothWindow'
import WhatsNewWindow from '@/components/apps/WhatsNewWindow'
import ShortcutsOverlay from '@/components/desktop/ShortcutsOverlay'
import PowerOverlay from '@/components/desktop/PowerOverlay'
import MissionControl from '@/components/desktop/MissionControl'
import QuickLook from '@/components/desktop/QuickLook'
import Launchpad from '@/components/desktop/Launchpad'
import ScreenSaver from '@/components/desktop/ScreenSaver'
import LockScreen from '@/components/desktop/LockScreen'
import StageManager from '@/components/desktop/StageManager'
import NotificationCenter from '@/components/desktop/NotificationCenter'
import AirDropSheet from '@/components/desktop/AirDropSheet'
import GetInfo from '@/components/desktop/GetInfo'
import TimeMachine from '@/components/desktop/TimeMachine'
import DesktopWidgets from '@/components/desktop/DesktopWidgets'
import ContextMenu from '@/components/ui/ContextMenu'
import useDesktopStore from '@/store/desktopStore'
import { TAGS } from '@/data/projects'
import folderIconUrl from '@/assets/icons/Folder.png'
import useDesktopItems, { SHIPPED_AT, DESKTOP_PATH } from '@/hooks/useDesktopItems'
import useHotCorners from '@/hooks/useHotCorners'
import allProjects from '@/data/projects'

/* Viewport coordinates for a framer drag. The native pointer event is the
   reliable source — the dock is hit-tested in viewport space. */
const pointOf = (event, info) =>
  typeof event?.clientX === 'number'
    ? { x: event.clientX, y: event.clientY }
    : info.point


/* Sort By, in the order Finder lists it. */
const SORTS = [
  ['none',      'None'],
  ['name',      'Name'],
  ['kind',      'Kind'],
  ['dateAdded', 'Date Added'],
  ['size',      'Size'],
  ['tags',      'Tags'],
]
const bytes = (size) => {
  const m = /([\d.]+)\s*(KB|MB|GB)/i.exec(size ?? '')
  return m ? parseFloat(m[1]) * { KB: 1e3, MB: 1e6, GB: 1e9 }[m[2].toUpperCase()] : 0
}
const sorters = {
  name:      (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }),
  kind:      (a, b) => (a.kind === 'folder' ? 0 : 1) - (b.kind === 'folder' ? 0 : 1) || a.name.localeCompare(b.name),
  dateAdded: (a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0),
  size:      (a, b) => bytes(b.size) - bytes(a.size),
  tags:      (a, b) => {
    const rank = (x) => x.tags.length ? TAGS.findIndex((t) => t.id === x.tags[0]) : 99
    return rank(a) - rank(b) || a.name.localeCompare(b.name)
  },
}

/* An icon's slot in the right-hand column Finder arranges the desktop
   into: top to bottom, then the next column to the left. */
const slot = (i) => {
  const perCol = Math.max(1, Math.floor((window.innerHeight - 80 - 120) / 100))
  return { x: window.innerWidth - 96 - Math.floor(i / perCol) * 96, y: 80 + (i % perCol) * 100 }
}

/* The label while renaming: Finder selects the name without its extension,
   so typing replaces "about_me" and keeps ".txt". Return commits, Escape
   leaves the old name. */
function RenameField({ value, onDone }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.focus()
    const dot = value.lastIndexOf('.')
    el.setSelectionRange(0, dot > 0 ? dot : value.length)
  }, [value])
  const commit = () => onDone(ref.current.value.trim() || null)
  return (
    <input
      ref={ref}
      className="desktop-icon-rename"
      defaultValue={value}
      spellCheck={false}
      onKeyDown={(e) => {
        e.stopPropagation()
        if (e.key === 'Enter')  { e.preventDefault(); commit() }
        if (e.key === 'Escape') { e.preventDefault(); onDone(null) }
      }}
      onBlur={commit}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    />
  )
}

function DesktopIcon({ file, initialX, initialY, onOpen, selected, onSelect, onTrash, onAirDrop, onMenu, renaming, onRenamed }) {
  const pos     = useRef({ x: initialX, y: initialY })
  const [, rerender] = useState(0)
  const [lifted, setLifted] = useState(false)
  const didDrag = useRef(false)

  const beginDrag = useDragStore((s) => s.begin)
  const moveDrag  = useDragStore((s) => s.move)
  const endDrag   = useDragStore((s) => s.end)

  /* What the Trash will be holding if this lands there. The origin is what
     makes Put Back work: the desktop filters itself against the Trash, so
     removing the item here is the same thing as the file reappearing. */
  const payload = () => ({
    id:     file.id,
    name:   file.name,
    kind:   file.kind,
    icon:   file.icon,
    size:   file.size,
    origin: { source: 'desktop', id: file.id },
  })

  return (
    <motion.div
      className={`desktop-icon${selected ? ' selected' : ''}`}
      /* Lifted above the dock while in hand: a file being dragged to the
         Trash has to stay visible over the slab it is aimed at. */
      style={{ position: 'absolute', x: pos.current.x, y: pos.current.y, zIndex: lifted ? 9999 : 15 }}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={(event, info) => {
        didDrag.current = false
        setLifted(true)
        beginDrag(payload(), pointOf(event, info))
      }}
      onDrag={(event, info) => {
        if (Math.abs(info.offset.x) > 3 || Math.abs(info.offset.y) > 3) didDrag.current = true
        moveDrag(pointOf(event, info))
      }}
      onDragEnd={(event, info) => {
        setLifted(false)
        // Dropped on a target: the file leaves the desktop and the icon
        // unmounts, so there is no position left to commit.
        const drop = endDrag()
        if (drop.target === 'trash')   { onTrash(payload()); return }
        if (drop.target === 'airdrop') { onAirDrop(payload()); return }
        pos.current = { x: pos.current.x + info.offset.x, y: pos.current.y + info.offset.y }
        rerender((n) => n + 1)
      }}
      onClick={(e) => {
        if (didDrag.current) return
        e.stopPropagation()
        onSelect()
      }}
      onDoubleClick={(e) => {
        if (didDrag.current) return
        e.stopPropagation()
        onOpen()
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onSelect()
        onMenu(e)
      }}
      title={file.name}
      drag={!renaming}
    >
      <img src={file.icon} alt={file.name} draggable={false} />
      {renaming ? (
        <RenameField value={file.name} onDone={onRenamed} />
      ) : (
        <span className="desktop-icon-label">
          {file.tags?.length > 0 && (
            <span className="desktop-icon-tags">
              {file.tags.map((t) => <i key={t} style={{ background: TAGS.find((x) => x.id === t)?.color }} />)}
            </span>
          )}
          {file.name}
        </span>
      )}
    </motion.div>
  )
}

export default function Desktop() {
  const [menuOpen,      setMenuOpen]      = useState(false)
  const [selectedIcon,  setSelectedIcon]  = useState(null)
  const [quickLook,     setQuickLook]     = useState(null)   // the file, or null

  useHotCorners()
  const menuRef  = useRef(null)
  const airDrop        = useWindowStore((s) => s.startAirDrop)
  const missionControl = useWindowStore((s) => s.missionControl)
  const launchpad      = useWindowStore((s) => s.launchpad)
  const toggleLaunchpad = useWindowStore((s) => s.toggleLaunchpad)
  const closeLaunchpad  = useWindowStore((s) => s.closeLaunchpad)
  const toggleShortcuts = useWindowStore((s) => s.toggleShortcuts)
  const { openWindow, closeAllExcept, switchTool, activePage, navKey, navigate, openProjectPreview, openMailWindow } = useWindowStore()
  const isAnyMaximized    = useWindowStore((s) => s.windows.some((w) => w.isMaximized))
  const showDesktopIcons  = useSettingsStore((s) => s.showDesktopIcons)
  const chessOpen = useWindowStore((s) => s.windows.some((w) => w.id === 'chess' && (w.isOpen || w.isMinimized)))
  const showDesktopWidgets = useSettingsStore((s) => s.showDesktopWidgets ?? true)
  const trashItems        = useTrashStore((s) => s.items)
  const trashFile         = useTrashStore((s) => s.trashItem)
  const trashedOnDesktop  = trashedFrom(trashItems, 'desktop')
  const setActivePage = navigate
  const play = useSound()

  /* ── The desktop's own items and its right-click menus ── */
  const openSettingsAt           = useWindowStore((s) => s.openSettingsAt)
  const openFinderAt             = useWindowStore((s) => s.openFinderAt)
  const toggleNotificationCenter = useWindowStore((s) => s.toggleNotificationCenter)
  const { sortBy, layout, newFolder, rename, toggleTag, setSortBy, cleanUp } = useDesktopStore()
  const [menu,     setMenu]     = useState(null)   // { at, items }
  const info    = useDesktopStore((s) => s.info)
  const setInfo = useDesktopStore((s) => s.showInfo)
  const [renaming, setRenaming] = useState(null)   // id of the icon being renamed

  /* Shipped files and the visitor's folders, as one list, minus whatever
     is in the Trash, with any rename and tags applied. */
  const desktopItems = useDesktopItems()
  if (sortBy !== 'none') desktopItems.sort(sorters[sortBy])
  // Read by the key handlers below without resubscribing them every render.
  const itemsRef = useRef(desktopItems)
  itemsRef.current = desktopItems

  /* With a sort chosen the whole desktop sits in Finder's column; with
     none, the shipped files keep their places and a new folder stays where
     it was made — until Clean Up lines everything up. */
  const placeOf = (f, i) => {
    if (sortBy !== 'none') return slot(i)
    if (f.kind === 'folder' && f.x != null) return { x: f.x, y: f.y }
    return { x: window.innerWidth - 96, y: f.y }
  }
  const cleanUpNow = () => {
    const taken = new Set(DESKTOP_FILES.filter((f) => !trashedOnDesktop.has(f.id)).map((f) => f.y))
    let i = 0
    const nextFree = () => { while (taken.has(slot(i).y) && slot(i).x === window.innerWidth - 96) i++; return slot(i++) }
    useDesktopStore.setState((st) => ({
      folders: st.folders.map((x) => (trashedOnDesktop.has(x.id) ? x : { ...x, ...nextFree() })),
    }))
    cleanUp()
  }

  const trashPayload = (f) => ({
    id: f.id, name: f.name, kind: f.kind, icon: f.icon, size: f.size,
    origin: { source: 'desktop', id: f.id },
  })
  const openItem = (f) => (f.kind === 'folder' ? openFinderAt(`folder:${f.id}`) : openWindow(f.windowId))
  const infoFor = (f) => ({
    name: f.name, kind: f.kind, icon: f.icon, size: f.size, tags: f.tags,
    where: DESKTOP_PATH, created: f.addedAt, modified: f.addedAt,
  })

  const fileMenu = (f) => [
    { label: 'Open', icon: 'arrow.up.right.square', shortcut: '⌘O', onClick: () => openItem(f) },
    ...(f.kind === 'folder' ? [] : [{
      label: 'Open With',
      submenu: [{ label: 'TextEdit (default)', checked: true, onClick: () => openItem(f) }],
    }]),
    { sep: true },
    { label: 'Move to Trash', icon: 'trash', shortcut: '⌘⌫', onClick: () => { play('trash'); trashFile(trashPayload(f)) } },
    { sep: true },
    { label: 'Get Info',   icon: 'info.circle', shortcut: '⌘I', onClick: () => setInfo(infoFor(f)) },
    { label: 'Rename',     icon: 'pencil', onClick: () => setRenaming(f.id) },
    { label: 'Quick Look', icon: 'eye', shortcut: '⌘Y', disabled: f.kind === 'folder', onClick: () => setQuickLook(f) },
    { sep: true },
    { label: 'Share…', icon: 'square.and.arrow.up', onClick: () => { play('open'); airDrop() } },
    { sep: true },
    { tags: TAGS, selected: f.tags, onToggle: (t) => toggleTag(f.id, t) },
  ]

  const desktopMenu = (x, y) => [
    { label: 'New Folder', icon: 'folder.badge.plus', shortcut: '⇧⌘N', onClick: () => {
      const id = newFolder(Math.round(x - 44), Math.round(y - 36))
      setSelectedIcon(id)
      setRenaming(id)
    } },
    { sep: true },
    { label: 'Get Info', icon: 'info.circle', shortcut: '⌘I', onClick: () => setInfo({
      name: 'Desktop', kind: 'folder', icon: folderIconUrl,
      size: `${desktopItems.length} item${desktopItems.length === 1 ? '' : 's'}`,
      where: 'Macintosh HD ▸ Users ▸ ferdous', created: SHIPPED_AT, modified: Date.now(), tags: [],
    }) },
    { label: 'Change Wallpaper…', icon: 'photo', onClick: () => openSettingsAt('wallpaper') },
    { label: 'Edit Widgets…',     icon: 'square.grid.2x2', onClick: () => toggleNotificationCenter() },
    { sep: true },
    { label: 'Sort By', icon: 'arrow.up.arrow.down', submenu: SORTS.map(([id, label]) => ({
      label, checked: sortBy === id, onClick: () => setSortBy(id),
    })) },
    { label: 'Clean Up', icon: 'rectangle.3.group', disabled: sortBy !== 'none', onClick: cleanUpNow },
  ]

  /* Right-click on the desktop itself — the wallpaper, not a window, the
     dock or an icon, which all have their own menus or none. */
  const onDesktopContextMenu = (e) => {
    if (!e.target.closest?.('[data-desktop-surface]')) return
    e.preventDefault()
    setSelectedIcon(null)
    setMenu({ at: { x: e.clientX, y: e.clientY }, items: desktopMenu(e.clientX, e.clientY) })
  }

  const TOPBAR_H  = 28

  // Center the initial windows on first mount (full viewport, no usable-area offset)
  const centerInitialWindows = () => {
    const { windows, updateSizePosition } = useWindowStore.getState()
    const liveVW = window.innerWidth
    const liveVH = window.innerHeight
    const portfolio = windows.find((w) => w.id === 'portfolio')
    if (portfolio) {
      const x = Math.max(0, Math.round((liveVW - portfolio.size.width) / 2))
      const y = Math.max(0, Math.round((liveVH - portfolio.size.height) / 2))
      updateSizePosition('portfolio', portfolio.size, { x, y })
    }
    const activeTool = windows.find((w) => TOOL_IDS.includes(w.id) && w.isOpen && !w.isMinimized)
    if (activeTool) {
      const offset = activeTool.id === 'color-contrast' ? 110 : 0
      const x = Math.max(0, Math.round((liveVW - activeTool.size.width) / 2) - offset)
      const y = Math.max(0, Math.round((liveVH - activeTool.size.height) / 2) - offset)
      updateSizePosition(activeTool.id, activeTool.size, { x, y })
    }
    for (const id of ['notes', 'shop']) {
      const win = windows.find((w) => w.id === id)
      if (win) {
        const x = Math.max(0, Math.round((liveVW - win.size.width) / 2))
        const y = Math.max(0, Math.round((liveVH - win.size.height) / 2))
        updateSizePosition(id, win.size, { x, y })
      }
    }
  }

  // On mount: center initial windows
  useEffect(() => {
    centerInitialWindows()
  }, [])

  /* When the screen changes size — Fit to Screen, leaving it, or the browser
     window being resized — windows stay exactly where you put them, as they
     do on a Mac when a display changes. The only corrections are the ones
     macOS makes: a window that would now hang off the screen is pulled back
     in (and shrunk if it no longer fits), and a zoomed window is re-fitted
     to fill the new screen. Nothing is re-centred. */
  const keepWindowsOnScreen = () => {
    const { windows, updateSizePosition } = useWindowStore.getState()
    const vw = window.innerWidth, vh = window.innerHeight
    for (const w of windows) {
      if (!w.isOpen || w.isMinimized) continue
      if (w.isMaximized) {
        updateSizePosition(w.id, { width: vw, height: vh }, { x: 0, y: 0 })
        continue
      }
      const width  = Math.min(w.size.width,  vw - 16)
      const height = Math.min(w.size.height, vh - TOPBAR_H - 16)
      const x = Math.min(Math.max(w.position.x, 0), vw - width)
      const y = Math.min(Math.max(w.position.y, TOPBAR_H), vh - height)
      if (x !== w.position.x || y !== w.position.y || width !== w.size.width || height !== w.size.height) {
        updateSizePosition(w.id, { width, height }, { x, y })
      }
    }
  }

  useEffect(() => {
    let t
    const handler = () => { clearTimeout(t); t = setTimeout(keepWindowsOnScreen, 150) }
    document.addEventListener('fullscreenchange', handler)
    window.addEventListener('resize', handler)
    return () => {
      clearTimeout(t)
      document.removeEventListener('fullscreenchange', handler)
      window.removeEventListener('resize', handler)
    }
  }, [])

  // On mount: open a project directly if the URL hash is #project/<slug>
  useEffect(() => {
    const match = window.location.hash.match(/^#project\/(.+)$/)
    if (match) {
      const project = allProjects.find((p) => p.slug === match[1])
      if (project) openProjectPreview(project)
    }
  }, [])

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  // Open the right window when a menu item is selected
  useEffect(() => {
    if (!activePage) return
    play('open')
    /* Going somewhere opens that app on top of whatever is already open —
       a Mac never closes your other windows because you launched one. */
    if (activePage === 'tools') switchTool('color-contrast')
    else openWindow(activePage)
  }, [activePage, navKey, openWindow, closeAllExcept, switchTool, play])

  // Keyboard shortcuts: Shift + H / A / P / S / N
  useEffect(() => {
    const map = { H: 'home', P: 'portfolio', S: 'shop', N: 'notes' }
    const handler = (e) => {
      if (e.shiftKey && map[e.key]) { e.preventDefault(); navigate(map[e.key]) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Intercept all mailto: link clicks — open the in-app mail window instead
  useEffect(() => {
    const handler = (e) => {
      const link = e.target.closest('a[href^="mailto:"]')
      if (!link) return
      e.preventDefault()
      const to = link.href.replace('mailto:', '')
      openMailWindow(to)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [openMailWindow])

  /* F4 raises Launchpad, as on a Mac keyboard. Same caveat as Mission
     Control's F3: macOS itself usually claims the key, so the menu bar
     carries the reliable entry point. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'F4') { e.preventDefault(); toggleLaunchpad() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleLaunchpad])

  /* ⌘/ lists every shortcut. Unlike ⌘W and friends the browser lets this one
     through, which is half the reason it is the conventional key for it.
     ⌃/ is here for anyone on a PC keyboard, and ⌘? — what ⌘⇧/ actually
     produces — because that is what you get if you reach for the question
     mark rather than the slash. */
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.key !== '/' && e.key !== '?') return
      e.preventDefault()
      toggleShortcuts()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleShortcuts])

  /* Space previews the selected desktop file — Quick Look's own shortcut.
     Guarded on the focused element: the Terminal, Spotlight and every search
     field need their spaces, and stealing the key from a text box would be
     far more annoying than the feature is useful. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space' || e.metaKey || e.ctrlKey || e.altKey) return
      const el = document.activeElement
      const typing = el && (
        el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
      )
      if (typing) return
      if (quickLook) return            // QuickLook owns the key while it is up
      if (!selectedIcon) return
      const file = itemsRef.current.find((f) => f.id === selectedIcon && f.kind !== 'folder')
      if (!file) return
      e.preventDefault()
      setQuickLook(file)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedIcon, quickLook])

  /* Return on a selected icon renames it, as it does in Finder. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Enter' || !selectedIcon || renaming || quickLook) return
      const el = document.activeElement
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
      if (!itemsRef.current.some((f) => f.id === selectedIcon)) return
      e.preventDefault()
      setRenaming(selectedIcon)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedIcon, renaming, quickLook])

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'var(--bg)' }} onClick={() => setSelectedIcon(null)} onContextMenu={onDesktopContextMenu}>

      {/* Filters every Liquid Glass surface references */}
      <GlassDefs />

      {/* First-time visitor welcome */}
      <WelcomeModal />

      {/* Top menu bar */}
      <TopBar />

      {/* Animated background */}
      <Background />

      {/* Desktop icons — toggleable via Settings. A file in the Trash is not
          on the desktop, so the list filters itself against it; Put Back in
          the Trash window is what brings the icon back. */}
      {/* Widgets sit on the wallpaper, under the icons and the windows. */}
      {showDesktopWidgets && <DesktopWidgets />}

      {showDesktopIcons && (
        <>
          {desktopItems.map((file, i) => (
            <DesktopIcon
              /* The layout counter is in the key: Sort By and Clean Up seat
                 every icon afresh rather than animating dragged ones home. */
              key={`${file.id}:${layout}:${sortBy === 'none' ? '' : i}`}
              file={file}
              initialX={placeOf(file, i).x}
              initialY={placeOf(file, i).y}
              onOpen={() => openItem(file)}
              onMenu={(e) => setMenu({ at: { x: e.clientX, y: e.clientY }, items: fileMenu(file) })}
              renaming={renaming === file.id}
              onRenamed={(name) => { if (name && name !== file.name) rename(file.id, name); setRenaming(null) }}
              selected={selectedIcon === file.id}
              onSelect={() => setSelectedIcon(file.id)}
              onTrash={(item) => { play('trash'); trashFile(item) }}
              /* Dropped on AirDrop: nothing is really sent, so the file stays
                 put — the point is the handshake it opens. */
              onAirDrop={() => { play('open'); airDrop() }}
            />
          ))}
        </>
      )}

      {/* Windows layer — z-index lifts to 9999 when any window is maximized */}
      <div
        className="absolute inset-0"
        /* Hidden, not unmounted, while Mission Control is up: the tiles are
           clones of these nodes and unmounting would pull them out from
           under the exit animation. */
        style={{
          zIndex: isAnyMaximized ? 9999 : 20,
          pointerEvents: 'none',
          opacity: missionControl || launchpad ? 0 : 1,
        }}
      >
        <AnimatePresence>
          <ContactsWindow />
          <PacmanWindow />
          <DocWindow id="bio" />
          <DocWindow id="skills" />
          <DocWindow id="contact" />
          <WorkWindow />
          <ShopWindow />
          <NotesWindow />
          {TOOL_IDS.map((toolId) => (
            <ToolWindow key={toolId} toolId={toolId} />
          ))}
          <HomeWindow />
          <MusicWindow />
          <FinderWindow />
          <TerminalWindow />
          <SettingsWindow />
          <MailWindow />
          <CalculatorWindow />
          <AboutMacWindow />
          <PhotoBoothWindow />
          <WhatsNewWindow />
          {/* A project opened from Portfolio, Finder or Mikuda — a Preview window. */}
          <PreviewWindow />
          {chessOpen && <Suspense key="chess" fallback={null}><ChessWindow /></Suspense>}
        </AnimatePresence>
      </div>

      <MissionControl />

      <QuickLook file={quickLook} onClose={() => setQuickLook(null)} />

      {/* The desktop's right-click menus, and the Get Info window they open. */}
      <ContextMenu at={menu?.at} items={menu?.items ?? []} onClose={() => setMenu(null)} />
      <AnimatePresence>
        {info && <GetInfo key={info.name} item={info} onClose={() => setInfo(null)} />}
      </AnimatePresence>

      <Launchpad open={launchpad} onClose={closeLaunchpad} />
      <TimeMachine />

      <ShortcutsOverlay />

      <PowerOverlay />

      <ScreenSaver />

      <StageManager />

      <NotificationCenter />

      <AirDropSheet />

      <LockScreen />

      {/* Menu window */}
      <MenuWindow
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeId={activePage}
        onNavigate={setActivePage}
        menuRef={menuRef}
      />

      {/* Translucent copy of a file being dragged out of a window */}
      <DragGhost />

      {/* Dock — tools dock on all pages */}
      <ToolsPageDock
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
        onNavigate={setActivePage}
      />

    </div>
  )
}
