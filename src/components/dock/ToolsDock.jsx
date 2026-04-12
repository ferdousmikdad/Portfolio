import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TOOLS from '@/data/tools'
import useWindowStore, { TOOL_IDS } from '@/store/windowStore'

const ICON_BASE  = 44
const PILL_H     = ICON_BASE + 20   // dock pill stays this tall always
const GAP        = 8
const PAD        = 14
const MAG_RANGE  = 115
const MAX_SCALE  = 1.80
const SPRING     = { type: 'spring', stiffness: 460, damping: 26, mass: 0.5 }

function smoothstep(t) { return t * t * (3 - 2 * t) }

function getScale(index, mouseX) {
  if (mouseX === null) return 1
  const center = PAD + index * (ICON_BASE + GAP) + ICON_BASE / 2
  const dist   = Math.abs(mouseX - center)
  if (dist >= MAG_RANGE) return 1
  return 1 + smoothstep(1 - dist / MAG_RANGE) * (MAX_SCALE - 1)
}

export default function ToolsDock() {
  const [mouseX,    setMouseX]    = useState(null)
  const [hoveredId, setHoveredId] = useState(null)
  const dockRef                   = useRef(null)
  const { windows, switchTool }   = useWindowStore()
  const activeTool = windows.find(
    (w) => TOOL_IDS.includes(w.id) && w.isOpen && !w.isMinimized
  )?.id ?? null

  const onMouseMove  = (e) => {
    const rect = dockRef.current?.getBoundingClientRect()
    if (rect) setMouseX(e.clientX - rect.left)
  }
  const onMouseLeave = () => { setMouseX(null); setHoveredId(null) }

  return (
    // Outer wrapper — sizes to content width, icons align to bottom
    <div
      ref={dockRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        position:       'relative',
        display:        'flex',
        alignItems:     'flex-end',
        padding:        `10px ${PAD}px`,
        gap:             GAP,
      }}
    >
      {/* ── Pill background — fixed height, stretches horizontally ── */}
      <div
        style={{
          position:             'absolute',
          bottom:                0,
          left:                  0,
          right:                 0,
          height:                PILL_H,
          borderRadius:          28,
          background:           'rgba(255,255,255,0.05)',
          border:               '1px solid rgba(255,255,255,0.10)',
          backdropFilter:       'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          pointerEvents:        'none',
          zIndex:                0,
        }}
      />

      {/* ── Icons ─────────────────────────────────────────────────── */}
      {TOOLS.map((tool, i) => {
        const scale    = getScale(i, mouseX)
        const iconSize = ICON_BASE * scale
        const isActive = activeTool === tool.id

        return (
          <div
            key={tool.id}
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}
          >
            {/* Tooltip — above the current icon height */}
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
                    borderRadius:         8,
                    background:          'rgba(20,20,20,0.80)',
                    border:              '1px solid rgba(255,255,255,0.10)',
                    backdropFilter:      'blur(12px)',
                    WebkitBackdropFilter:'blur(12px)',
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

            {/* Icon — grows up from dock bottom */}
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
                  filter:    tool.url === null ? 'grayscale(0.6) opacity(0.45)' : 'none',
                }}
              />
            </motion.button>

            {/* Active dot — absolute so it doesn't push icons upward */}
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
  )
}
