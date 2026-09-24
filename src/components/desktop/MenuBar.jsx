import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Panel } from '@/components/ui/ContextMenu'
import ForceQuit from '@/components/desktop/ForceQuit'
import windowIcon from '@/data/windowIcons'
import DESKTOP_FILES from '@/data/desktopFiles'
import useDesktopStore from '@/store/desktopStore'
import { motion, AnimatePresence } from 'framer-motion'
import useWindowStore from '@/store/windowStore'
import useThemeStore from '@/store/themeStore'
import useUpdateStore from '@/store/updateStore'
import MacAlert from '@/components/ui/MacAlert'
import { buildMenus, appNameFor } from '@/data/menuBar'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'

/* ── Menu bar ──────────────────────────────────────────────────────────────
   The left half of the top bar: the Apple menu, then the front-most app's
   name in semibold, then its menus. The set is rebuilt from whichever window
   has focus, which is the whole point — a static File/Edit row would be
   wallpaper, not a menu bar.

   Two behaviours make it feel real rather than like a row of dropdowns:
   once any menu is open, *hovering* a sibling switches to it without a
   click; and the open title stays highlighted while its menu is down.    */

/* A title's menu: the same Tahoe panel the right-click menus use, hung
   from the title's bottom-left corner. Portalled to <body> — inside the
   bar its glass would sample the bar, not the desktop behind it. */
function MenuDropdown({ menu, anchor, onClose }) {
  const r = anchor?.getBoundingClientRect()
  if (!r) return null
  return createPortal(
    <Panel
      className="mac-menu--bar"
      items={menu.items}
      at={{ x: Math.round(r.left), y: Math.round(r.bottom + 3) }}
      onClose={onClose}
    />,
    document.body,
  )
}

