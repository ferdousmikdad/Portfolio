import { createPortal } from 'react-dom'
import useDragStore from '@/store/dragStore'

/* The translucent copy of a file that rides under the cursor while it is
   being dragged out of a window. macOS draws the icon at its source size,
   semi-transparent, centred on the pointer, with the name still attached —
   and it snaps to full opacity nowhere, so the original always reads as the
   thing that still exists. Mounted once, at the top of the desktop. */
export default function DragGhost() {
  const payload = useDragStore((s) => s.payload)
  const point   = useDragStore((s) => s.point)
  const ghost   = useDragStore((s) => s.ghost)
  const over    = useDragStore((s) => s.overTrash)

  if (!payload || !point || !ghost) return null

  return createPortal(
    <div className="drag-ghost" style={{ left: point.x, top: point.y }}>
      <img src={payload.icon} alt="" draggable={false} style={{ opacity: over ? 0.95 : 0.72 }} />
      <span className="drag-ghost__label">{payload.name}</span>
    </div>,
    document.body,
  )
}
