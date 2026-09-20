import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import mikdadHeadUrl   from '@/assets/icons/mikdad-head.svg?url'
import finderIconUrl   from '@/assets/icons/finder.svg?url'
import terminalIconUrl from '@/assets/icons/terminal.svg?url'
import settingsIconUrl from '@/assets/icons/mac-system-settings.svg?url'
import homeIconUrl       from '@/assets/icons/Home.png?url'
import portfolioIconUrl  from '@/assets/icons/Folder.png?url'
import notesIconUrl      from '@/assets/icons/note.png?url'
import shopIconUrl       from '@/assets/icons/App Store.png?url'
import trashEmptyUrl     from '@/assets/icons/trash-empty.svg?url'
import trashFullUrl      from '@/assets/icons/trash-full.svg?url'
import trashEmptyDarkUrl from '@/assets/icons/trash-empty-dark.svg?url'
import trashFullDarkUrl  from '@/assets/icons/trash-full-dark.svg?url'
import useWindowStore, { TOOL_IDS } from '@/store/windowStore'
import useSound from '@/hooks/useSound'
import TOOLS from '@/data/tools'
import Tip from '@/components/ui/Tip'
import { genieStage, afterMount } from '@/utils/genie'
import WindowThumb, { thumbWidth } from './WindowThumb'
import { clearSnapshot, getSnapshot } from '@/utils/windowSnapshots'
import GlassLayers from '@/components/ui/LiquidGlass'
import useThemeStore from '@/store/themeStore'
import useTrashStore, { trashedFrom } from '@/store/trashStore'
import useDragStore from '@/store/dragStore'
import ContextMenu from '@/components/ui/ContextMenu'
import MacAlert from '@/components/ui/MacAlert'


/* ── Plateless icon art ────────────────────────────────────────────────────
   The icon SVGs ship with a glass tile baked into the artwork (a rounded rect
   plus a hairline stroke, wrapped in a `data-figma-bg-blur-radius` group).
   macOS draws no such box — dock icons are full-bleed art — so in the dock
   the plate is switched off and the viewBox is tightened onto the art, which
   measures ~22 units centred in a 36 unit canvas across every icon. The asset
   files are untouched; desktop icons and the tray still render them as-is.  */
const ICON_SRC = import.meta.glob('/src/assets/icons/*.svg', {
  query: '?raw', import: 'default', eager: true,
})

// Tool ids that do not match their icon filename
const FILE_ALIAS = { 'qr-code': 'qrcode' }

// Art that overflows the 36-unit canvas needs its own framing
const VIEWBOX = { 'image-converter': '2 5 34 34' }
const DEFAULT_VIEWBOX = '5 5 26 26'

const HIDE_PLATE = '<style>foreignObject,[data-figma-bg-blur-radius]{display:none}</style>'

function platelessArt(name) {
  const src = ICON_SRC[`/src/assets/icons/${name}.svg`]
  if (!src) return null
  return src.replace(/<svg([^>]*)>/, (_, attrs) => {
    const tidied = attrs
      .replace(/\s(?:width|height)="[^"]*"/g, '')
      .replace(/viewBox="[^"]*"/, `viewBox="${VIEWBOX[name] ?? DEFAULT_VIEWBOX}"`)
    return `<svg${tidied}>${HIDE_PLATE}`
  })
}

/* ── Geometry ──────────────────────────────────────────────────────────────
   Proportions taken from the macOS Tahoe dock: the slab is ~1.42× the tile,
   tiles rest on a common baseline with equal air above and below, and the
   corner radius is ~0.44× the slab height.                                  */
/* Measured off a real Tahoe dock: the slab is 1.40x the tile, the corner
   gap between tiles is ~0.10x the tile. The corner is rounder than the 0.20x
   measured off the reference, by preference — still short of the 0.5x that
   would make it a capsule.                                                   */
const TILE      = 40
const DOCK_H    = 56
const DOCK_PAD  = (DOCK_H - TILE) / 2    // 8 — air above/below the baseline
const GAP       = 5
const PAD_X     = 9
const SEP_W     = 12
const RADIUS    = Math.round(DOCK_H * 0.32)
const DOT       = 4

/* Magnification — matches this Mac's Dock prefs (largesize 60 / tilesize 38) */
const MAX_SCALE = 1.58
const MAG_RANGE = TILE * 2.6

