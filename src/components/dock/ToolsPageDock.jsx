import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import cmdfUrl       from '@/assets/icons/cmdf.svg?url'
import trashUrl      from '@/assets/icons/trash.svg?url'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'
import useWindowStore, { TOOL_IDS } from '@/store/windowStore'
import useSound from '@/hooks/useSound'
import TOOLS from '@/data/tools'
import MinimizedTray from './MinimizedTray'

const ICON_BASE  = 44
const PILL_H     = ICON_BASE + 20   // fixed pill height — icons overflow above, nothing shifts vertically
const GAP        = 8
const MAG_RANGE  = 115
const MAX_SCALE  = 1.80
const SPRING     = { type: 'spring', stiffness: 460, damping: 26, mass: 0.5 }
const DOCK_SPRING = { type: 'spring', stiffness: 420, damping: 30 }

function smoothstep(t) { return t * t * (3 - 2 * t) }

function getScale(index, mouseX) {
  if (mouseX === null) return 1
  const center = index * (ICON_BASE + GAP) + ICON_BASE / 2
  const dist   = Math.abs(mouseX - center)
  if (dist >= MAG_RANGE) return 1
  return 1 + smoothstep(1 - dist / MAG_RANGE) * (MAX_SCALE - 1)
}

export default function ToolsPageDock({ menuOpen, onMenuToggle, onNavigate }) {
  const play = useSound()
  const [mouseX,    setMouseX]    = useState(null)
  const [hoveredId, setHoveredId] = useState(null)
  const [trayOpen,  setTrayOpen]  = useState(false)
  const iconsRef = useRef(null)

  const { windows, switchTool } = useWindowStore()
  const minimized  = windows.filter((w) => w.isMinimized)
  const activeTool = windows.find(
    (w) => TOOL_IDS.includes(w.id) && w.isOpen && !w.isMinimized
  )?.id ?? null

  // Track mouse relative to the icons section only so magnification
  // centres are correct regardless of what's to the left/right
  const onMouseMove  = (e) => {
    const rect = iconsRef.current?.getBoundingClientRect()
    if (rect) setMouseX(e.clientX - rect.left)
  }
  const onMouseLeave = () => { setMouseX(null); setHoveredId(null) }

  const SEP = (
    <div style={{
      width: 1, height: 28,
      background: 'rgba(255,255,255,0.10)',
      alignSelf: 'center',
      flexShrink: 0,
    }} />
  )

  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      exit={{    scaleX: 0, opacity: 0 }}
      transition={DOCK_SPRING}
      style={{
        position:        'absolute',
        bottom:           24,
        left:            '50%',
        x:               '-50%',
        zIndex:           45,
        transformOrigin: 'center center',
      }}
    >
      {/* ── Unified pill ──────────────────────────────────────────────────── */}
      <div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{
          display:              'flex',
          alignItems:           'flex-end',
          gap:                   GAP,
          height:                PILL_H,
          padding:              '0 14px',
          background:           'rgba(255,255,255,0.05)',
          border:               '1px solid rgba(255,255,255,0.10)',
          backdropFilter:       'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRadius:          28,
          position:             'relative',
          overflow:             'visible',
          boxSizing:            'border-box',
        }}
      >
        {/* ── Avatar — navigate home ─────────────────────────────────────── */}
        <motion.div
          onClick={() => { play('open'); onNavigate?.('home') }}
          whileTap={{ scale: 0.9 }}
          style={{
            alignSelf:  'center',
            flexShrink:  0,
            cursor:     'pointer',
            display:    'flex',
          }}
        >
          <img src={mikdadHeadUrl} alt="Mikdad" style={{ width: 32, height: 32, objectFit: 'contain' }} />
        </motion.div>

        {SEP}

        {/* ── Left: menu button ─────────────────────────────────────────── */}
        <button
          onClick={() => { play(menuOpen ? 'close' : 'open'); onMenuToggle() }}
          style={{
            alignSelf:      'center',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            padding:        '8px 12px',
            background:     'rgba(255,255,255,0.03)',
            borderRadius:    12,
            flexShrink:      0,
            opacity:         menuOpen ? 1 : 0.85,
            transition:     'opacity 0.15s',
          }}
        >
          <img src={cmdfUrl} alt="Menu" style={{ height: 16, objectFit: 'contain' }} />
        </button>

        {SEP}

        {/* ── Centre: tool icons with magnification ─────────────────────── */}
        <div
          ref={iconsRef}
          style={{ display: 'flex', alignItems: 'flex-end', gap: GAP, paddingBottom: 10, alignSelf: 'flex-end' }}
        >
          {TOOLS.map((tool, i) => {
            const scale    = getScale(i, mouseX)
            const iconSize = ICON_BASE * scale
            const isActive = activeTool === tool.id

            return (
              <div
                key={tool.id}
                style={{
                  position:       'relative',
                  display:        'flex',
                  flexDirection:  'column',
                  alignItems:     'center',
                  zIndex:          1,
                }}
              >
                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredId === tool.id && (
                    <motion.span
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{    opacity: 0, y: 4 }}
                      transition={{ duration: 0.12 }}
                      style={{
                        position:             'absolute',
                        bottom:               iconSize + 10,
                        left:                 '50%',
                        transform:            'translateX(-50%)',
                        whiteSpace:           'nowrap',
                        padding:             '3px 10px',
                        borderRadius:          8,
                        background:           'rgba(20,20,20,0.80)',
                        border:               '1px solid rgba(255,255,255,0.10)',
                        backdropFilter:       'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        color:               'var(--headline)',
                        fontSize:             11,
                        fontFamily:          "'SF Pro Display'",
                        fontWeight:           500,
                        pointerEvents:       'none',
                        zIndex:               10,
                      }}
                    >
                      {tool.name}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Icon button */}
                <motion.button
                  animate={{ width: iconSize, height: iconSize }}
                  transition={SPRING}
                  onClick={() => switchTool(tool.id)}
                  onMouseEnter={() => setHoveredId(tool.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    flexShrink:   0,
                    display:      'flex',
                    borderRadius: Math.round(12 * scale),
                    overflow:     'hidden',
                  }}
                >
                  <img
                    src={tool.icon}
                    alt={tool.name}
                    style={{
                      width:     '100%',
                      height:    '100%',
                      objectFit: 'contain',
                      filter:    tool.url === null
                        ? 'grayscale(0.6) opacity(0.45)'
                        : 'none',
                    }}
                  />
                </motion.button>

                {/* Active dot */}
                <motion.span
                  animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0 }}
                  transition={SPRING}
                  style={{
                    position:     'absolute',
                    bottom:       -8,
                    left:         '50%',
                    transform:    'translateX(-50%)',
                    width:         4,
                    height:        4,
                    borderRadius: '50%',
                    background:   '#cf0506',
                    pointerEvents:'none',
                  }}
                />
              </div>
            )
          })}
        </div>

        {SEP}

        {/* ── Right: trash + minimized tray ─────────────────────────────── */}
        <div style={{ position: 'relative', alignSelf: 'center' }}>
          <MinimizedTray isOpen={trayOpen} onClose={() => setTrayOpen(false)} />
          <button
            data-trash
            onClick={() => setTrayOpen((v) => !v)}
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:           44,
              height:          44,
              position:       'relative',
            }}
          >
            <img
              src={trashUrl}
              alt="Trash"
              style={{
                width:      24,
                height:     24,
                objectFit: 'contain',
                transform:  trayOpen ? 'scale(1.15)' : 'scale(1)',
                transition: 'transform 0.2s',
              }}
            />
            <AnimatePresence>
              {minimized.length > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{    scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                  style={{
                    position:   'absolute',
                    top:        -4,
                    right:      -4,
                    width:       16,
                    height:      16,
                    borderRadius:'50%',
                    background: '#cf0506',
                    boxShadow:  '0 0 0 2px var(--bg)',
                    display:    'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize:    9,
                    color:      'white',
                    fontWeight: 'bold',
                  }}
                >
                  {minimized.length}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
