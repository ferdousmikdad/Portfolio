import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import mikdadHeadUrl   from '@/assets/icons/mikdad-head.svg?url'
import finderIconUrl   from '@/assets/icons/finder.svg?url'
import terminalIconUrl from '@/assets/icons/terminal.svg?url'
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
import { genieIn } from '@/utils/genie'
import WindowThumb, { thumbWidth } from './WindowThumb'
import { clearSnapshot } from '@/utils/windowSnapshots'
import GlassLayers from '@/components/ui/LiquidGlass'
import useThemeStore from '@/store/themeStore'


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
  { id: 'shop',      label: 'Shop',      icon: shopIconUrl },
]

// Tools always visible in the dock
const PINNED_TOOL_IDS = ['color-contrast', 'color-palette', 'retro-dot', 'print-setup']

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
  const rowRef   = useRef(null)
  const sheenRef = useRef(null)
  const slabRef  = useRef(null)

  const { windows, openTool, openWindow, closeAllExcept, activePage } = useWindowStore()
  const isDark = useThemeStore((s) => s.isDark)

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
  ]

  /* Grow the window back out of its dock tile, then hand it to the store. */
  const restoreWindow = (id) => {
    play('open')
    clearSnapshot(id)
    const slot = document.querySelector(`[data-min-slot="${id}"]`)
    const win  = windows.find((w) => w.id === id)
    if (!slot || !win) { openWindow(id); return }

    const s = slot.getBoundingClientRect()
    const ghost = document.createElement('div')
    const { width, height } = win.size
    const { x, y } = win.position
    ghost.className = 'window-shell genie-freeze'
    ghost.style.cssText = [
      'position:fixed', `top:${y}px`, `left:${x}px`,
      `width:${width}px`, `height:${height}px`,
      'margin:0', 'box-sizing:border-box', 'z-index:9998',
      'pointer-events:none', 'transform-origin:50% 50%',
    ].join(';')
    document.body.appendChild(ghost)

    const fx = (s.left + s.width  / 2) - (x + width  / 2)
    const fy = (s.top  + s.height / 2) - (y + height / 2)
    genieIn(ghost, fx, fy, 380).then(() => {
      ghost.remove()
      openWindow(id)
    })
  }

  const openApp = (id) => {
    play('open')
    if (!activePage) closeAllExcept(['finder', 'terminal'])
    openWindow(id)
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
        id: `__page_${page.id}__`, label: page.label, icon: page.icon,
        onClick: () => { play('open'); onNavigate?.(page.id) },
        active: activePage === page.id,
        glyph: page.glyph,
      })),
      {
        id: 'finder', label: 'Finder', icon: finderIconUrl, file: 'finder',
        onClick: () => openApp('finder'), active: isLive('finder'),
      },
      {
        id: 'terminal', label: 'Terminal', icon: terminalIconUrl, file: 'terminal',
        onClick: () => openApp('terminal'), active: isLive('terminal'),
      },
      ...dockTools.map((tool) => ({
        id: tool.id, label: tool.name, icon: tool.icon, file: FILE_ALIAS[tool.id] ?? tool.id,
        onClick: () => { play('open'); openTool(tool.id) },
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
          thumb: true,
          w: thumbWidth(aspect, TILE),
          onClick: () => restoreWindow(win.id),
        }
      }),
      {
        id: '__trash__', label: 'Trash',
        icon: isDark ? trashEmptyDarkUrl : trashEmptyUrl,
        onClick: () => {},
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
  }, [activePage, activeTool, windows, minimized.length, isDark, dockTools.map((t) => t.id).join()])

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

  /* Launch bounce — a tile hops once when its window first opens */
  const prevOpen = useRef(null)
  useEffect(() => {
    const open = new Set(windows.filter((w) => w.isOpen && !w.isMinimized).map((w) => w.id))
    if (prevOpen.current) {
      const launched = [...open].find((id) => !prevOpen.current.has(id))
      if (launched) {
        setBouncing(launched)
        const tid = setTimeout(() => setBouncing(null), 620)
        prevOpen.current = open
        return () => clearTimeout(tid)
      }
    }
    prevOpen.current = open
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

              const tile = (
                <>

                  <Tip label={item.label} placement="top">
                  <motion.button
                    onClick={item.onClick}
                    aria-label={item.label}
                    data-min-slot={item.minOf}
                    whileTap={{ scale: 0.88 }}
                    animate={bouncing === item.id ? { y: [0, -17, 0, -6, 0, -2, 0] } : { y: 0 }}
                    transition={bouncing === item.id
                      ? { duration: 0.62, times: [0, 0.22, 0.44, 0.62, 0.8, 0.9, 1], ease: 'easeOut' }
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
                        transition: 'opacity 0.2s ease',
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
    </motion.div>
  )
}
