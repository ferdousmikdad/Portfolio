/* Snapshots of minimised windows, for their dock tiles.

   macOS shows a shrunken picture of the window itself in the dock, not the app
   icon. There is no way to rasterise a DOM subtree without a canvas library, so
   the snapshot is the window's own markup, cloned at the moment it was
   minimised and re-cloned into the tile. The app's stylesheet still matches the
   cloned classes, so it renders exactly as it looked.

   Kept outside React state: these are DOM nodes, not serialisable data. */

const snapshots = new Map()

/* A window with an iframe in it — every one of the tool apps — cannot be
   cloned outright: attaching the copy reloads the frame, and the tile is left
   showing the grey plate the genie stands in with. So the frame's markup is
   frozen at minimise time and parked here, and the tile rebuilds a picture of
   it. Keyed by a token the plate carries, because the markup is a string and
   has no business being an attribute megabytes long. */
const frameDocs = new Map()
let frameSeq = 0

export function stashFrameDoc(html) {
  const key = `frame-${++frameSeq}`
  frameDocs.set(key, html)
  return key
}

export function getFrameDoc(key) {
  return frameDocs.get(key) ?? null
}

const framesOf = (node) =>
  [...node.querySelectorAll('[data-frame-doc]')].map((el) => el.dataset.frameDoc)

export function setSnapshot(id, node, size) {
  clearSnapshot(id)
  snapshots.set(id, { node, size, frames: framesOf(node) })
}

export function getSnapshot(id) {
  return snapshots.get(id) ?? null
}

export function clearSnapshot(id) {
  // The frozen frames go with the window they were cut from — otherwise every
  // minimise of a tool leaks another copy of its page.
  snapshots.get(id)?.frames.forEach((key) => frameDocs.delete(key))
  snapshots.delete(id)
}

/** Strip the live window's positioning so the clone lays out inside a tile. */
export function neutralise(node, size) {
  node.classList.remove('absolute', 'focused')
  node.style.cssText = [
    'position:static',
    'transform:none',
    'margin:0',
    'inset:auto',
    `width:${size.width}px`,
    `height:${size.height}px`,
    'max-width:none',
    'max-height:none',
    'pointer-events:none',
    'box-shadow:none',
  ].join(';')
  return node
}
