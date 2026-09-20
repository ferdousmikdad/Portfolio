import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassLayers from '@/components/ui/LiquidGlass'
import useWindowStore from '@/store/windowStore'
import useThemeStore from '@/store/themeStore'
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

function MenuDropdown({ menu, onClose }) {
  return (
    <motion.div
      className="mb-menu"
      initial={{ opacity: 0, y: -5, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -3, scale: 0.99 }}
      transition={{ duration: 0.11 }}
      role="menu"
    >
      <GlassLayers small />
      {menu.items.map((item, i) =>
        item.sep ? (
          <div className="mb-menu__sep" key={`sep-${i}`} />
        ) : (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            className="mb-menu__item"
            disabled={item.disabled}
            onClick={() => { item.onClick?.(); onClose() }}
          >
            <span className="mb-menu__label">{item.label}</span>
            {item.key && <span className="mb-menu__key">{item.key}</span>}
          </button>
        ),
      )}
    </motion.div>
  )
}

export default function MenuBar({ onOpenSpotlight, onMenuOpen }) {
  const [open, setOpen] = useState(null)      // menu id, or null
  const [isFullscreen, setIsFullscreen] = useState(false)
  const rootRef = useRef(null)

  const {
    activeWindowId, windows, openWindow, navigate,
    closeWindow, minimizeWindow, toggleMaximize, closeAllExcept,
  } = useWindowStore()
  const { isDark, toggleTheme } = useThemeStore()

  // The front window only counts if it is actually on screen.
  const front = windows.find(
    (w) => w.id === activeWindowId && w.isOpen && !w.isMinimized,
  )
  const appName = appNameFor(front?.id)

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // Outside click and Escape both dismiss, as they do on a Mac.
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(null)
    }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(null) }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Let the parent close its own panels when a menu takes over.
  useEffect(() => { if (open) onMenuOpen?.() }, [open, onMenuOpen])

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
  })

  return (
    <div className="mb" ref={rootRef}>
      {menus.map((menu) => (
        <div className="mb__slot" key={menu.id}>
          <button
            type="button"
            className={`mb__title${menu.apple ? ' mb__title--apple' : ''}${menu.bold ? ' mb__title--app' : ''}`}
            data-open={open === menu.id}
            onClick={() => setOpen((v) => (v === menu.id ? null : menu.id))}
            // Hover only switches while a menu is already down — that is how
            // AppKit behaves, and it stops the bar firing on a passing cursor.
            onMouseEnter={() => setOpen((v) => (v ? menu.id : v))}
          >
            {menu.apple
              ? <img src={mikdadHeadUrl} alt="Apple menu" width={16} height={16} />
              : menu.label}
          </button>

          <AnimatePresence>
            {open === menu.id && (
              <MenuDropdown menu={menu} onClose={() => setOpen(null)} />
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
