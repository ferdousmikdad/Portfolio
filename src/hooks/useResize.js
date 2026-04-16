import { useCallback, useRef } from 'react'
import useWindowStore from '@/store/windowStore'

import hResizeUrl  from '@/assets/icons/macHorizontalresize.svg?url'
import vResizeUrl  from '@/assets/icons/macVerticalresize.svg?url'
import corner1Url  from '@/assets/icons/macCorner-1.svg?url'
import corner2Url  from '@/assets/icons/macCorner-2.svg?url'

const MIN_W = 320
const MIN_H = 220

export const RESIZE_CURSORS = {
  right:          `url(${hResizeUrl}) 16 16, ew-resize`,
  left:           `url(${hResizeUrl}) 16 16, ew-resize`,
  bottom:         `url(${vResizeUrl}) 16 16, ns-resize`,
  top:            `url(${vResizeUrl}) 16 16, ns-resize`,
  'top-left':     `url(${corner1Url}) 16 16, nwse-resize`,
  'bottom-right': `url(${corner1Url}) 16 16, nwse-resize`,
  'top-right':    `url(${corner2Url}) 16 16, nesw-resize`,
  'bottom-left':  `url(${corner2Url}) 16 16, nesw-resize`,
}

// mx, my, mw, mh are framer-motion MotionValues — .set() updates the DOM
// instantly with zero React re-renders or spring interpolation.
export function useResize(id, mx, my, mw, mh) {
  const { updateSizePosition } = useWindowStore()
  const active = useRef(null)

  const startResize = useCallback((e, direction) => {
    e.stopPropagation()
    e.preventDefault()

    // Snapshot current values from motion values (already in sync with store)
    active.current = {
      direction,
      startX:  e.clientX,
      startY:  e.clientY,
      startW:  mw.get(),
      startH:  mh.get(),
      startPX: mx.get(),
      startPY: my.get(),
    }

    // Lock cursor for the whole drag — no flicker when mouse outruns the handle
    document.body.style.cursor     = RESIZE_CURSORS[direction]
    document.body.style.userSelect = 'none'

    const onMove = (ev) => {
      const r = active.current
      if (!r) return

      const dx = ev.clientX - r.startX
      const dy = ev.clientY - r.startY

      let newW  = r.startW
      let newH  = r.startH
      let newPX = r.startPX
      let newPY = r.startPY

      if (r.direction.includes('right'))  newW  = Math.max(MIN_W, r.startW + dx)
      if (r.direction.includes('bottom')) newH  = Math.max(MIN_H, r.startH + dy)
      if (r.direction.includes('left')) {
        newW  = Math.max(MIN_W, r.startW - dx)
        newPX = r.startPX + (r.startW - newW)
      }
      if (r.direction.includes('top')) {
        newH  = Math.max(MIN_H, r.startH - dy)
        newPY = r.startPY + (r.startH - newH)
      }

      // ── Direct DOM update via motion values — no React, no spring ──────────
      mw.set(newW)
      mh.set(newH)
      mx.set(newPX)
      my.set(newPY)
    }

    const onUp = () => {
      // Commit final geometry to store exactly once on release
      updateSizePosition(
        id,
        { width: mw.get(), height: mh.get() },
        { x: mx.get(),     y: my.get()      },
      )
      active.current             = null
      document.body.style.cursor     = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
  }, [id, mx, my, mw, mh, updateSizePosition])

  return { startResize }
}
