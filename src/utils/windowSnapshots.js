/* Snapshots of minimised windows, for their dock tiles.

   macOS shows a shrunken picture of the window itself in the dock, not the app
   icon. There is no way to rasterise a DOM subtree without a canvas library, so
   the snapshot is the window's own markup, cloned at the moment it was
   minimised and re-cloned into the tile. The app's stylesheet still matches the
   cloned classes, so it renders exactly as it looked.

   Kept outside React state: these are DOM nodes, not serialisable data. */

const snapshots = new Map()

export function setSnapshot(id, node, size) {
  snapshots.set(id, { node, size })
}

export function getSnapshot(id) {
  return snapshots.get(id) ?? null
}

export function clearSnapshot(id) {
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
