import { useEffect, useRef, useState } from 'react'
import useThemeStore from '@/store/themeStore'
import useSettingsStore from '@/store/settingsStore'

// ── Parse bg-config.md ────────────────────────────────────────────────────────
function parseBgConfig(text) {
  const get = (key) => {
    const match = text.match(new RegExp(`^${key}:\\s*(\\S+)`, 'm'))
    return match ? match[1].trim() : null
  }
  return {
    animatedbg: get('animatedbg') === 'true',
    wallpaper:  get('wallpaper')  === 'true',
    image:      get('image') ?? 'wallpaper.jpg',
  }
}

function useBackgroundConfig() {
  const [config, setConfig] = useState({ animatedbg: true, wallpaper: false, image: 'wallpaper.jpg' })
  useEffect(() => {
    fetch('/bg-config.md')
      .then((r) => r.text())
      .then((text) => setConfig(parseBgConfig(text)))
      .catch(() => {}) // keep default if file missing
  }, [])
  return config
}

// ── Config ────────────────────────────────────────────────────────────────────

const DARK_BG      = '#080808'
const LIGHT_BG     = '#F2EDD9'
const DOT_GRID     = 18        // px between dots
const DOT_BASE     = 1.0       // resting dot radius
const DOT_BOOST    = 3.0       // max extra radius on trail head
const TRAIL_LENGTH = 140       // frames of history — longer = more smoke
const TRAIL_RADIUS = 55        // base px influence radius at trail head
const SMOKE_SPREAD = 2.2       // how much the radius expands as trail ages (smoke diffuses)
const LERP         = 0.14      // mouse smoothing

const ORBS_DARK = [
  { x: 0.18, y: 0.28, r: 0.50, phase: 0.00, speed: 0.00022, color: [207,  5,  6] },
  { x: 0.72, y: 0.65, r: 0.48, phase: 2.09, speed: 0.00018, color: [140, 70, 20] },
  { x: 0.50, y: 0.08, r: 0.42, phase: 4.19, speed: 0.00020, color: [ 40, 35, 90] },
]
const ORBS_LIGHT = [
  { x: 0.18, y: 0.28, r: 0.50, phase: 0.00, speed: 0.00022, color: [207,  5,  6] },
  { x: 0.72, y: 0.65, r: 0.48, phase: 2.09, speed: 0.00018, color: [180,120, 40] },
  { x: 0.50, y: 0.08, r: 0.42, phase: 4.19, speed: 0.00020, color: [ 80,120,200] },
]

// ── Component ─────────────────────────────────────────────────────────────────

function AnimatedBackground({ isDark }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    let   animId = null

    const raw    = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const smooth = { x: raw.x, y: raw.y }
    const trail  = []
    let   t      = 0

    const onMove = (e) => { raw.x = e.clientX; raw.y = e.clientY }
    window.addEventListener('mousemove', onMove)

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const orbs = isDark ? ORBS_DARK : ORBS_LIGHT

    function draw() {
      t++
      const W = canvas.width
      const H = canvas.height

      // Smooth mouse follow
      smooth.x += (raw.x - smooth.x) * LERP
      smooth.y += (raw.y - smooth.y) * LERP

      trail.unshift({ x: smooth.x, y: smooth.y })
      if (trail.length > TRAIL_LENGTH) trail.pop()

      // 1 ── Base fill
      ctx.fillStyle = isDark ? DARK_BG : LIGHT_BG
      ctx.fillRect(0, 0, W, H)

      // 2 ── Ambient orbs
      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      orbs.forEach((orb) => {
        const cx = (orb.x + Math.sin(t * orb.speed + orb.phase)        * 0.14) * W
        const cy = (orb.y + Math.cos(t * orb.speed + orb.phase * 0.73) * 0.11) * H
        const r  = orb.r * Math.min(W, H)
        const [rr, gg, bb] = orb.color
        const a  = isDark ? 0.22 : 0.14
        const g  = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        g.addColorStop(0, `rgba(${rr},${gg},${bb},${a})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, W, H)
      })
      ctx.restore()

      // 3 ── Dot grid with smoke trail
      const dotColor = isDark
        ? { r: 255, g: 245, b: 230 }
        : { r:  60, g:  52, b:  40 }

      const cols = Math.ceil(W / DOT_GRID) + 1
      const rows = Math.ceil(H / DOT_GRID) + 1

      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const dx = col * DOT_GRID
          const dy = row * DOT_GRID

          let maxInf = 0

          for (let i = 0; i < trail.length; i++) {
            // Age: 1 = freshest, 0 = oldest
            const age  = 1 - i / trail.length

            // Smoke spreads outward as it ages — older points have bigger radius
            const r    = TRAIL_RADIUS * (1 + (1 - age) * SMOKE_SPREAD)

            const tdx  = dx - trail[i].x
            const tdy  = dy - trail[i].y
            const dist = Math.sqrt(tdx * tdx + tdy * tdy)

            if (dist < r) {
              // Soft Gaussian-like falloff — no sharp edge, like real smoke
              const distFactor = 1 - dist / r
              const softFall   = distFactor * distFactor * (3 - 2 * distFactor) // smoothstep

              // Opacity also fades with age — old smoke = dimmer
              const ageFade = age * age
              const inf     = softFall * ageFade

              if (inf > maxInf) maxInf = inf
            }
          }

          // Dots at the head of trail grow and brighten;
          // aged smoke = same size as rest but brighter opacity only
          const radius  = DOT_BASE + maxInf * DOT_BOOST
          const opacity = isDark
            ? 0.16 + maxInf * 0.72
            : 0.13 + maxInf * 0.60

          ctx.beginPath()
          ctx.arc(dx, dy, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${dotColor.r},${dotColor.g},${dotColor.b},${opacity})`
          ctx.fill()
        }
      }

      // 4 ── Vignette
      const vg = ctx.createRadialGradient(W/2, H/2, H * 0.3, W/2, H/2, H * 0.95)
      vg.addColorStop(0, 'rgba(0,0,0,0)')
      vg.addColorStop(1, isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.18)')
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, W, H)

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', resize)
    }
  }, [isDark])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          backgroundImage: "url('/noise.png')",
          backgroundRepeat: 'repeat',
          opacity: isDark ? 0.38 : 0.22,
          zIndex: 1,
          mixBlendMode: isDark ? 'overlay' : 'multiply',
        }}
      />
    </>
  )
}

function WallpaperBackground({ image }) {
  return (
    <div
      className="absolute inset-0 w-full h-full"
      style={{
        backgroundImage: `url('/${image}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 0,
      }}
    />
  )
}

function StaticBackground({ isDark }) {
  return (
    <div className="absolute inset-0" style={{ background: isDark ? '#080808' : '#F2EDD9', zIndex: 0 }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "url('/noise.png')", backgroundRepeat: 'repeat',
        opacity: isDark ? 0.25 : 0.15,
        mixBlendMode: isDark ? 'overlay' : 'multiply',
      }} />
    </div>
  )
}

export default function Background() {
  const isDark  = useThemeStore((s) => s.isDark)
  const storeBg = useSettingsStore((s) => s.background)
  const config  = useBackgroundConfig()

  if (storeBg === 'static') {
    return config.wallpaper
      ? <WallpaperBackground image={config.image} />
      : <StaticBackground isDark={isDark} />
  }
  return <AnimatedBackground isDark={isDark} />
}
