import { useCallback, useRef } from 'react'
import useWindowStore from '@/store/windowStore'

// ?raw gives the SVG source string — inlined as a data URI so the cursor
// never depends on an external HTTP fetch (works on Cloudflare, Vercel, etc.)
import hResizeRaw  from '@/assets/icons/macHorizontalresize.svg?raw'
import vResizeRaw  from '@/assets/icons/macVerticalresize.svg?raw'
import corner1Raw  from '@/assets/icons/macCorner-1.svg?raw'
import corner2Raw  from '@/assets/icons/macCorner-2.svg?raw'

const svgUri = (raw) => `data:image/svg+xml,${encodeURIComponent(raw)}`

const MIN_W = 320
const MIN_H = 220

export const RESIZE_CURSORS = {
  right:          `url("${svgUri(hResizeRaw)}") 16 16, ew-resize`,
  left:           `url("${svgUri(hResizeRaw)}") 16 16, ew-resize`,
  bottom:         `url("${svgUri(vResizeRaw)}") 16 16, ns-resize`,
  top:            `url("${svgUri(vResizeRaw)}") 16 16, ns-resize`,
  'top-left':     `url("${svgUri(corner1Raw)}") 16 16, nwse-resize`,
  'bottom-right': `url("${svgUri(corner1Raw)}") 16 16, nwse-resize`,
  'top-right':    `url("${svgUri(corner2Raw)}") 16 16, nesw-resize`,
  'bottom-left':  `url("${svgUri(corner2Raw)}") 16 16, nesw-resize`,
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
