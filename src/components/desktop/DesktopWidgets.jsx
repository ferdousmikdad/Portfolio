import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import SFSymbol from '@/components/ui/SFSymbol'
import useWindowStore from '@/store/windowStore'
import useDesktopStore from '@/store/desktopStore'
import projects from '@/data/projects'

/* ── Desktop widgets ────────────────────────────────────────────────────────
   The set on Mikdad's own Tahoe desktop, measured off it: Calendar and
   Weather as small widgets side by side at the top-left, Photos as a medium
   one under them. 163pt squares, 19pt apart, 16pt in from the left and 46pt
   from the top of the screen.

   The material is Tahoe's desktop-widget glass: a touch darker than the
   wallpaper it sits on, a hairline light rim, no shadow. When a window is
   in front the widgets turn monochrome — the red month and today's red disc
   go grey — the way macOS quiets them while you work; hovering one brings
   its colour back.

   Weather is live for Dhaka (Open-Meteo, no key, nothing about the visitor
   is sent). Photos shows a featured piece from the portfolio, full bleed,
   as the Photos widget features a photo; clicking it opens that piece.    */

const S = 163                 // small widget edge, pt
const GAP = 19
const M = S * 2 + GAP         // medium widget width
const DEFAULTS = {
  calendar: { x: 16, y: 46 },
  weather:  { x: 16 + S + GAP, y: 46 },
  photos:   { x: 16, y: 46 + S + GAP },
}

// ── Calendar ──────────────────────────────────────────────────────────────────

/* The visitor's weekend, as their region defines it (Fri–Sat in Bangladesh,
   Sat–Sun in most places). ISO weekday numbers: 1 = Mon … 7 = Sun. */
function weekendDays() {
  try {
    const loc = new Intl.Locale(navigator.language)
    const info = loc.getWeekInfo?.() ?? loc.weekInfo
    if (info?.weekend) return info.weekend.map((d) => d % 7)   // → 0 = Sun … 6 = Sat
  } catch { /* fall through */ }
  return [0, 6]
}

function CalendarWidget({ now }) {
  const weekend = useMemo(weekendDays, [])
  const year = now.getFullYear(), month = now.getMonth(), today = now.getDate()
  const first = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const letters = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  return (
    <div className="dw-cal">
      <p className="dw-cal__month">{now.toLocaleDateString('en-US', { month: 'long' }).toUpperCase()}</p>
      <div className="dw-cal__grid">
        {letters.map((l, i) => <span key={`h${i}`} className="dw-cal__dow" data-weekend={weekend.includes(i) || undefined}>{l}</span>)}
        {cells.map((d, i) => (
          <span
            key={i}
            className="dw-cal__day"
            data-weekend={weekend.includes(i % 7) || undefined}
            data-today={d === today || undefined}
          >{d ?? ''}</span>
        ))}
      </div>
    </div>
  )
}

// ── Weather ───────────────────────────────────────────────────────────────────

const DHAKA = { name: 'Dhaka', lat: 23.81, lon: 90.41, tz: 'Asia/Dhaka' }

/* WMO weather codes → the words and symbols Apple's Weather uses. */
function describe(code, day) {
  if (code === 0) return [day ? 'Sunny' : 'Clear', day ? 'sun.max.fill' : 'moon.fill']
  if (code === 1) return ['Mostly Sunny', day ? 'sun.max.fill' : 'moon.fill']
  if (code === 2) return ['Partly Cloudy', day ? 'cloud.sun.fill' : 'cloud.moon.fill']
  if (code === 3) return ['Cloudy', 'cloud.fill']
  if (code === 45 || code === 48) return ['Foggy', 'cloud.fog.fill']
  if (code >= 51 && code <= 57) return ['Drizzle', 'cloud.drizzle.fill']
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return [code >= 65 ? 'Heavy Rain' : 'Rain', code >= 65 ? 'cloud.heavyrain.fill' : 'cloud.rain.fill']
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ['Snow', 'snowflake']
  if (code >= 95) return ['Thunderstorms', 'cloud.bolt.rain.fill']
  return ['Cloudy', 'cloud.fill']
}

