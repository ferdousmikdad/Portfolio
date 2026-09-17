// ── macOS Genie Effect ── pure requestAnimationFrame, no dependencies ─────────

/* The window is cut into horizontal bands and every band is given its own
   transform, so the content is genuinely warped — necked inward toward the
   dock and stretched along the neck — rather than a rigid shrink hiding behind
   a moving hole.

   Each band is a trapezoid, not a rectangle: a band's bottom edge is narrower
   than its top, and exactly as wide as the next band's top edge. That is what
   makes the silhouette read as one continuous curve instead of a staircase,
   and it is only reachable through a projective `matrix3d` — a plain 2D scale
   can only narrow a band uniformly, which leaves a visible step at every seam.

   Everything that moves per frame is a `transform` on an element that already
   carries `will-change: transform`, so the browser composites the whole motion
   on the GPU and never repaints. That is what keeps it smooth. Animating
   `clip-path` instead — the obvious approach — forces a full repaint of the
   window on every single frame, and on top of that turns the element into a
   backdrop root, which silently kills the glass inside it while it runs. */

const LAG_Y = 0.55   // how much later the top of the window starts falling
const LAG_X = 0.64   // the neck forms a little ahead of the fall
const FADE  = 0.88   // progress at which the tail starts dissolving

const clamp01  = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const lerp     = (a, b, t) => a + (b - a) * t
const smooth   = (t) => t * t * (3 - 2 * t)
const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10)

/* A slice's own progress. Slices near the bottom (v → 1) start first and are
   done by `p = 1 - lag`; the top slice waits until `p = lag`. That stagger is
   the whole character of the effect — the bottom is already a thin tail while
   the top edge has not moved. */
const front = (v, p, lag) => smoother(clamp01((p - (1 - v) * lag) / (1 - lag)))

// ── Flattening ───────────────────────────────────────────────────────────────

const STYLE_ID = 'genie-style'
const CSS = `
.genie-stage { position: fixed; pointer-events: none; }
.genie-slice { position: absolute; overflow: hidden;
               will-change: transform; backface-visibility: hidden; }
.genie-flat, .genie-flat * {
  animation: none !important;
  transition: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  box-shadow: none !important;
  will-change: auto !important;
  caret-color: transparent !important;
  scrollbar-width: none !important;
}
.genie-flat *::-webkit-scrollbar { display: none !important; }
`

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return
  const tag = document.createElement('style')
  tag.id = STYLE_ID
  tag.textContent = CSS
  document.head.appendChild(tag)
}

/** Copy a clone's box so a replacement lands in exactly the same spot. */
function shellOf(node, tag = 'div') {
  const box = document.createElement(tag)
  if (node.className) box.className = node.className
  const inline = node.getAttribute('style')
  if (inline) box.setAttribute('style', inline)
  if (node.width)  box.style.width  ||= `${node.width}px`
  if (node.height) box.style.height ||= `${node.height}px`
  return box
}

/** Rasterise a live <canvas>/<video> into an <img>, or null if it is tainted. */
function freezeFrame(src, w, h) {
  try {
    let data
    if (src.tagName === 'CANVAS') {
      data = src.toDataURL()
    } else {
      const c = document.createElement('canvas')
      c.width = w || src.videoWidth || 1
      c.height = h || src.videoHeight || 1
      c.getContext('2d').drawImage(src, 0, 0, c.width, c.height)
      data = c.toDataURL()
    }
    const img = document.createElement('img')
    img.src = data
    return img
  } catch {
    return null
  }
}

/**
 * A copy of `source` that is cheap to composite.
 *
 * iframes and videos start loading the instant a clone is attached to the
 * document — that first-frame stall was most of what made the old effect feel
 * chopped. Canvases clone blank, so their pixels are carried over as an image.
 * Blur, shadows and running animations come off too: they cost a repaint the
 * effect cannot afford, and none of them survive being sliced anyway.
 */
export function flatten(source) {
  ensureStyle()
  const clone = source.cloneNode(true)
  clone.classList.add('genie-flat')
  clone.classList.remove('focused')

  const swap = (sel, build) => {
    const live = source.querySelectorAll(sel)
    const copy = clone.querySelectorAll(sel)
    copy.forEach((node, i) => {
      const from = live[i]
      const r = from ? from.getBoundingClientRect() : { width: 0, height: 0 }
      node.replaceWith(build(from, node, r))
    })
  }

  swap('canvas, video', (from, node, r) => {
    const shot = from && r.width ? freezeFrame(from, r.width, r.height) : null
    const box = shellOf(node, shot ? 'img' : 'div')
    if (shot) box.src = shot.src
    else box.style.background = 'rgba(127,127,127,0.16)'
    return box
  })

  // Nothing can be read out of a cross-origin frame, so it becomes a plate.
  swap('iframe', (from, node) => {
    const box = shellOf(node)
    box.style.background = 'rgba(127,127,127,0.16)'
    return box
  })

  return clone
}

// ── The warp ─────────────────────────────────────────────────────────────────

/**
 * Build the sliced stage. `rect` is where the window is (or is going), `slot`
 * is the dock tile it converges on; both in viewport coordinates.
 */
