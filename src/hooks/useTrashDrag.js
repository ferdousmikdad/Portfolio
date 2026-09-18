import { useRef, useCallback } from 'react'
import useDragStore from '@/store/dragStore'

const THRESHOLD = 5   // px of travel before a press becomes a drag

/**
 * Makes an element inside a window draggable to the dock's Trash.
 *
 *   const drag = useTrashDrag(() => fileFor(tool), { onDrop: trash })
 *   <button {...drag.handlers} onClick={drag.guard(select)} />
 *
 * `makePayload` is called at the moment the drag starts, so it can read
 * current state. `onDrop` fires only when the pointer let go over the Trash.
 *
 * The press does not become a drag until the pointer has travelled a little,
 * so a plain click still selects — and `guard` swallows the click that the
 * browser fires after a real drag, which would otherwise select the row the
 * user just threw away.
 */
export default function useTrashDrag(makePayload, { onDrop, enabled = true } = {}) {
  const begin   = useDragStore((s) => s.begin)
  const move    = useDragStore((s) => s.move)
  const end     = useDragStore((s) => s.end)
  const cancel  = useDragStore((s) => s.cancel)

  const start   = useRef(null)
  const active  = useRef(false)
  const dragged = useRef(false)

  const finish = useCallback(() => {
    start.current  = null
    active.current = false
  }, [])

  const onPointerDown = useCallback((e) => {
    if (!enabled || e.button !== 0) return
    start.current  = { x: e.clientX, y: e.clientY }
    dragged.current = false

    const onMove = (ev) => {
      if (!start.current) return
      const point = { x: ev.clientX, y: ev.clientY }
      if (!active.current) {
        const far = Math.hypot(point.x - start.current.x, point.y - start.current.y)
        if (far < THRESHOLD) return
        const payload = makePayload()
        if (!payload) { start.current = null; return }
        active.current  = true
        dragged.current = true
        begin(payload, point, { ghost: true })
      }
      move(point)
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      if (active.current) {
        const hit = end()
        if (hit) onDrop?.(hit)
      }
      finish()
    }

    const onCancel = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      cancel()
      finish()
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
  }, [enabled, makePayload, onDrop, begin, move, end, cancel, finish])

  /* Wrap a click handler so it is skipped when the press was really a drag. */
  const guard = useCallback((fn) => (e) => {
    if (dragged.current) { dragged.current = false; e.preventDefault(); return }
    fn?.(e)
  }, [])

  return { handlers: { onPointerDown }, guard }
}
