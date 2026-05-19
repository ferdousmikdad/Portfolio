import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import figmaIcon from '@/assets/icons/figma-icon.svg'
import magicIcon from '@/assets/icons/magic-icon.svg'
import afterEffect from '@/assets/icons/after-effect.svg'
import projects from '@/data/projects'

// ── Config ────────────────────────────────��─────────────────────────────���─────
const COLS       = 21
const ROWS       = 13
const GAME_SPEED = 200

// 1 = wall, 0 = open path  (21 × 13)
const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,0,1,1,0,0,1,0,0,1,1,0,0,1,1,0,1],
  [1,0,1,1,0,0,1,1,0,0,0,0,0,1,1,0,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,1,0,0,1,1,1,0,0,1,1,0,0,0,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,0,0,0,0,1,1,0,0,1,1,1,0,0,1,1,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,0,1,1,0,0,0,0,0,1,1,0,0,1,1,0,1],
  [1,0,1,1,0,0,1,1,0,0,1,0,0,1,1,0,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]

const START = { x: 1, y: 6 }

const SKILL_DEFS = [
  { type: 'figma',        src: figmaIcon,   label: '+ UI/UX Thinking Unlocked' },
  { type: 'ai',           src: magicIcon,   label: '+ AI Workflow Activated'   },
  { type: 'aftereffects', src: afterEffect, label: '+ Motion Design Unlocked'  },
]

// ── Helpers ───────────────────────────────��──────────────────────────────���────
function isWall(x, y) { return MAZE[y]?.[x] === 1 }

function canMove(x, y, dir) {
  if (dir === 'left')  return x > 0        && !isWall(x - 1, y)
  if (dir === 'right') return x < COLS - 1 && !isWall(x + 1, y)
  if (dir === 'up')    return y > 0        && !isWall(x, y - 1)
  if (dir === 'down')  return y < ROWS - 1 && !isWall(x, y + 1)
  return false
}

function applyDir(x, y, dir) {
  if (dir === 'left')  return { x: x - 1, y }
  if (dir === 'right') return { x: x + 1, y }
  if (dir === 'up')    return { x, y: y - 1 }
  if (dir === 'down')  return { x, y: y + 1 }
  return { x, y }
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function spreadPick(candidates, n, minDist) {
  const chosen = []
  for (const c of candidates) {
    if (chosen.length >= n) break
    if (!chosen.some(p => Math.abs(p.x - c.x) + Math.abs(p.y - c.y) < minDist))
      chosen.push(c)
  }
  return chosen
}

function buildDots() {
  const dots = []
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++)
      if (!isWall(x, y) && !(x === START.x && y === START.y))
        dots.push({ x, y, eaten: false })
  return dots
}

function spawnSkills(pacPos) {
  const occupied = new Set([`${pacPos.x},${pacPos.y}`])
  let candidates = []
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++)
      if (!isWall(x, y) && !occupied.has(`${x},${y}`)) candidates.push({ x, y })
  candidates = shuffle(candidates)
  const spread = spreadPick(candidates, 3, 5)
  return SKILL_DEFS.map((def, i) =>
    spread[i] ? { x: spread[i].x, y: spread[i].y, type: def.type, collected: false } : null
  ).filter(Boolean)
}

// ── Initial state ───────────────────────────────────────────────────────────��─
function initState() {
  return {
    pacmanPos:    { ...START },
    direction:    'right',
    dots:         [],
    dotsEaten:    0,
    totalDots:    0,
    skillIcons:   [],
    magnetMode:   false,
    trailMode:    false,
    aiPowerMode:  false,
    currentSpeed: GAME_SPEED,
    pacmanTrail:  [],
    figmaOverlay: false,
    aiGlow:       false,
    floatingMsgs: [],
  }
}

// ── Pick a project for the popup ─────────────────────────────────────────────
function pickProject(type) {
  const ui     = projects.filter(p => ['Landing pages','Dashboards','Mobile UI'].includes(p.category))
  const design = projects.filter(p => ['Brand identity','Logo','Arabic Logo'].includes(p.category))
  const pool   = type === 'figma' && ui.length     ? ui
               : type === 'aftereffects' && design.length ? design
               : projects
  return pool[Math.floor(Math.random() * pool.length)] ?? projects[0]
}