export default function MenuBar({ onOpenSpotlight, onMenuOpen }) {
  const [open, setOpen] = useState(null)      // menu id, or null
  const [confirm, setConfirm] = useState(null)   // 'restart' | 'shutdown' | 'logout'
  const [forceQuitOpen, setForceQuitOpen] = useState(false)
  /* Option held: the Apple menu shows its alternates while it is. */
  const [option, setOption] = useState(false)
  /* Recent Items: what was opened this session, newest first. */
  const recent      = useDesktopStore((s) => s.recent)
  const pushRecent  = useDesktopStore((s) => s.pushRecent)
  const clearRecent = useDesktopStore((s) => s.clearRecent)
  const titleRefs = useRef({})
  const [isFullscreen, setIsFullscreen] = useState(false)
  const rootRef = useRef(null)
  /* Which menu the *pointer* opened. Without this, moving onto a sibling
     while a menu is down hover-opens it and the click that follows reads as
     "already open → close", so clicking a neighbouring title shut the bar
     instead of switching to it. */
  const hoverOpened = useRef(null)

  const {
    activeWindowId, windows, openWindow, navigate,
    closeWindow, minimizeWindow, toggleMaximize, closeAllExcept,
    toggleMissionControl, toggleLaunchpad, lock, openSettingsAt,
    openShortcuts, sleep, restart, shutDown, logOut,
  } = useWindowStore()
  const { isDark, toggleTheme } = useThemeStore()
  const updatePending = useUpdateStore((s) => s.stage !== 'installed')

  // The front window only counts if it is actually on screen.
  const front = windows.find(
    (w) => w.id === activeWindowId && w.isOpen && !w.isMinimized,
  )
  const appName = appNameFor(front?.id)

  /* Every window that comes to the front is remembered once, apps apart
     from documents (the desktop's .txt files open as TextEdit windows). */
  useEffect(() => {
    if (!front) return
    const file = DESKTOP_FILES.find((d) => d.windowId === front.id)
    const entry = file
      ? { id: front.id, name: file.name, icon: file.icon, doc: true }
      : { id: front.id, name: appNameFor(front.id), icon: windowIcon(front.id), doc: false }
    pushRecent(entry)
  }, [front?.id])

  useEffect(() => {
    if (!open) { setOption(false); return }
    const onKey = (e) => setOption(e.altKey)
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey) }
  }, [open])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // Outside click and Escape both dismiss, as they do on a Mac.
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      // The menus are portalled out of the bar, so a press inside one is
      // not outside the menu bar.
      if (rootRef.current && !rootRef.current.contains(e.target) && !e.target.closest?.('.mac-menu')) {
        hoverOpened.current = null
        setOpen(null)
      }
    }
    const onKey = (e) => { if (e.key === 'Escape') { hoverOpened.current = null; setOpen(null) } }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  /* Let the parent close its own panels when a menu takes over.

     The callback is held in a ref rather than listed as a dependency. TopBar
     passes a fresh arrow on every render, so depending on it meant: effect
     fires → parent setState → parent re-renders → new arrow → effect fires
     again, which React eventually stops with "Maximum update depth
     exceeded" and unmounts the whole menu bar. Same shape as the
     ContextMenu Escape bug. */
  const onMenuOpenRef = useRef(onMenuOpen)
  useEffect(() => { onMenuOpenRef.current = onMenuOpen })
  useEffect(() => { if (open) onMenuOpenRef.current?.() }, [open])

  const menus = buildMenus({
    appName,
    hasWindow: !!front,
    isFullscreen,
    isDark,
    openWindow,
    navigate,
    closeActive:    () => front && closeWindow(front.id),
    minimizeActive: () => front && minimizeWindow(front.id),
    zoomActive:     () => front && toggleMaximize(front.id),
    closeAll:       () => closeAllExcept([]),
    toggleFullscreen: () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.()
      else document.exitFullscreen?.()
    },
    toggleTheme,
    openSpotlight: () => onOpenSpotlight?.(),
    missionControl: toggleMissionControl,
    launchpad: toggleLaunchpad,
    lock,
    openSettingsAt,
    updatePending,
    shortcuts: openShortcuts,
    sleep,
    restart:  (ask) => (ask ? setConfirm('restart')  : restart()),
    shutDown: (ask) => (ask ? setConfirm('shutdown') : shutDown()),
    logOut:   (ask) => (ask ? setConfirm('logout')   : logOut()),
    option,
    recent,
    clearRecent,
    forceQuit: () => setForceQuitOpen(true),
    forceQuitFront: () => front && closeWindow(front.id),
    userName: 'Ferdous Mikdad',
  })

  return (
    <div className="mb" ref={rootRef}>
      {menus.map((menu) => (
        <div className="mb__slot" key={menu.id}>
          <button
            ref={(el) => { titleRefs.current[menu.id] = el }}
            type="button"
            className={`mb__title${menu.apple ? ' mb__title--apple' : ''}${menu.bold ? ' mb__title--app' : ''}`}
            data-open={open === menu.id}
            onClick={() => {
              // A hover-switch already put this menu up; the click that
              // completes the gesture should leave it up, not toggle it off.
              if (hoverOpened.current === menu.id) { hoverOpened.current = null; return }
              hoverOpened.current = null
              setOpen((v) => (v === menu.id ? null : menu.id))
            }}
            // Hover only switches while a menu is already down — that is how
            // AppKit behaves, and it stops the bar firing on a passing cursor.
            onMouseEnter={() => setOpen((v) => {
              if (!v || v === menu.id) return v
              hoverOpened.current = menu.id
              return menu.id
            })}
          >
            {menu.apple
              ? <img src={mikdadHeadUrl} alt="Apple menu" width={16} height={16} />
              : menu.label}
          </button>

          <AnimatePresence>
            {open === menu.id && (
              <MenuDropdown key={menu.id} menu={menu} anchor={titleRefs.current[menu.id]} onClose={() => setOpen(null)} />
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* What the ellipses promise. Wording lifted from the real panels,
          which ask the question and then say what will happen by itself. */}
      <MacAlert
        open={!!confirm}
        icon={mikdadHeadUrl}
        title={{
          restart:  'Are you sure you want to restart your computer now?',
          shutdown: 'Are you sure you want to shut down your computer now?',
          logout:   'Are you sure you want to quit all applications and log out now?',
        }[confirm] ?? ''}
        message={{
          restart:  'Open windows will be closed. Nothing is saved anywhere, so nothing is lost.',
          shutdown: 'Open windows will be closed. Press any key to turn it back on.',
          logout:   'Every window will be closed and you will be returned to the login screen.',
        }[confirm] ?? ''}
        confirmLabel={{ restart: 'Restart', shutdown: 'Shut Down', logout: 'Log Out' }[confirm] ?? 'OK'}
        onConfirm={() => {
          const which = confirm
          setConfirm(null)
          if (which === 'restart')  restart()
          if (which === 'shutdown') shutDown()
          if (which === 'logout')   logOut()
        }}
        onCancel={() => setConfirm(null)}
      />

      <AnimatePresence>
        {forceQuitOpen && <ForceQuit onClose={() => setForceQuitOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
