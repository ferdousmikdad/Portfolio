// ── macOS Genie Effect ── pure requestAnimationFrame, no dependencies ─────────

/* The shape is generated per frame rather than interpolated between a handful
   of hand-written keyframes. A fixed table can only ever describe straight
   sides; the real genie necks inward along a curve while a "suction front"
   sweeps up the window from the bottom edge, and that needs a point per slice. */

const SLICES = 26      // vertices down each side
const BAND   = 0.55    // how gradual the neck is, in fractions of the height

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smoothstep = (t) => t * t * (3 - 2 * t)

/**
 * Clip polygon at progress `p`.
 * `cx`/`half` are where the shape converges, in fractions of the element box.
 */
function genieClip(p, cx = 0.5, half = 0.03) {
  // The front starts below the bottom edge and sweeps past the top, so by the
  // end every slice — including the top one — has been drawn in.
  const front = (1 + BAND) * (1 - p) - BAND
  const left = []
  const right = []

  for (let i = 0; i <= SLICES; i++) {
    const y = i / SLICES
    const t = smoothstep(clamp01((y - front) / BAND))
    const h = 0.5 + (half - 0.5) * t
    const c = 0.5 + (cx - 0.5) * t
    left.push([(c - h) * 100, y * 100])
    right.push([(c + h) * 100, y * 100])
  }

  const pts = left.concat(right.reverse())
  return (
    'polygon(' +
    pts.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(', ') +
    ')'
  )
}

// Slow to form the neck, then accelerating away into the dock
const easeGenie = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

function run(el, duration, draw) {
  return new Promise((resolve) => {
    let start = null
    function frame(ts) {
      if (!start) start = ts
      const raw = Math.min((ts - start) / duration, 1)
      draw(easeGenie(raw), raw)
      if (raw < 1) requestAnimationFrame(frame)
      else resolve()
    }
    requestAnimationFrame(frame)
  })
}

/**
 * Draw an element down into a dock slot.
 * `tx`/`ty` carry its centre to the slot centre; `cx` is where along the
 * element's own width the neck converges, so the tail leans toward the slot.
 */
export function genieOut(el, tx, ty, duration = 560, cx = 0.5) {
  return run(el, duration, (t) => {
    el.style.clipPath = genieClip(t, cx)
    el.style.transform =
      `translate(${(tx * t).toFixed(1)}px, ${(ty * t).toFixed(1)}px)` +
      ` scale(${(1 - 0.88 * t).toFixed(3)})`
    // stays solid until it is nearly home, then goes in the last stretch
    el.style.opacity = (1 - clamp01((t - 0.72) / 0.28)).toFixed(3)
  })
}

/** The same motion run backwards, for a window growing out of its tile. */
export function genieIn(el, fx, fy, duration = 440, cx = 0.5) {
  return run(el, duration, (t) => {
    const r = 1 - t
    el.style.clipPath = genieClip(r, cx)
    el.style.transform =
      `translate(${(fx * r).toFixed(1)}px, ${(fy * r).toFixed(1)}px)` +
      ` scale(${(1 - 0.88 * r).toFixed(3)})`
    el.style.opacity = clamp01(t / 0.35).toFixed(3)
  })
}