// ── Animated Pacman SVG ─────────────────────��──────────────────────────���──────
function PacmanIcon({ direction, animated = true, style = {} }) {
  const jawClass = animated ? '' : 'jaw-paused'
  return (
    <svg viewBox="0 0 34 34" width="28" height="28" style={style}
      className={`pacman-img ${direction}`}>
      <path d="M17,17 L2,17 A15,15 0 0,1 32,17 Z" fill="#CF0506" className={`jaw-upper ${jawClass}`} />
      <path d="M17,17 L32,17 A15,15 0 0,1 2,17 Z" fill="#CF0506" className={`jaw-lower ${jawClass}`} />
    </svg>
  )
}

// ── Component ──────────────────────────────────────────────────────────────��──
export default function PacmanGame() {
  const [gameStarted, setGameStarted]   = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [showPlayCard, setShowPlayCard] = useState(true)
  const [currentProject, setCurrentProject] = useState(0)
  const [state, setState] = useState(initState())

  const [popup, setPopup] = useState(null)   // { project, type }

  const stateRef     = useRef(state)
  const nextDirRef   = useRef('right')
  const isMovingRef  = useRef(false)
  const pausedRef    = useRef(false)
  const [isMoving, setIsMoving] = useState(false)
  const tickTimer    = useRef(null)
  const effectTimers = useRef([])

  stateRef.current = state

  // ── Auto-start ─────────────────────────��─────────────────────────────���──────
  useEffect(() => {
    const dots = buildDots()
    const skillIcons = spawnSkills(START)
    setState({ ...initState(), dots, totalDots: dots.length, skillIcons })
    // movement starts only when Play is clicked
  }, [])

  // ── Start / Reset ───────────────────────────────────────────────────���───────
  const startGame = useCallback(() => {
    const dots = buildDots()
    const skillIcons = spawnSkills(START)
    nextDirRef.current = 'right'
    isMovingRef.current = false
    setIsMoving(false)
    setState({ ...initState(), dots, totalDots: dots.length, skillIcons })
    setGameComplete(false)
    setGameStarted(true)
  }, [])

  const resetGame = useCallback(() => {
    effectTimers.current.forEach(clearTimeout)
    effectTimers.current = []
    if (tickTimer.current) clearTimeout(tickTimer.current)
    nextDirRef.current = 'right'
    isMovingRef.current = false
    pausedRef.current = false
    setIsMoving(false)
    setPopup(null)
    setState(initState())
    setGameComplete(false)
    setGameStarted(false)
  }, [])

  // ── Floating message ────────────────────────────────────────────────────────
  const showFloat = useCallback((type, pacPos) => {
    const def = SKILL_DEFS.find(d => d.type === type)
    if (!def) return
    const colors = { figma: '#a78bfa', ai: '#34d399', aftereffects: '#60a5fa' }
    const id = Date.now() + Math.random()
    setState(s => ({ ...s, floatingMsgs: [...s.floatingMsgs, { id, label: def.label, color: colors[type], x: pacPos.x, y: pacPos.y }] }))
    setTimeout(() => setState(s => ({ ...s, floatingMsgs: s.floatingMsgs.filter(m => m.id !== id) })), 1600)
  }, [])

  const closePopup = useCallback(() => {
    pausedRef.current = false
    setPopup(null)
  }, [])

  // ── Skill effect ──────────────────────────────────────────────────────────
  const applyEffect = useCallback((type) => {
    // show portfolio popup and pause the game
    const project = pickProject(type)
    pausedRef.current = true
    setPopup({ project, type })

    // keep gameplay effects running for when popup is closed
    if (type === 'ai') {
      setState(s => ({ ...s, aiPowerMode: true, magnetMode: true, currentSpeed: 80, aiGlow: true }))
      effectTimers.current.push(setTimeout(() => setState(s => ({
        ...s, aiPowerMode: false, magnetMode: false, currentSpeed: GAME_SPEED, aiGlow: false
      })), 3000))
    } else if (type === 'aftereffects') {
      setState(s => ({ ...s, trailMode: true }))
      effectTimers.current.push(setTimeout(() => setState(s => ({ ...s, trailMode: false, pacmanTrail: [] })), 2000))
    }
  }, [])

  // ── Collect skill ───────────────────────────��───────────────────────────────
  const collectSkill = useCallback((skill, pacPos) => {
    setState(s => ({ ...s, skillIcons: s.skillIcons.map(sk => sk === skill ? { ...sk, collected: true } : sk) }))
    showFloat(skill.type, pacPos)
    applyEffect(skill.type)
    effectTimers.current.push(setTimeout(() => {
      const s = stateRef.current
      const occupied = new Set([`${s.pacmanPos.x},${s.pacmanPos.y}`])
      s.skillIcons.filter(sk => !sk.collected).forEach(sk => occupied.add(`${sk.x},${sk.y}`))
      const free = []
      for (let y = 0; y < ROWS; y++)
        for (let x = 0; x < COLS; x++) {
          const dot = s.dots.find(d => d.x === x && d.y === y)
          if (dot && !dot.eaten && !occupied.has(`${x},${y}`)) free.push({ x, y })
        }
      if (free.length) {
        const pos = free[Math.floor(Math.random() * free.length)]
        setState(prev => ({ ...prev, skillIcons: [...prev.skillIcons, { x: pos.x, y: pos.y, type: skill.type, collected: false }] }))
      }
    }, 10000))
  }, [showFloat, applyEffect])

  // ── Arrow keys — queue direction only ──────────────────────────────────────
  useEffect(() => {
    const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }
    const handler = (e) => {
      if (!map[e.key]) return
      e.preventDefault()
      nextDirRef.current = map[e.key]
      if (!isMovingRef.current) {
        isMovingRef.current = true
        setIsMoving(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ── Auto-move game loop ────────────────────────────────────────────────────
  useEffect(() => {
    if (!gameStarted || gameComplete) return

    const tick = () => {
      if (!isMovingRef.current || pausedRef.current) {
        tickTimer.current = setTimeout(tick, stateRef.current.currentSpeed)
        return
      }

      const s   = stateRef.current
      const { x, y } = s.pacmanPos
      const queued  = nextDirRef.current
      const current = s.direction

      let dir = current
      let moved = false

      if (canMove(x, y, queued)) { dir = queued; moved = true }
      else if (canMove(x, y, current)) { moved = true }

      if (moved) {
        const { x: nx, y: ny } = applyDir(x, y, dir)
        const newPos = { x: nx, y: ny }

        const newTrail = s.trailMode
          ? [{ ...s.pacmanPos }, ...s.pacmanTrail].slice(0, 4)
          : s.pacmanTrail

        let dotsEaten = s.dotsEaten
        const newDots = s.dots.map(dot => {
          if (dot.x === nx && dot.y === ny && !dot.eaten) { dotsEaten++; return { ...dot, eaten: true } }
          return dot
        })

        const hitSkill = s.skillIcons.find(sk => !sk.collected && sk.x === nx && sk.y === ny)
        if (hitSkill) collectSkill(hitSkill, newPos)

        if (s.magnetMode) {
          const radius = s.aiPowerMode ? 4 : 3
          s.skillIcons.forEach(sk => {
            if (!sk.collected && Math.abs(sk.x - nx) + Math.abs(sk.y - ny) <= radius)
              collectSkill(sk, newPos)
          })
        }

        if (dotsEaten >= s.totalDots) setGameComplete(true)

        setState(prev => ({ ...prev, pacmanPos: newPos, direction: dir, dots: newDots, dotsEaten, pacmanTrail: newTrail }))
      }

      tickTimer.current = setTimeout(tick, stateRef.current.currentSpeed)
    }

    tickTimer.current = setTimeout(tick, stateRef.current.currentSpeed)
    return () => { if (tickTimer.current) clearTimeout(tickTimer.current) }
  }, [gameStarted, gameComplete, collectSkill])

  // ── Cleanup ───────────────────────────��─────────────────────────────────────
  useEffect(() => () => {
    effectTimers.current.forEach(clearTimeout)
    if (tickTimer.current) clearTimeout(tickTimer.current)
  }, [])

  const { pacmanPos, direction, dots, skillIcons, pacmanTrail, trailMode, figmaOverlay, aiGlow, floatingMsgs, currentSpeed } = state

  // Smooth pixel position for Pacman
  const pacLeft = `${((pacmanPos.x + 0.5) / COLS) * 100}%`
  const pacTop  = `${((pacmanPos.y + 0.5) / ROWS) * 100}%`

  // ── Render ───────────────────────────��──────────────────────────────────────
  return (
    <div className="relative w-full h-full flex flex-col select-none p-3">

      {/* Game area */}
      <div
        className={`relative flex-1 overflow-hidden rounded-xl ${aiGlow ? 'ai-glow' : ''}`}
        style={{ opacity: showPlayCard ? 0.5 : 1, transition: 'opacity 0.4s ease' }}
      >

        {/* Grid — walls, dots, skills only */}
        <div
          className="absolute inset-0 game-grid"
          style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
        >
          {Array.from({ length: ROWS }, (_, y) =>
            Array.from({ length: COLS }, (_, x) => {
              if (isWall(x, y)) return <div key={`${x}-${y}`} className="wall-cell" />

              const dot      = dots.find(d => d.x === x && d.y === y)
              const skill    = skillIcons.find(s => s.x === x && s.y === y && !s.collected)
              const trailIdx = trailMode ? pacmanTrail.findIndex(t => t.x === x && t.y === y) : -1

              return (
                <div key={`${x}-${y}`} className="grid-cell">
                  {trailIdx !== -1 ? (
                    <PacmanIcon
                      direction={direction}
                      style={{ opacity: 0.15 + (trailIdx / pacmanTrail.length) * 0.25, filter: 'blur(1px)' }}
                    />
                  ) : skill ? (
                    <img src={SKILL_DEFS.find(d => d.type === skill.type)?.src} alt={skill.type} className="skill-icon" />
                  ) : dot && !dot.eaten ? (
                    <div className="dot" />
                  ) : null}
                </div>
              )
            })
          )}
        </div>

        {/* Smooth Pacman — absolutely positioned with CSS transition */}
        <div
          style={{
            position: 'absolute',
            left: pacLeft,
            top: pacTop,
            transform: 'translate(-50%, -50%)',
            transition: `left ${currentSpeed - 15}ms linear, top ${currentSpeed - 15}ms linear`,
            pointerEvents: 'none',
          }}
        >
          <PacmanIcon direction={direction} animated={isMoving} />
        </div>

        {/* Floating messages */}
        {floatingMsgs.map(msg => (
          <div
            key={msg.id}
            className="floating-msg"
            style={{
              color: msg.color,
              left: `${((msg.x + 0.5) / COLS) * 100}%`,
              top:  `${(msg.y / ROWS) * 100}%`,
            }}
          >
            {msg.label}
          </div>
        ))}

        {/* Portfolio popup — shown when a skill icon is eaten */}
        <AnimatePresence>
          {popup && (
            <motion.div
              key="popup-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 flex items-center justify-center z-40"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
              onClick={closePopup}
            >
              <motion.div
                key="popup-card"
                initial={{ scale: 0.82, opacity: 0, y: 14 }}
                animate={{ scale: 1,    opacity: 1, y: 0  }}
                exit={{    scale: 0.88, opacity: 0, y: 8  }}
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                style={{
                  position:     'relative',
                  borderRadius:  14,
                  overflow:     'hidden',
                  maxWidth:     '74%',
                  boxShadow:    '0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={popup.project.thumbnail}
                  alt={popup.project.title}
                  style={{ width: '100%', display: 'block', maxHeight: '50vh', objectFit: 'cover' }}
                />
                <div style={{ padding: '10px 14px', background: 'rgba(18,18,18,0.97)' }}>
                  <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: "'SF Pro Display'", margin: 0 }}>
                    {popup.project.title}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 3, fontFamily: "'SF Pro Text'" }}>
                    {popup.project.category}
                  </p>
                </div>
                {/* close button */}
                <button
                  onClick={closePopup}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.55)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    color: '#fff', fontSize: 13, lineHeight: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >×</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game complete */}
        {gameComplete && (
          <div className="absolute inset-0 flex items-center justify-center gap-6 z-20 bg-black/30">
            <button
              onClick={() => { setCurrentProject(i => (i - 1 + projects.length) % projects.length); resetGame() }}
              className="px-5 py-2 rounded-xl border border-white/10 text-headline text-sm hover:bg-white/08 transition-colors"
            >← Prev</button>
            <button
              onClick={() => { setCurrentProject(i => (i + 1) % projects.length); resetGame() }}
              className="px-5 py-2 rounded-xl border border-white/10 text-headline text-sm hover:bg-white/08 transition-colors"
            >Next →</button>
          </div>
        )}
      </div>

      {/* Play card — overlay has no z-index so backdrop-filter samples game content */}
      {showPlayCard && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="flex flex-col items-center gap-1 px-8 py-4 border border-white/10 pointer-events-auto"
            style={{
              position: 'relative',
              zIndex: 30,
              borderRadius: '20px',
              background: 'var(--window-bg)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            <button
              onClick={() => { setShowPlayCard(false); startGame() }}
              className="px-8 py-2.5 text-headline font-semibold text-3xl transition-colors"
              style={{ fontFamily: "'SF Pro Display'" }}
            >
              Play
            </button>
            <span className="text-body text-sm" style={{ fontFamily: "'SF Pro Text'" }}>
              See the creativity
            </span>
          </div>
        </div>
      )}

    </div>
  )
}
