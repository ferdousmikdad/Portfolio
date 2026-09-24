import { useRef } from 'react'
import { motion, useDragControls } from 'framer-motion'
import WindowControls from '@/components/window/WindowControls'
import { TAGS } from '@/data/projects'

/* ── Get Info (⌘I) ─────────────────────────────────────────────────────────
   Finder's info window for one item: a narrow window, the item's large icon
   beside its name, size and modified date, then its tags and the General
   facts — Kind, Size, Where, Created, Modified — as label/value rows with the
   labels right-aligned in secondary grey, the way every AppKit form sets
   them. It is a window of its own, so it drags by its title bar and closes
   from its red light; minimise and zoom stay dimmed, as they are in Finder.

   `item` is { name, kind, icon, size, where, created, modified, tags }.   */

const fmt = (d) => d
  ? new Date(d).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })
  : '—'

const KIND = { document: 'Plain Text Document', folder: 'Folder', image: 'Image', pdf: 'PDF document' }

export default function GetInfo({ item, onClose }) {
  const drag = useDragControls()
  const start = useRef({
    x: Math.round(window.innerWidth / 2 - 150 + Math.random() * 60),
    y: Math.round(90 + Math.random() * 40),
  })

  if (!item) return null
  const tags = (item.tags ?? []).map((id) => TAGS.find((t) => t.id === id)).filter(Boolean)

  return (
    <motion.div
      className="gi-window"
      style={{ left: start.current.x, top: start.current.y }}
      drag
      dragListener={false}
      dragControls={drag}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      onMouseDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      <div className="gi-titlebar" onPointerDown={(e) => drag.start(e)}>
        <WindowControls onClose={onClose} onMinimize={() => {}} onMaximize={() => {}} maximizeDisabled minimizeDisabled />
        <span className="gi-title">{item.name} Info</span>
      </div>

      <div className="gi-head">
        <img src={item.icon} alt="" draggable={false} />
        <div className="gi-head__text">
          <p className="gi-head__name">{item.name}</p>
          <p className="gi-head__meta">{item.size ?? '—'}</p>
          <p className="gi-head__meta">Modified: {fmt(item.modified)}</p>
        </div>
      </div>

      <div className="gi-section">
        <p className="gi-section__title">Tags</p>
        <div className="gi-tags">
          {tags.length
            ? tags.map((t) => <span key={t.id} className="gi-tag"><i style={{ background: t.color }} />{t.label}</span>)
            : <span className="gi-muted">Add Tags…</span>}
        </div>
      </div>

      <div className="gi-section">
        <p className="gi-section__title">General</p>
        <dl className="gi-grid">
          <dt>Kind:</dt><dd>{KIND[item.kind] ?? item.kind}</dd>
          <dt>Size:</dt><dd>{item.size ?? '—'}</dd>
          <dt>Where:</dt><dd>{item.where}</dd>
          <dt>Created:</dt><dd>{fmt(item.created)}</dd>
          <dt>Modified:</dt><dd>{fmt(item.modified)}</dd>
        </dl>
      </div>

      <div className="gi-section">
        <p className="gi-section__title">Name &amp; Extension</p>
        <div className="gi-field">{item.name}</div>
      </div>
    </motion.div>
  )
}
