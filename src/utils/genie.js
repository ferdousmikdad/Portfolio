// ── macOS Genie Effect ── pure requestAnimationFrame, no dependencies ─────────
// Ported from the raw JS portfolio's minimize.js

const KF_OUT = [
  //  t      TL        TR       mid-R      BR        BL       mid-L
  [0.00,  0, 0,  100, 0,  100,50,  100,100,   0,100,   0, 50],
  [0.22,  0, 0,  100, 0,   82,50,   60,100,  40,100,  18, 50],
  [0.45,  2, 0,   98, 0,   68,50,   53,100,  47,100,  32, 50],
  [0.65, 16, 0,   84, 0,   56,50,   52,100,  48,100,  44, 50],
  [0.82, 34, 0,   66, 0,   52,50,   51,100,  49,100,  48, 50],
  [1.00, 50, 0,   50, 0,   50,50,   50,100,  50,100,  50, 50],
]

function clipAtProgress(table, p) {
  p = Math.max(0, Math.min(1, p))
  let a = table[0], b = table[table.length - 1]
  for (let i = 0; i < table.length - 1; i++) {
    if (p >= table[i][0] && p <= table[i + 1][0]) { a = table[i]; b = table[i + 1]; break }
  }
  const span = b[0] - a[0]
  const t    = span === 0 ? 1 : (p - a[0]) / span
  const vals = []
  for (let j = 1; j < a.length; j++) vals.push(a[j] + (b[j] - a[j]) * t)
  const pts = []
  for (let k = 0; k < vals.length; k += 2)
    pts.push(vals[k].toFixed(2) + '% ' + vals[k + 1].toFixed(2) + '%')
  return 'polygon(' + pts.join(', ') + ')'
}

function easeGenie(t) {
  if (t < 0.35) { const n = t / 0.35; return n * n * 0.35 }
  const n = (t - 0.35) / 0.65
  return 0.35 + n * n * n * 0.65
}

/** Animate element toward (tx, ty) with genie warp. Returns a Promise. */
export function genieOut(el, tx, ty, duration = 520) {
  return new Promise(resolve => {
    let start = null
    function frame(ts) {
      if (!start) start = ts
      const raw = Math.min((ts - start) / duration, 1)
      const t   = easeGenie(raw)
      el.style.clipPath  = clipAtProgress(KF_OUT, t)
      el.style.transform = `translate(${(tx * t).toFixed(1)}px, ${(ty * t).toFixed(1)}px)`
      el.style.opacity   = (1 - t).toFixed(4)
      if (raw < 1) requestAnimationFrame(frame)
      else resolve()
    }
    requestAnimationFrame(frame)
  })
}
