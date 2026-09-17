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
// Slack around the shape so backdrop-filter has backdrop to sample
const GLASS_PAD = 48

/**
 * Capsule + tail, sized to `w` × TIP_H.
 * `tailX` is where the tail meets the body, so a bubble nudged away from a
 * screen edge can still point back at whatever it labels. Defaults to centred
 * and is clamped so the tail never runs into the rounded caps.
 *
 * `pad` insets the shape inside a larger box. Chrome samples backdrop-filter
 * from the element's own box, so a bubble-sized element can only ever blur a
 * bubble-sized patch of backdrop and a big radius stops making any difference.
 * Drawing the same shape inside an oversized element gives the blur room to
 * work; clip-path is applied after the filter, so the silhouette is unchanged.
 */
export function tipPath(w, h = TIP_H, tailX = null, pad = 0) {
  const s  = h / REF_H
  const r  = h / 2
  const k  = REF_K * s
  const px = pad
  const py = pad
  const b  = REF_H * s                    // bottom edge of the body
  const lim = r + TAIL.join * s           // keep the tail clear of the caps
  const cx = Math.min(Math.max(tailX ?? w / 2, lim), w - lim)
  const n  = (v) => Number(v.toFixed(2))
  const X  = (v) => n(v + px)
  const Y  = (v) => n(v + py)
  const t  = (dx, dy) => `${X(cx + dx * s)} ${Y(dy * s)}`

  return [
    `M${X(0)} ${Y(r)}`,
    `C${X(0)} ${Y(k)} ${X(k)} ${Y(0)} ${X(REF_R * s)} ${Y(0)}`,
    `H${X(w - REF_R * s)}`,
    `C${X(w - k)} ${Y(0)} ${X(w)} ${Y(k)} ${X(w)} ${Y(r)}`,
    `C${X(w)} ${Y(b - k)} ${X(w - k)} ${Y(b)} ${X(w - REF_R * s)} ${Y(b)}`,
    `H${X(cx + TAIL.join * s)}`,
    `C${t(TAIL.c1x, REF_H)} ${t(TAIL.c2x, TAIL.c2y)} ${t(TAIL.px, TAIL.py)}`,
    `C${t(TAIL.c3x, TAIL.c3y)} ${t(TAIL.c4x, TAIL.c4y)} ${t(TAIL.p2x, TAIL.p2y)}`,
    `L${t(TAIL.lx, TAIL.ly)}`,
    `C${t(TAIL.c5x, TAIL.c5y)} ${t(TAIL.c6x, REF_H)} ${X(cx - TAIL.join * s)} ${Y(b)}`,
    `H${X(REF_R * s)}`,
    `C${X(k)} ${Y(b)} ${X(0)} ${Y(b - k)} ${X(0)} ${Y(r)}`,
    'Z',
  ].join(' ')
}

export default function DockTip({ label, placement = 'top' }) {
  const ref = useRef(null)
  const [w, setW] = useState(0)
  const [shift, setShift] = useState(0)

  // Measured before paint, so the shape is never seen at the wrong width.
  // A bubble on a control near the screen edge would hang off it, so it is
  // nudged back inside and the tail is offset by the same amount.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setW(Math.ceil(r.width))
    const margin = 8
    const vw = window.innerWidth
    if (r.left < margin)            setShift(margin - r.left)
    else if (r.right > vw - margin) setShift(vw - margin - r.right)
    else                            setShift(0)
  }, [label])

  const d = w ? tipPath(w, TIP_H, w / 2 - shift, GLASS_PAD) : null
  // `placement` is where the bubble sits relative to its trigger, so a bubble
  // below an icon needs its tail flipped to point back up at it.
  const flipped = placement === 'bottom'
  const shell = flipped
    ? { transform: 'scaleY(-1)', top: -TIP_DEPTH - GLASS_PAD }
    : { top: -GLASS_PAD }

  return (
    <span
      ref={ref}
      className="dock-tip__frame"
      style={{ height: TIP_H, transform: shift ? `translateX(${shift}px)` : undefined }}
    >
      {d && (
        <>
          {/* The dock's material, clipped to the silhouette. The clip and the
              backdrop-filter must sit on the SAME element: a clip-path on an
              ancestor makes it a backdrop root, and a descendant's
              backdrop-filter then samples nothing and silently does nothing. */}
          <span
            className="dock-tip__glass"
            style={{
              clipPath: `path('${d}')`,
              left:     -GLASS_PAD,
              width:     w + GLASS_PAD * 2,
              height:    TIP_H + TIP_DEPTH + GLASS_PAD * 2,
              ...shell,
            }}
          />
          {/* Specular edge, lit from the upper left */}
          {/* Same padded box as the glass, so the offset path lines up */}
          <svg
            className="dock-tip__rim"
            style={{ ...shell, left: -GLASS_PAD }}
            width={w + GLASS_PAD * 2}
            height={TIP_H + TIP_DEPTH + GLASS_PAD * 2}
            viewBox={`0 0 ${w + GLASS_PAD * 2} ${TIP_H + TIP_DEPTH + GLASS_PAD * 2}`}
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