function useWeather() {
  const [w, setW] = useState(null)
  useEffect(() => {
    let alive = true
    const load = () => fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${DHAKA.lat}&longitude=${DHAKA.lon}` +
      `&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min` +
      `&timezone=${encodeURIComponent(DHAKA.tz)}&forecast_days=1`,
    )
      .then((r) => r.json())
      .then((d) => alive && setW({
        temp: Math.round(d.current.temperature_2m),
        code: d.current.weather_code,
        day: d.current.is_day === 1,
        hi: Math.round(d.daily.temperature_2m_max[0]),
        lo: Math.round(d.daily.temperature_2m_min[0]),
      }))
      .catch(() => { /* offline: the widget shows its place and a dash */ })
    load()
    const t = setInterval(load, 15 * 60_000)
    return () => { alive = false; clearInterval(t) }
  }, [])
  return w
}

function WeatherWidget() {
  const w = useWeather()
  const [label, symbol] = w ? describe(w.code, w.day) : ['—', 'cloud.fill']
  return (
    <div className="dw-wx" data-night={w && !w.day ? '' : undefined}>
      <p className="dw-wx__place">{DHAKA.name} <SFSymbol name="location.fill" size={11} /></p>
      <p className="dw-wx__temp">{w ? `${w.temp}°` : '—'}</p>
      <div className="dw-wx__foot">
        <SFSymbol name={symbol} size={16} />
        <p className="dw-wx__cond">{label}</p>
        <p className="dw-wx__hilo">{w ? `H:${w.hi}° L:${w.lo}°` : ''}</p>
      </div>
    </div>
  )
}

// ── Photos ────────────────────────────────────────────────────────────────────

/* A featured piece from the portfolio, changing every half minute, the way
   the Photos widget cycles its featured photos. */
function usePhoto() {
  const pool = useMemo(() => (projects ?? []).filter((p) => p.thumbnail && p.thumbnailType !== 'video'), [])
  const [i, setI] = useState(() => Math.floor(Math.random() * Math.max(1, pool.length)))
  useEffect(() => {
    if (pool.length < 2) return
    const t = setInterval(() => setI((n) => (n + 1) % pool.length), 30_000)
    return () => clearInterval(t)
  }, [pool.length])
  return pool[i]
}

function PhotosWidget({ project }) {
  if (!project) return <p className="dw-photos__empty">Photos will appear here when finished processing</p>
  return (
    <div className="dw-photos">
      <img key={project.id} src={project.thumbnail} alt="" draggable={false} />
      <span className="dw-photos__caption">
        <b>Featured</b>
        <span>{project.title}</span>
      </span>
    </div>
  )
}

// ── Frame ─────────────────────────────────────────────────────────────────────

function Widget({ id, width, dim, onOpen, children, flush }) {
  const saved = useDesktopStore((s) => s.widgetPos?.[id])
  const place = useDesktopStore((s) => s.placeWidget)
  const pos = saved ?? DEFAULTS[id]
  const [dragged, setDragged] = useState(false)

  return (
    <motion.div
      key={`${pos.x},${pos.y}`}
      className={`dw${flush ? ' dw--flush' : ''}`}
      data-dim={dim || undefined}
      style={{ left: pos.x, top: pos.y, width, height: S }}
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => setDragged(true)}
      onDragEnd={(e, info) => {
        const snap = (v) => Math.round(v / 8) * 8
        const x = Math.max(8, Math.min(window.innerWidth - width - 8, snap(pos.x + info.offset.x)))
        const y = Math.max(36, Math.min(window.innerHeight - S - 90, snap(pos.y + info.offset.y)))
        place(id, { x, y })
        setTimeout(() => setDragged(false), 0)
      }}
      onClick={() => { if (!dragged) onOpen() }}
    >
      {children}
    </motion.div>
  )
}

export default function DesktopWidgets() {
  const [now, setNow] = useState(() => new Date())
  const busy = useWindowStore((s) => s.windows.some((w) => w.isOpen && !w.isMinimized))
  const store = useWindowStore.getState
  const photo = usePhoto()

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="dw-layer">
      <Widget id="calendar" width={S} dim={busy} onOpen={() => store().toggleNotificationCenter()}>
        <CalendarWidget now={now} />
      </Widget>
      <Widget id="weather" width={S} dim={busy} onOpen={() => store().toggleNotificationCenter()}>
        <WeatherWidget />
      </Widget>
      <Widget id="photos" width={M} dim={busy} flush={!!photo} onOpen={() => (photo ? store().openProjectPreview(photo) : store().navigate('portfolio'))}>
        <PhotosWidget project={photo} />
      </Widget>
    </div>
  )
}
