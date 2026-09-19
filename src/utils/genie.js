import { stashFrameDoc, getFrameDoc } from '@/utils/windowSnapshots'

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
const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10)

/* Timing curve, as a CSS-style cubic bezier through (x1, 0) and (x2, 1).
   Solved by bisection: it runs once a frame, so a closed form is not worth the
   arithmetic. At x1 = 1/3, x2 = 2/3 this is exactly smoothstep. */
function bezier(x1, x2) {
  const at = (a, b, s) => s * (3 * (1 - s) * (1 - s) * a + 3 * (1 - s) * s * b + s * s)
  return (t) => {
    let lo = 0
    let hi = 1
    let s = t
    for (let i = 0; i < 24; i++) {
      s = (lo + hi) / 2
      if (at(x1, x2, s) < t) lo = s
      else hi = s
    }
    return at(0, 1, s)
  }
}

/* Smoothstep with its toe drawn out a little, so the window is seen to *begin*
   moving rather than snapping into it. The tail is left where it was; the
   durations below carry the small amount of extra time the softer start costs,
   so the middle of the run keeps the pace it had. */
const ease = bezier(0.42, 0.66)

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
 * A same-origin frame's document, frozen as standalone HTML, or null when the
 * frame is cross-origin or not loaded.
 *
 * The result is meant to be handed to a sandboxed `srcdoc` frame: scripts come
 * out so it is a picture rather than a second running copy of the app, a
 * `<base>` goes in so its stylesheets and images still resolve, and canvases
 * and typed-in values are carried over the same way they are in the parent —
 * neither survives being serialised on its own.
 */
