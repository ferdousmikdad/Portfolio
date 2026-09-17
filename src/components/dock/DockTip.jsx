import { useLayoutEffect, useRef, useState } from 'react'

/* ── Dock tooltip ──────────────────────────────────────────────────────────
   The silhouette is taken from the reference SVG: a capsule body with a wide,
   shallow tail that flows out of the bottom edge rather than a sharp pointer.
   Measured against the reference's 46px body, the tail spans ±22.05 either
   side of its centre and drops 11.4 below the body — nearly as wide as the
   body is tall, which is what makes it read as one continuous shape.

   The body has to stretch to fit the label while the tail keeps its size, so
   the path is generated for the measured width instead of scaling an asset. */

const REF_H  = 46      // body height in the reference artwork
const REF_R  = 23      // cap radius — a true capsule
const REF_K  = 10.2975 // cap bezier handle

// Tail control points, re-anchored to the tail's own centre
const TAIL = {
  join:  22.0524,
  c1x:   15.9140, c2x: 10.1176, c2y: 48.8269,
  px:     6.3381, py: 53.6638,
  c3x:    3.5469, c3y: 57.2359,
  c4x:   -1.7887, c4y: 57.4336,
  p2x:   -4.8367, p2y: 54.0778,
  lx:    -5.5315, ly:  53.3128,
  c5x:   -9.7616, c5y: 48.6555,
  c6x:  -15.7609,
}

export const TIP_H     = 24                                  // body height
export const TIP_DEPTH = Math.ceil((57.4336 - REF_H) * (TIP_H / REF_H))

/** Capsule + tail, sized to `w` × TIP_H with the tail centred. */
export function tipPath(w, h = TIP_H) {
  const s  = h / REF_H
  const r  = h / 2
  const k  = REF_K * s
  const cx = w / 2
  const b  = REF_H * s                    // bottom edge of the body
  const n  = (v) => Number(v.toFixed(2))
  const t  = (dx, dy) => `${n(cx + dx * s)} ${n(dy * s)}`

  return [
    `M0 ${n(r)}`,
    `C0 ${n(k)} ${n(k)} 0 ${n(REF_R * s)} 0`,
    `H${n(w - REF_R * s)}`,
    `C${n(w - k)} 0 ${n(w)} ${n(k)} ${n(w)} ${n(r)}`,
    `C${n(w)} ${n(b - k)} ${n(w - k)} ${n(b)} ${n(w - REF_R * s)} ${n(b)}`,
    `H${n(cx + TAIL.join * s)}`,
    `C${t(TAIL.c1x, REF_H)} ${t(TAIL.c2x, TAIL.c2y)} ${t(TAIL.px, TAIL.py)}`,
    `C${t(TAIL.c3x, TAIL.c3y)} ${t(TAIL.c4x, TAIL.c4y)} ${t(TAIL.p2x, TAIL.p2y)}`,
    `L${t(TAIL.lx, TAIL.ly)}`,
    `C${t(TAIL.c5x, TAIL.c5y)} ${t(TAIL.c6x, REF_H)} ${n(cx - TAIL.join * s)} ${n(b)}`,
    `H${n(REF_R * s)}`,
    `C${n(k)} ${n(b)} 0 ${n(b - k)} 0 ${n(r)}`,
    'Z',
  ].join(' ')
}

export default function DockTip({ label }) {
  const ref = useRef(null)
  const [w, setW] = useState(0)

  // Measured before paint, so the shape is never seen at the wrong width
  useLayoutEffect(() => {
    if (ref.current) setW(Math.ceil(ref.current.getBoundingClientRect().width))
  }, [label])

  const d = w ? tipPath(w) : null

  return (
    <span ref={ref} className="dock-tip__frame" style={{ height: TIP_H }}>
      {d && (
        <>
          {/* Frosted, refracting fill clipped to the silhouette */}
          <span
            className="dock-tip__glass"
            style={{ clipPath: `path('${d}')`, height: TIP_H + TIP_DEPTH }}
          >
            {/* The refraction lives inside the clip so it bends the backdrop
                without rippling the silhouette. */}
            <span className="dock-tip__glass-inner" />
          </span>
          {/* Specular edge, lit from the upper left */}
          <svg
            className="dock-tip__rim"
            width={w}
            height={TIP_H + TIP_DEPTH}
            viewBox={`0 0 ${w} ${TIP_H + TIP_DEPTH}`}
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="dock-tip-rim" x1="0" y1="0" x2="0.85" y2="1">
                <stop offset="0"    stopColor="var(--tip-rim-a)" />
                <stop offset="0.34" stopColor="var(--tip-rim-b)" />
                <stop offset="0.72" stopColor="var(--tip-rim-b)" />
                <stop offset="1"    stopColor="var(--tip-rim-c)" />
              </linearGradient>
            </defs>
            <path d={d} stroke="url(#dock-tip-rim)" strokeWidth="1" />
          </svg>
        </>
      )}
      <span className="dock-tip__text">{label}</span>
    </span>
  )
}