function buildGenie(source, rect, slot) {
  const H = rect.height
  const N = Math.min(18, Math.max(9, Math.round(H / 48)))
  const band = H / N

  const left = Math.min(rect.left, slot.left) - 48
  const top = Math.min(rect.top, slot.top) - 8
  const stage = document.createElement('div')
  stage.className = 'genie-stage'
  stage.style.cssText = [
    `left:${left}px`,
    `top:${top}px`,
    `width:${Math.max(rect.right, slot.right) + 48 - left}px`,
    `height:${Math.max(rect.bottom, slot.bottom) + 8 - top}px`,
    'z-index:9999',
  ].join(';')

  const flat = flatten(source)
  flat.style.cssText = [
    'position:absolute',
    'left:0',
    `width:${rect.width}px`,
    `height:${H}px`,
    'margin:0',
    'transform:none',
    'opacity:1',
    'max-width:none',
    'max-height:none',
    'pointer-events:none',
  ].join(';')

  const slices = []
  for (let i = 0; i < N; i++) {
    const slice = document.createElement('div')
    slice.className = 'genie-slice'
    slice.style.cssText = [
      `left:${rect.left - left}px`,
      `top:${rect.top - top + i * band}px`,
      `width:${rect.width}px`,
      // a hair of overlap, so no seam opens up where two bands shear apart
      `height:${band + (i < N - 1 ? 0.75 : 0)}px`,
      'transform-origin:50% 0',
    ].join(';')

    const inner = flat.cloneNode(true)
    inner.style.top = `${-i * band}px`
    slice.appendChild(inner)
    stage.appendChild(slice)
    slices.push(slice)
  }
  document.body.appendChild(stage)

  const winCx = rect.left + rect.width / 2
  const slotCx = slot.left + slot.width / 2
  const kx = slot.width / rect.width

  /* Screen y of the point that sits `v` of the way down the window. It travels
     from its place in the window to the matching place in the dock tile; the
     gap between two such points is the band's height, which is how the content
     stretches thin and then packs down as it is drawn through the neck. */
  const yAt = (v, p) =>
    lerp(rect.top + v * H, slot.top + v * slot.height, front(v, p, LAG_Y))

  // How far that point has been pulled in toward the dock, 0 → untouched.
  const qAt = (v, p) => front(v, p, LAG_X)

  /* A band is mapped by a projective transform, written out by hand because
     the shape it needs — top edge one width, bottom edge another, leaning
     sideways — is not something the `scale`/`skew` shorthands can express.
     Local (x, y), x from the band's own centre and y down from its top:

         X = (kTop·x + off·y/h) / D(y)     D(y) = 1 + (1/r − 1)·y/h
         Y = (ht·y/h)           / D(y)

     At y = 0 the band keeps the width the band above ended on; at y = h it has
     narrowed by exactly r and slid `off` across, which is what the band below
     starts from — so the two silhouettes meet with no step. Dividing by D also
     foreshortens the band's own content, which is what the real effect does to
     a window as it is drawn down the neck. */
  function draw(p) {
    for (let i = 0; i < N; i++) {
      const v0 = i / N
      const v1 = (i + 1) / N
      const h = band
      const yTop = yAt(v0, p)
      const ht = Math.max(yAt(v1, p) - yTop, 0.01)

      const q0 = qAt(v0, p)
      const q1 = qAt(v1, p)
      const kTop = lerp(1, kx, q0)
      const r = Math.max(lerp(1, kx, q1) / kTop, 0.0005)
      const off = (slotCx - winCx) * (q1 - q0)

      const dx = (slotCx - winCx) * q0
      const dy = yTop - (rect.top + v0 * H)

      slices[i].style.transform =
        `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) ` +
        `matrix3d(${kTop.toFixed(5)},0,0,0,` +
        `${(off / (r * h)).toFixed(5)},${(ht / (r * h)).toFixed(5)},0,` +
        `${((1 / r - 1) / h).toFixed(6)},` +
        `0,0,1,0,0,0,0,1)`
    }
    stage.style.opacity = (1 - clamp01((p - FADE) / (1 - FADE))).toFixed(3)
  }

  return { draw, destroy: () => stage.remove() }
}

/** Animate `p` from `a` to `b`, easing the clock, not the shape. */
function run(duration, draw, a, b) {
  return new Promise((resolve) => {
    let start = 0
    const step = (ts) => {
      if (!start) start = ts
      const t = clamp01((ts - start) / duration)
      draw(lerp(a, b, smooth(t)))
      if (t < 1) requestAnimationFrame(step)
      else resolve()
    }
    requestAnimationFrame(step)
  })
}

/* The stage is built, drawn at its resting pose and given one frame to paint
   before the clock starts, so the cost of creating it never lands inside the
   animation — and never more than one frame, because until the first frame
   lands there is nothing on screen where the window used to be. */
function play(source, rect, slot, duration, a, b, onReady) {
  const g = buildGenie(source, rect, slot)
  g.draw(a)
  // The stage is a pixel copy of the resting pose, so whatever was standing in
  // for the window can go now — in this same task, leaving no blank frame.
  onReady?.()
  return new Promise((resolve) => {
    requestAnimationFrame(() =>
      run(duration, g.draw, a, b).then(() => {
        g.destroy()
        resolve()
      })
    )
  })
}

/** Suck a live window down into its dock tile. */
export function genieOut(el, rect, slot, duration = 520, onReady) {
  return play(el, rect, slot, duration, 0, 1, onReady)
}

/** Grow a window back out of its tile — the same warp, run backwards. */
export function genieIn(node, rect, slot, duration = 480, onReady) {
  return play(node, rect, slot, duration, 1, 0, onReady)
}

/** Resolve with the first element matching `sel`, once React has put it there. */
export function afterMount(sel, tries = 4) {
  return new Promise((resolve) => {
    const look = (n) => {
      const el = document.querySelector(sel)
      if (el || n === 0) resolve(el)
      else requestAnimationFrame(() => look(n - 1))
    }
    requestAnimationFrame(() => look(tries))
  })
}