function readFrame(frame) {
  try {
    const doc = frame.contentDocument
    if (!doc || !doc.body || !doc.documentElement) return null

    const root = doc.documentElement.cloneNode(true)
    root.querySelectorAll('script').forEach((s) => s.remove())

    const liveCanvas = doc.querySelectorAll('canvas, video')
    root.querySelectorAll('canvas, video').forEach((node, i) => {
      const from = liveCanvas[i]
      const r = from ? from.getBoundingClientRect() : { width: 0, height: 0 }
      const shot = from && r.width ? freezeFrame(from, r.width, r.height) : null
      const box = shellOf(node, shot ? 'img' : 'div')
      if (shot) box.src = shot.src
      else box.style.background = 'rgba(127,127,127,0.16)'
      node.replaceWith(box)
    })

    // What someone typed lives on the property, never on the attribute, so a
    // serialised form comes back blank unless it is written across by hand.
    const liveFields = doc.querySelectorAll('input, textarea, select')
    root.querySelectorAll('input, textarea, select').forEach((node, i) => {
      const from = liveFields[i]
      if (!from) return
      if (node.tagName === 'TEXTAREA') node.textContent = from.value
      else if (node.tagName === 'SELECT') {
        node.querySelectorAll('option').forEach((o) => {
          if (o.value === from.value) o.setAttribute('selected', '')
          else o.removeAttribute('selected')
        })
      } else if (from.type === 'checkbox' || from.type === 'radio') {
        if (from.checked) node.setAttribute('checked', '')
        else node.removeAttribute('checked')
      } else node.setAttribute('value', from.value)
    })

    const head = root.querySelector('head') ?? root.insertBefore(doc.createElement('head'), root.firstChild)
    if (!head.querySelector('base')) {
      const base = document.createElement('base')
      base.href = doc.baseURI
      head.insertBefore(base, head.firstChild)
    }

    return `<!doctype html>${root.outerHTML}`
  } catch {
    return null   // cross-origin: nothing to read, and nothing to be done
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

  // A frame cannot be cloned — attaching the copy reloads it — so it becomes a
  // plate. A same-origin frame's document can still be read, though, so the
  // plate carries the markup with it and whoever needs a real picture of the
  // frame (the dock tile) can rebuild one from it. Cross-origin frames stay
  // the plain grey plate, which is all the genie ever needs.
  swap('iframe', (from, node) => {
    const box = shellOf(node)
    box.style.background = 'rgba(127,127,127,0.16)'
    const doc = from && readFrame(from)
    if (doc) {
      const r = from.getBoundingClientRect()
      box.dataset.frameDoc = stashFrameDoc(doc)
      box.dataset.frameW = Math.round(r.width)
      box.dataset.frameH = Math.round(r.height)
    }
    return box
  })

  return clone
}

/** The frozen frame drawn into an SVG, so it can be loaded as a picture. */
function frameImage(html, w, h) {
  try {
    // foreignObject is XML, and HTML's void tags are not — so it goes through
    // the XML serialiser, which also stamps on the xhtml namespace it needs.
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const xml = new XMLSerializer().serializeToString(doc.documentElement)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">`
      + `<foreignObject width="100%" height="100%">${xml}</foreignObject></svg>`
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  } catch {
    return null
  }
}

/**
 * Draw the real page back into the plates `flatten` left behind.
 *
 * The genie cuts the window into a dozen bands and every band is its own copy,
 * so whatever stands in for the frame is paid for a dozen times. A frame is far
 * too expensive at that multiple — a dozen `srcdoc` documents to parse and lay
 * out, right at the moment the animation starts, which is exactly where a
 * dropped frame is impossible not to see. A picture costs nothing to clone, so
 * the frame is rasterised once, here, before the bands are cut.
 *
 * Returns null when there is no frame to draw — the common case, and one that
 * must not cost the caller so much as a microtask. Otherwise a promise: the
 * decode is awaited while the window is still standing, where the wait is
 * invisible, rather than during the warp, where it would not be.
 */
export function rasterizeFrames(root) {
  const plates = [...root.querySelectorAll('[data-frame-doc]')]
  if (!plates.length) return null

  return Promise.all(plates.map(async (plate) => {
    const html = getFrameDoc(plate.dataset.frameDoc)
    const w = Number(plate.dataset.frameW) || 0
    const h = Number(plate.dataset.frameH) || 0
    const url = html && w && h ? frameImage(html, w, h) : null
    if (!url) return

    const img = new Image()
    img.src = url
    // An SVG that will not decode leaves the grey plate exactly as it was,
    // which is the behaviour this replaced — never a blank window.
    try { await img.decode() } catch { return }

    img.style.cssText = 'width:100%;height:100%;display:block'
    plate.style.background = 'transparent'
    plate.replaceChildren(img)
  }))
}

/**
 * The same picture, as a live frame — the fallback for a plate `rasterizeFrames`
 * could not draw. Only ever one of these at a time (a dock tile that is just
 * sitting there), so the cost the genie cannot afford is fine here.
 */
export function hydrateFrames(root) {
  root.querySelectorAll('[data-frame-doc]').forEach((plate) => {
    if (plate.firstChild) return   // already drawn
    const html = getFrameDoc(plate.dataset.frameDoc)
    if (!html) return

    const frame = document.createElement('iframe')
    frame.setAttribute('sandbox', '')        // a picture, not a second running app
    frame.setAttribute('aria-hidden', 'true')
    frame.setAttribute('tabindex', '-1')
    frame.setAttribute('scrolling', 'no')
    frame.srcdoc = html
    frame.style.cssText = [
      `width:${plate.dataset.frameW || plate.offsetWidth}px`,
      `height:${plate.dataset.frameH || plate.offsetHeight}px`,
      'border:none', 'display:block', 'pointer-events:none',
    ].join(';')

    plate.style.background = 'transparent'
    plate.replaceChildren(frame)
  })
  return root
}

// ── The warp ─────────────────────────────────────────────────────────────────

/**
 * Slice `source` into a stage that can be warped.
 *
 * Building it is the expensive half — a dozen copies of the window, laid out
 * and painted — so it is deliberately separated from starting the clock. A
 * caller pays for it while the window it is standing in for is still on
 * screen, and only starts the motion once the stage has painted. Doing both in
 * one frame costs that frame, and a dropped frame at the very start is the one
 * place it is impossible not to notice.
 *
 * The stage is positioned later, by `place`, so none of this depends on
 * knowing where the window is going yet.
 */
export function genieStage(source, width, height) {
  const N = Math.min(18, Math.max(9, Math.round(height / 48)))
  const band = height / N

  const stage = document.createElement('div')
  stage.className = 'genie-stage'
  stage.style.cssText = `left:0;top:0;width:${width}px;height:${height}px;z-index:9999`

  const flat = flatten(source)
  flat.style.cssText = [
    'position:absolute',
    'left:0',
    `width:${width}px`,
    `height:${height}px`,
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
      'left:0',
      `top:${i * band}px`,
      `width:${width}px`,
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

  let geo = null

  /** Anchor the stage on the window's rectangle and aim it at a dock tile. */
  function place(rect, slot) {
    stage.style.left = `${rect.left}px`
    stage.style.top = `${rect.top}px`
    geo = {
      rect,
      slot,
      lean: slot.left + slot.width / 2 - (rect.left + width / 2),
      kx: slot.width / width,
    }
  }

  /* Screen y of the point that sits `v` of the way down the window. It travels
     from its place in the window to the matching place in the dock tile; the
     gap between two such points is the band's height, which is how the content
     stretches thin and then packs down as it is drawn through the neck. */
  const yAt = (v, p) =>
    lerp(geo.rect.top + v * height, geo.slot.top + v * geo.slot.height,
         front(v, p, LAG_Y))

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

      const q0 = front(v0, p, LAG_X)
      const q1 = front(v1, p, LAG_X)
      const kTop = lerp(1, geo.kx, q0)
      const r = Math.max(lerp(1, geo.kx, q1) / kTop, 0.0005)
      const off = geo.lean * (q1 - q0)

      const dx = geo.lean * q0
      const dy = yTop - (geo.rect.top + v0 * height)

      slices[i].style.transform =
        `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) ` +
        `matrix3d(${kTop.toFixed(5)},0,0,0,` +
        `${(off / (r * h)).toFixed(5)},${(ht / (r * h)).toFixed(5)},0,` +
        `${((1 / r - 1) / h).toFixed(6)},` +
        `0,0,1,0,0,0,0,1)`
    }
    stage.style.opacity = (1 - clamp01((p - FADE) / (1 - FADE))).toFixed(3)
  }

  return {
    width,
    height,
    place,
    draw,
    /* One frame of grace before the clock, so the stage is certain to have
       painted. It is drawing the resting pose, which is what was already on
       screen, so the wait costs nothing visible. */
    run: (duration, a, b) =>
      new Promise((resolve) => {
        draw(a)
        requestAnimationFrame(() => run(duration, draw, a, b).then(resolve))
      }),
    destroy: () => stage.remove(),
  }
}

/** Animate `p` from `a` to `b`, easing the clock, not the shape. */
function run(duration, draw, a, b) {
  return new Promise((resolve) => {
    let start = 0
    const step = (ts) => {
      if (!start) start = ts
      const t = clamp01((ts - start) / duration)
      draw(lerp(a, b, ease(t)))
      if (t < 1) requestAnimationFrame(step)
      else resolve()
    }
    requestAnimationFrame(step)
  })
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
