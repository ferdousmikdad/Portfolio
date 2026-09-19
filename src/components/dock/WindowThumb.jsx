import { useLayoutEffect, useRef } from 'react'
import { getSnapshot, neutralise } from '@/utils/windowSnapshots'
import { hydrateFrames } from '@/utils/genie'
import windowIcon from '@/data/windowIcons'

/* Proportions measured off the reference artwork, all of them against the
   dock's own tile height so they hold at every magnification. The badge stays
   the size an app icon's badge is; the snapshot is deliberately smaller than a
   full tile, the way a minimised window reads in the dock — a picture parked
   beside the icons rather than another icon among them. The badge overhangs
   the snapshot: 14% of its own width past the right edge, 19% past the
   bottom. */
const BADGE      = 0.38   // of tile height
const SNAP       = 0.70   // of tile height — the snapshot alone
const OVER_RIGHT = 0.14   // of badge width
const OVER_DOWN  = 0.19   // of badge height
const MAX_ASPECT = 1.4    // windows are wider than this; the tile is not

/** Composite width for a window of this aspect, at the given tile height. */
export function thumbWidth(aspect, height) {
  const snapH = height * SNAP
  const snapW = snapH * Math.min(Math.max(aspect, 1), MAX_ASPECT)
  return Math.round(snapW + height * BADGE * OVER_RIGHT)
}

/**
 * A minimised window's dock tile: the window itself, scaled down, with the app
 * icon badged over its bottom-right corner — the way macOS draws them.
 *
 * `width` is the composite footprint; `height` is the dock's tile height, off
 * which both the snapshot and the badge are sized. The composite ends up
 * shorter than a tile, and the dock centres it against the icons.
 */
export default function WindowThumb({ id, width, height }) {
  const hostRef = useRef(null)

  const badge = height * BADGE
  const snapH = height * SNAP
  const snapW = width - badge * OVER_RIGHT
  const boxH  = snapH + badge * OVER_DOWN

  useLayoutEffect(() => {
    const host = hostRef.current
    const snap = getSnapshot(id)
    if (!host || !snap) return

    const copy = neutralise(snap.node.cloneNode(true), snap.size)
    // cover, not contain: a letterboxed window reads as a floating card
    const scale = Math.max(snapW / snap.size.width, snapH / snap.size.height)
    copy.style.transformOrigin = 'top left'
    copy.style.transform = `scale(${scale})`

    host.replaceChildren(copy)
    // A frame the raster could not draw falls back to a live one here, where
    // a single tile can afford it.
    hydrateFrames(copy)
    return () => host.replaceChildren()
  }, [id, snapW, snapH])

  return (
    <span className="dock-thumb" style={{ width, height: boxH }}>
      <span
        ref={hostRef}
        className="dock-thumb__shot"
        style={{ width: snapW, height: snapH, borderRadius: Math.max(3, snapH * 0.13) }}
      />
      <img
        className="dock-thumb__badge"
        src={windowIcon(id)}
        style={{ width: badge, height: badge }}
        alt=""
        draggable={false}
      />
    </span>
  )
}
