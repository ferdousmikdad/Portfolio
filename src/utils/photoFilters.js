/* ── Photo Booth filters ───────────────────────────────────────────────────
   Kept out of the component so they can be tested without a camera: a webcam
   is exactly the kind of dependency that cannot be stood up in a headless
   browser, and these are the part most likely to be wrong.

   The halftone is the portfolio's own Retro Dot effect
   (`public/tools/retro-dot-effect.html`) — same Rec. 709 luminance, same
   radius-from-darkness mapping, same rotated sampling grid — so the live
   filter and the standalone tool genuinely agree.                          */

/** Rec. 709 luminance, the weights the tool uses. */
export const lumaOf = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b

export const DOT_SPACING = 7
export const DOT_ANGLE = Math.PI / 4      // the tool's 45° preset
export const DOT_MAX_SCALE = 0.92

/** Dot radius for a sampled luminance — dark pixels make big dots. */
export const dotRadius = (lum, spacing = DOT_SPACING, maxScale = DOT_MAX_SCALE) =>
  (1 - lum / 255) * (spacing * 0.5 * maxScale)

/** The tool's halftone, drawn straight onto the frame buffer. */
export function halftone(ctx, src, w, h, spacing = DOT_SPACING) {
  const cosA = Math.cos(DOT_ANGLE)
  const sinA = Math.sin(DOT_ANGLE)
  const cx = w / 2
  const cy = h / 2
  const steps = Math.ceil(Math.sqrt(w * w + h * h) / spacing) + 1
  const d = src.data

  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#000'
  ctx.beginPath()
  for (let i = -steps; i <= steps; i++) {
    for (let j = -steps; j <= steps; j++) {
      const gx = j * spacing
      const gy = i * spacing
      const sx = cx + gx * cosA - gy * sinA
      const sy = cy + gx * sinA + gy * cosA
      if (sx < -spacing || sx > w + spacing || sy < -spacing || sy > h + spacing) continue
      const px = Math.min(w - 1, Math.max(0, Math.round(sx)))
      const py = Math.min(h - 1, Math.max(0, Math.round(sy)))
      const k = (py * w + px) * 4
      const r = dotRadius(lumaOf(d[k], d[k + 1], d[k + 2]), spacing)
      if (r < 0.3) continue
      ctx.moveTo(sx + r, sy)
      ctx.arc(sx, sy, r, 0, Math.PI * 2)
    }
  }
  ctx.fill()
}
