import { useLayoutEffect, useRef } from 'react'
import { getSnapshot, neutralise } from '@/utils/windowSnapshots'
import windowIcon from '@/data/windowIcons'

/* Proportions measured off the reference artwork: the badge is 38% of the
   composite height and overhangs the snapshot — 14% of its own width past the
   right edge, 19% past the bottom. The snapshot shrinks to make room, so the
   snapshot plus its badge together occupy one icon's worth of dock height. */
const BADGE      = 0.38   // of composite height
const OVER_RIGHT = 0.14   // of badge width
const OVER_DOWN  = 0.19   // of badge height
const MAX_ASPECT = 1.4    // windows are wider than this; the tile is not

/** Composite width for a window of this aspect, at the given tile height. */
export function thumbWidth(aspect, height) {
  const badge = height * BADGE
  const snapH = height - badge * OVER_DOWN
  const snapW = snapH * Math.min(Math.max(aspect, 1), MAX_ASPECT)
  return Math.round(snapW + badge * OVER_RIGHT)
}

/**
 * A minimised window's dock tile: the window itself, scaled down, with the app
 * icon badged over its bottom-right corner — the way macOS draws them.
 *
 * `width`/`height` are the composite footprint; the snapshot sits top-left
 * inside it and the badge hangs off its corner.
 */
export default function WindowThumb({ id, width, height }) {
  const hostRef = useRef(null)

  const badge = height * BADGE
  const snapH = height - badge * OVER_DOWN
  const snapW = width - badge * OVER_RIGHT

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
    return () => host.replaceChildren()
  }, [id, snapW, snapH])

  return (
    <span className="dock-thumb" style={{ width, height }}>
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