const EASE_OUT   = 'cubic-bezier(0.22, 1, 0.36, 1)'
const POP_SPRING = { type: 'spring', stiffness: 420, damping: 30 }
const DOT_SPRING = { type: 'spring', stiffness: 520, damping: 30 }

const PAGE_NAV = [
  { id: 'home',      label: 'Home',      icon: homeIconUrl },
  { id: 'portfolio', label: 'Portfolio', icon: portfolioIconUrl },
  { id: 'notes',     label: 'Notes',     icon: notesIconUrl },
  { id: 'shop',      label: 'Store',     icon: shopIconUrl },
]

// Tools always visible in the dock
const PINNED_TOOL_IDS = ['color-contrast', 'color-palette', 'retro-dot', 'qr-code']

/* Raised-cosine bell: 1 at the cursor, easing to exactly 1 at the edge of the
   range with zero slope, so neighbouring tiles never kink. */
function magnify(distance) {
  if (distance >= MAG_RANGE) return 1
  const bell = 0.5 * (1 + Math.cos(Math.PI * (distance / MAG_RANGE)))
  return 1 + bell * (MAX_SCALE - 1)
}

export default function ToolsPageDock({ menuOpen, onMenuToggle, onNavigate }) {
  const play = useSound()
  const [mouseX,    setMouseX]    = useState(null)
  const [bouncing,  setBouncing]  = useState(null)
  /* Mirrors `bouncing` for the watcher below, which must not depend on it. */
  const bouncingRef = useRef(null)
  const rowRef   = useRef(null)
  const sheenRef = useRef(null)
  const slabRef  = useRef(null)

  const { windows, openTool, openWindow, closeWindow, minimizeWindow, closeAllExcept, activePage, setRestoring, openFinderAt } = useWindowStore()
  const isDark = useThemeStore((s) => s.isDark)

  /* ── Trash ──────────────────────────────────────────────────────────────
     The basket is a real folder: it has contents, so it has two icons, a
     context menu and a drop target. */
  const trashItems  = useTrashStore((s) => s.items)
  const emptyTrash  = useTrashStore((s) => s.emptyTrash)
  const trashFull   = trashItems.length > 0
  const dragging    = useDragStore((s) => s.payload)
  const overTrash   = useDragStore((s) => s.overTrash)
  const [trashMenu,  setTrashMenu]  = useState(null)   // { x, y, immediate }
  /* Right-click on an app tile. Same anchoring as the basket's menu — rising
     out of the icon — but the items depend on what the app is doing. */
  const [appMenu,    setAppMenu]    = useState(null)   // { x, y, winId, label }
  const [confirmEmpty, setConfirmEmpty] = useState(false)

  const trashIcon = trashFull
    ? (isDark ? trashFullDarkUrl  : trashFullUrl)
    : (isDark ? trashEmptyDarkUrl : trashEmptyUrl)

  const doEmptyTrash = () => { play('emptyTrash'); emptyTrash(); setConfirmEmpty(false) }

  // Apps whose icon is sitting in the Trash are gone from the dock until
  // someone puts them back.
  const trashedApps = trashedFrom(trashItems, 'finder')

  const minimized  = windows.filter((w) => w.isMinimized)
  const activeTool = windows.find(
    (w) => TOOL_IDS.includes(w.id) && w.isOpen && !w.isMinimized
  )?.id ?? null

  const isLive = (id) => {
    const win = windows.find((w) => w.id === id)
    return Boolean(win?.isOpen && !win?.isMinimized)
  }

  // Pinned tools always shown; any other open tool appears dynamically
  const dockTools = [
    ...TOOLS.filter((t) => PINNED_TOOL_IDS.includes(t.id)),
    ...TOOLS.filter((t) => !PINNED_TOOL_IDS.includes(t.id) && windows.some((w) => w.id === t.id && (w.isOpen || w.isMinimized))),
  ].filter((t) => !trashedApps.has(t.id))

  /* Grow the window back out of its dock tile, then hand it to the store.

     The window is opened first and held invisible: only the mounted window
     knows where it is going to land — the store re-centres some of them — and
     the warp has to end on that exact rectangle or it lands with a jump. The
     stage is cut before any of that, while the tile is still standing, so the
     cost of building it never lands on the animation's first frame. */
  const restoreWindow = (id) => {
    play('open')

    const slotEl = document.querySelector(`[data-min-slot="${id}"]`)
    const snap   = getSnapshot(id)
    const win    = windows.find((w) => w.id === id)
    if (!slotEl || !snap || !win) { openWindow(id); clearSnapshot(id); return }

    // Measured now — the tile is gone the moment the window stops being minimised
    const slot = slotEl.getBoundingClientRect()

    let stage = genieStage(snap.node, snap.size.width, snap.size.height)
    stage.place({ left: win.position.x, top: win.position.y }, slot)
    stage.draw(1)

    setRestoring(id)
    openWindow(id)

    afterMount(`[data-window="${id}"]`).then((el) => {
      const done = () => { stage.destroy(); setRestoring(null); clearSnapshot(id) }
      if (!el) { done(); return }

      const r = el.getBoundingClientRect()
      // A few windows are handed back at a size they were not minimised at,
      // and the bands are cut for one size, so those start over.
      if (Math.abs(r.width - stage.width) > 1 || Math.abs(r.height - stage.height) > 1) {
        stage.destroy()
        stage = genieStage(snap.node, r.width, r.height)
      }
      stage.place(r, slot)
      stage.run(760, 1, 0).then(done)
    })
  }

  /* How long the icon hops before the window shows up. On a Mac the bounce
     *is* the launch — the window arrives when the app is ready, not the
     instant you click — so opening immediately and bouncing afterwards had
     the two playing over each other.

     590ms is the first hop's landing: 0.07s delay + 0.55 of a 0.95s curve.
     The window arrives exactly as the icon hits the floor. */
  const LAUNCH_DELAY = 590

  /** Bounce now, run `open` a beat later. Already-running apps skip both:
      macOS does not bounce when you click an app that is already up. */
  const launch = (bounceId, open, alreadyRunning) => {
    if (alreadyRunning) { open(); return }
    play('open')
    setBouncing(bounceId)
    bouncingRef.current = bounceId
    setTimeout(open, LAUNCH_DELAY)
    // Clear once the curve itself is done — measured from the click, not
    // from the window opening.
    setTimeout(() => {
      setBouncing(null)
      bouncingRef.current = null
    }, 1100)
  }

  const openApp = (id) => {
    if (!activePage) closeAllExcept(['finder', 'terminal', 'settings'])
    launch(id, () => openWindow(id), isLive(id))
  }

  /* ── One flat list so magnification, tooltips and dots share a code path ── */
  const items = useMemo(() => {
    const list = [
      {
        id: '__avatar__', label: 'Mikdad', icon: mikdadHeadUrl,
        onClick: () => { play('open'); onNavigate?.('home') },
        inset: 0.10,
      },
      ...PAGE_NAV.map((page) => ({
        id: `__page_${page.id}__`, label: page.label, icon: page.icon, winId: page.id,
        onClick: () => launch(page.id, () => onNavigate?.(page.id), activePage === page.id),
        active: activePage === page.id,
        glyph: page.glyph,
      })),
      {
        id: 'finder', label: 'Finder', icon: finderIconUrl, file: 'finder', winId: 'finder',
        onClick: () => openApp('finder'), active: isLive('finder'),
      },
      {
        id: 'terminal', label: 'Terminal', icon: terminalIconUrl, file: 'terminal', winId: 'terminal',
        onClick: () => openApp('terminal'), active: isLive('terminal'),
      },
      /* No `file`: the settings art is a full-colour app icon with no baked
         glass plate, so it goes in as-is rather than through platelessArt. */
      {
        id: 'settings', label: 'System Settings', icon: settingsIconUrl, winId: 'settings',
        onClick: () => openApp('settings'), active: isLive('settings'),
      },
      ...dockTools.map((tool) => ({
        id: tool.id, label: tool.name, icon: tool.icon, file: FILE_ALIAS[tool.id] ?? tool.id, winId: tool.id,
        onClick: () => launch(tool.id, () => openTool(tool.id), activeTool === tool.id),
        active: activeTool === tool.id,
        dim: tool.url === null,
        dynamic: !PINNED_TOOL_IDS.includes(tool.id),
      })),
      { id: '__sep__', sep: true },
      /* Minimised windows sit between the divider and the trash, each on its
         own tile — the slot the window shrinks into and grows back out of. */
      ...minimized.map((win) => {
        const aspect = (win.size?.width ?? TILE) / (win.size?.height ?? TILE)
        return {
          id: `__min_${win.id}__`,
          label: win.title,
          minOf: win.id,
          winId: win.id,
          thumb: true,
          w: thumbWidth(aspect, TILE),
          onClick: () => restoreWindow(win.id),
        }
      }),
      {
        /* Last in the row, after the divider, and never a running dot: the
           Trash is a folder, not an app, so it has nothing to indicate. */
        id: '__trash__', label: 'Trash', icon: trashIcon, trash: true,
        onClick: () => { play('open'); openFinderAt('trash') },
      },
    ]
    // Rest-space centre of every entry, used for the magnification distance
    let x = 0
    return list.map((it) => {
      const w = it.sep ? SEP_W : (it.w ?? TILE)
      const entry = { ...it, w, center: x + w / 2 }
      x += w + GAP
      return entry
    })
  }, [activePage, activeTool, windows, minimized.length, isDark, trashIcon, dockTools.map((t) => t.id).join()])

  const restWidth = items.reduce((sum, it) => sum + it.w, 0) + GAP * (items.length - 1)

  /* Measure against the row's fixed centre, not its left edge: the row grows
     symmetrically while magnified, so a left-edge origin feeds back on itself. */
  const onMouseMove = (e) => {
    const rect = rowRef.current?.getBoundingClientRect()
    if (!rect) return
    const centreX = rect.left + rect.width / 2
    setMouseX(e.clientX - centreX + restWidth / 2)
    if (sheenRef.current) {
      const dock = sheenRef.current.parentElement.getBoundingClientRect()
      sheenRef.current.style.setProperty('--sheen-x', `${((e.clientX - dock.left) / dock.width) * 100}%`)
    }
  }
  const onMouseLeave = () => setMouseX(null)

  /* A minimised tile is the window's own slot and is mid-genie when it
     appears, so it never bounces — only the app tile does. */
  const isBouncing = (item) =>
    bouncing != null && !item.minOf && (bouncing === item.id || bouncing === item.winId)

  /* Launch bounce — a tile hops once when its window first opens.

     Coming back from minimised is not a launch: macOS does not bounce for
     it, and the genie already says what happened. So a window that was in
     the minimised set last tick is excluded. */
  const prevOpen = useRef(null)
  const prevMin  = useRef(new Set())
  useEffect(() => {
    const open = new Set(windows.filter((w) => w.isOpen && !w.isMinimized).map((w) => w.id))
    const min  = new Set(windows.filter((w) => w.isMinimized).map((w) => w.id))
    if (prevOpen.current) {
      const launched = [...open].find(
        (id) => !prevOpen.current.has(id) && !prevMin.current.has(id),
      )
      /* A dock click has already started this one and timed the window to
         land mid-hop; restarting it here would snap the icon back to the
         floor exactly as the window appears. Launches from anywhere else —
         the menu bar, Spotlight, the Terminal — still bounce from here. */
      if (launched && launched !== bouncingRef.current) {
        setBouncing(launched)
        bouncingRef.current = launched
        // Must outlast the animation (1.15s + 0.07s delay) or the tile is
        // yanked back to rest mid-hop.
        const tid = setTimeout(() => {
          setBouncing(null)
          bouncingRef.current = null
        }, 1100)
        prevOpen.current = open
        prevMin.current  = min
        return () => clearTimeout(tid)
      }
    }
    prevOpen.current = open
    prevMin.current  = min
  }, [windows])

  const sizing = mouseX === null
    ? `width 260ms ${EASE_OUT}, height 260ms ${EASE_OUT}`
    : 'none'

  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      exit={{    scaleX: 0, opacity: 0 }}
      transition={POP_SPRING}
      style={{
        position:        'absolute',
        bottom:           20,
        left:            '50%',
        x:               '-50%',
        zIndex:           45,
        transformOrigin: 'center center',
      }}
    >
      <div
        ref={slabRef}
        className="dock-tahoe"
        data-hovered={mouseX !== null}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{
          '--dock-radius': `${RADIUS}px`,
          display:      'flex',
          alignItems:   'flex-end',
          height:        DOCK_H,
          padding:      `0 ${PAD_X}px`,
          overflow:     'visible',
        }}
      >
        {/* The glass itself is clipped to the capsule, but the icon row is not,
            so magnified tiles can still rise above the bar. */}
        <GlassLayers>
          <div ref={sheenRef} className="dock-tahoe__sheen" data-on={mouseX !== null} />
        </GlassLayers>

        <div
          ref={rowRef}
          style={{
            display:       'flex',
            alignItems:    'flex-end',
            gap:            GAP,
            paddingBottom:  DOCK_PAD,
            position:      'relative',
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((item) => {
              if (item.sep) {
                return (
                  <div key={item.id} style={{ width: SEP_W, height: TILE, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="dock-tahoe__sep" style={{ height: TILE * 0.62 }} />
                  </div>
                )
              }

              const scale = mouseX === null ? 1 : magnify(Math.abs(mouseX - item.center))
              const size  = TILE * scale
              const wide  = item.w * scale   // thumbnails are wider than they are tall
              const inset = item.inset ?? 0
              const art   = item.glyph ? 0.44 : 1 - inset * 2
              const art_html = item.file ? platelessArt(item.file) : null
              // A drag is overhead and aimed at the basket
              const dropTarget = item.trash && overTrash

              const tile = (
                <>

                  <Tip
                    label={item.label}
                    placement="top"
                    open={Boolean(item.trash && dragging)}
                    hidden={Boolean((item.trash && trashMenu) || (item.winId && appMenu?.winId === item.winId))}
                  >
                  <motion.button
                    onClick={item.onClick}
                    onContextMenu={item.trash
                      ? (e) => {
                          e.preventDefault()
                          // Dock menus rise out of the icon, centred on it —
                          // they never drop down over the dock itself.
                          const r = e.currentTarget.getBoundingClientRect()
                          setTrashMenu({
                            x: r.left + r.width / 2,
                            y: r.top - 10,
                            placement: 'above',
                            align:     'center',
                            // Option turns Empty Trash into the no-questions
                            // version, the way it does in the real menu.
                            immediate: e.altKey,
                          })
                        }
                      : item.winId
                        ? (e) => {
                            e.preventDefault()
                            const r = e.currentTarget.getBoundingClientRect()
                            setAppMenu({
                              x: r.left + r.width / 2,
                              y: r.top - 10,
                              placement: 'above',
                              align:     'center',
                              winId: item.winId,
                              label: item.label,
                            })
                          }
                        : undefined}
                    aria-label={item.label}
                    data-trash-tile={item.trash ? '' : undefined}
                    data-min-slot={item.minOf}
                    whileTap={{ scale: 0.88 }}
                    /* Match on winId as well as id: the page tiles are keyed
                       `__page_portfolio__` while the launch that triggers the
                       bounce reports the window id `portfolio`, so comparing
                       ids alone left every page tile sitting still. */
                    /* Three hops under gravity. The whole sequence used to run
                       in 0.62s on one easeOut curve, which reads as a twitch
                       rather than a bounce — a real dock hop is about half a
                       second on its own.

                       Each leg gets its own easing: easeOut on the way up so
                       the icon slows into the apex, easeIn on the way down so
                       it accelerates into the floor. A single ease across all
                       six legs is what made it look mechanical. The small
                       delay is the beat between the click and the launch. */
                    /* Two hops, not three. On a Mac the bouncing *is* the
                       launch and stops once the app is up, so a long tail of
                       hops playing after the window is already on screen is
                       the thing that reads as out of sync. The window is
                       timed to land as the icon touches down from the first
                       hop (see LAUNCH_DELAY), leaving one small settling hop.

                       Each leg keeps its own easing: easeOut up into the
                       apex, easeIn down into the floor. */
                    animate={isBouncing(item) ? { y: [0, -24, 0, -8, 0] } : { y: 0 }}
                    transition={isBouncing(item)
                      ? {
                          duration: 0.95,
                          delay: 0.07,
                          times: [0, 0.28, 0.55, 0.78, 1],
                          ease: ['easeOut', 'easeIn', 'easeOut', 'easeIn'],
                        }
                      : { duration: 0.2 }}
                    style={{
                      width:          wide,
                      height:         size,
                      flexShrink:     0,
                      display:       'flex',
                      alignItems:    'center',
                      justifyContent:'center',
                      position:      'relative',
                      background:    'transparent',
                      border:        'none',
                      padding:        0,
                      transition:     sizing,
                      willChange:    'width, height',
                    }}
                  >
                    {/* Drop highlight — macOS lights a well behind the icon
                        while a drag hovers it, so the target is unmistakable
                        before you let go. */}
                    {item.trash && (
                      <span className="dock-tahoe__well" data-on={dropTarget || undefined} />
                    )}

                    {item.thumb ? (
                      <WindowThumb id={item.minOf} width={wide} height={size} />
                    ) : (
                    <>
                    {item.glyph && <span className="dock-tahoe__plate" />}

                    {art_html ? (
                      <span
                        className="dock-tahoe__art"
                        dangerouslySetInnerHTML={{ __html: art_html }}
                      />
                    ) : (
                    <img
                      src={item.icon}
                      alt=""
                      draggable={false}
                      className={item.glyph ? 'dock-tahoe__glyph' : undefined}
                      style={{
                        width:     `${art * 100}%`,
                        height:    `${art * 100}%`,
                        objectFit: 'contain',
                        filter: item.glyph
                          ? undefined
                          : item.dim
                            ? 'grayscale(0.6) opacity(0.45)'
                            : 'drop-shadow(0 1px 2px rgba(0,0,0,0.22))',
                        opacity: item.glyph ? (item.active ? 1 : 0.72) : 1,
                        transform: dropTarget ? 'scale(1.09)' : 'none',
                        transition: 'opacity 0.2s ease, transform 0.14s ease',
                      }}
                    />
                    )}
                    </>
                    )}

                  </motion.button>
                  </Tip>

                  {/* Running indicator — sits inside the slab, below the baseline */}
                  {'active' in item && (
                    <motion.span
                      className="dock-tahoe__dot"
                      animate={{ opacity: item.active ? 1 : 0, scale: item.active ? 1 : 0.2 }}
                      transition={DOT_SPRING}
                      style={{
                        bottom:     -(DOCK_PAD - DOT) / 2 - DOT + 1,
                        width:       DOT,
                        height:      DOT,
                      }}
                    />
                  )}
                </>
              )

              const frame = {
                position:      'relative',
                display:       'flex',
                flexDirection: 'column',
                alignItems:    'center',
                flexShrink:     0,
              }


              if (item.dynamic) {
                return (
                  <motion.div
                    key={item.id}
                    layout="position"
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{    opacity: 0, scale: 0.4 }}
                    transition={POP_SPRING}
                    style={frame}
                  >
                    {tile}
                  </motion.div>
                )
              }

              return <div key={item.id} style={frame}>{tile}</div>
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Right-click the basket: Open, and Empty Trash — dimmed when there is
          nothing in it, which is how macOS tells you so before you look. */}
      <ContextMenu
        at={trashMenu}
        onClose={() => setTrashMenu(null)}
        items={[
          { label: 'Open', onClick: () => { play('open'); openFinderAt('trash') } },
          { sep: true },
          {
            label: trashMenu?.immediate ? 'Empty Trash Immediately' : 'Empty Trash',
            disabled: !trashFull,
            onClick: () => (trashMenu?.immediate ? doEmptyTrash() : setConfirmEmpty(true)),
          },
        ]}
      />

      {/* Right-click an app tile. macOS changes these with what the app is
          doing — a running app offers Hide and Quit, a hidden one offers
          Show, a closed one only Open — so the list is built per state
          rather than being one fixed menu with most of it dimmed. */}
      <ContextMenu
        at={appMenu}
        onClose={() => setAppMenu(null)}
        items={(() => {
          if (!appMenu) return []
          const win = windows.find((w) => w.id === appMenu.winId)
          const isOpen = !!win?.isOpen
          const isMin  = !!win?.isMinimized
          const rows = []

          if (isOpen && isMin) {
            rows.push({ label: 'Show', onClick: () => restoreWindow(appMenu.winId) })
          } else if (isOpen) {
            rows.push({ label: 'Hide', onClick: () => { play('minimize'); minimizeWindow(appMenu.winId) } })
          } else {
            rows.push({ label: 'Open', onClick: () => { play('open'); openWindow(appMenu.winId) } })
          }
          if (isOpen) {
            rows.push({ label: 'Quit', onClick: () => { play('close'); closeWindow(appMenu.winId) } })
          }
          rows.push({ sep: true })
          rows.push({ label: 'Show in Finder', onClick: () => { play('open'); openFinderAt('applications') } })
          return rows
        })()}
      />

      <MacAlert
        open={confirmEmpty}
        icon={trashIcon}
        title="Are you sure you want to permanently erase the items in the Trash?"
        message="You can't undo this action."
        confirmLabel="Empty Trash"
        onConfirm={doEmptyTrash}
        onCancel={() => setConfirmEmpty(false)}
      />
    </motion.div>
  )
}
