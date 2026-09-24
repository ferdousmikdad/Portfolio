import { useState } from 'react'
import { motion, useDragControls } from 'framer-motion'
import WindowControls from '@/components/window/WindowControls'
import useWindowStore from '@/store/windowStore'
import { appNameFor } from '@/data/menuBar'
import windowIcon from '@/data/windowIcons'
import finderUrl from '@/assets/icons/finder.svg?url'

/* ── Force Quit Applications (⌥⌘⎋) ────────────────────────────────────────
   The real panel: a line of instructions, a list of every running app with
   its icon — Finder always at the top, since it is always running — a note
   about the shortcut, and one button. With Finder selected the button reads
   "Relaunch", because Finder cannot be quit, only restarted.

   Here an "app" is an open window, grouped by the app it belongs to, and
   force-quitting closes its windows.                                      */

export default function ForceQuit({ onClose }) {
  const windows     = useWindowStore((s) => s.windows)
  const closeWindow = useWindowStore((s) => s.closeWindow)
  const openWindow  = useWindowStore((s) => s.openWindow)
  const drag = useDragControls()

  // Running apps: one row per app name, holding the ids of its windows.
  const apps = []
  for (const w of windows.filter((x) => x.isOpen)) {
    const name = appNameFor(w.id)
    const row = apps.find((a) => a.name === name)
    if (row) row.ids.push(w.id)
    else apps.push({ name, ids: [w.id], icon: windowIcon(w.id) })
  }
  const finder = apps.find((a) => a.name === 'Finder')
  const list = [
    { name: 'Finder', ids: finder?.ids ?? [], icon: finderUrl },
    ...apps.filter((a) => a.name !== 'Finder').sort((a, b) => a.name.localeCompare(b.name)),
  ]

  const [selected, setSelected] = useState('Finder')
  const current = list.find((a) => a.name === selected) ?? list[0]
  const isFinder = current.name === 'Finder'

  const act = () => {
    current.ids.forEach(closeWindow)
    // Relaunch: Finder comes straight back with a fresh window.
    if (isFinder) setTimeout(() => openWindow('finder'), 350)
    else setSelected('Finder')
  }

  return (
    <motion.div
      className="fq-window"
      drag
      dragListener={false}
      dragControls={drag}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="fq-titlebar" onPointerDown={(e) => drag.start(e)}>
        <WindowControls onClose={onClose} minimizeDisabled maximizeDisabled />
        <span className="fq-title">Force Quit Applications</span>
      </div>

      <p className="fq-text">
        If an app doesn’t respond for a while, select its name and click Force Quit.
      </p>

      <div className="fq-list" role="listbox">
        {list.map((a) => (
          <button
            key={a.name}
            role="option"
            aria-selected={a.name === current.name}
            className={`fq-row${a.name === current.name ? ' fq-row--on' : ''}`}
            onClick={() => setSelected(a.name)}
            onDoubleClick={act}
          >
            <img src={a.icon} alt="" draggable={false} />
            <span>{a.name}</span>
          </button>
        ))}
      </div>

      <p className="fq-note">You can open this window by pressing Command-Option-Escape.</p>

      <div className="fq-actions">
        <button className="fq-btn" onClick={act}>{isFinder ? 'Relaunch' : 'Force Quit'}</button>
      </div>
    </motion.div>
  )
}
