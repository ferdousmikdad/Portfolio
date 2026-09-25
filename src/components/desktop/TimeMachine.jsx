import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useWindowStore from '@/store/windowStore'
import SFSymbol from '@/components/ui/SFSymbol'
import BACKUPS from '@/data/timeMachine'

/* ── Time Machine ───────────────────────────────────────────────────────────
   Entered full screen, the way macOS enters it: the desktop drops away and
   the backups stand in a stack receding into the distance, newest in front,
   with the timeline of their dates down the right edge. The arrows and the
   timeline travel through them; Cancel leaves; Open shows the backup at full
   size in Preview.

   What makes this one different from a Mac's: the backups are of the
   portfolio itself. Each is a real screenshot of the site as it was at that
   commit — so travelling back is walking through how it was designed.     */

const VISIBLE = 4            // how many backups stand in the stack behind the current one
const fmt = (d) => new Date(d + 'T12:00:00').toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })
// Day and month, with the year shortened — three backups share April 2026.
const fmtShort = (d) => {
  const t = new Date(d + 'T12:00:00')
  return `${t.toLocaleDateString([], { month: 'short', day: 'numeric' })} ’${String(t.getFullYear()).slice(2)}`
}

export default function TimeMachine() {
  const open  = useWindowStore((s) => s.timeMachine)
  const close = useWindowStore((s) => s.closeTimeMachine)
  const openProjectPreview = useWindowStore((s) => s.openProjectPreview)
  const [index, setIndex] = useState(0)          // 0 = newest
  const wheel = useRef({ sum: 0, stepped: false, quiet: null })

  useEffect(() => { if (open) setIndex(0) }, [open])

  const last  = BACKUPS.length - 1
  const older = () => setIndex((i) => Math.min(last, i + 1))
  const newer = () => setIndex((i) => Math.max(0, i - 1))
  const current = BACKUPS[index]

  const openCurrent = () => {
    close()
    openProjectPreview({
      id: `tm-${current.id}`,
      title: `Portfolio — ${fmt(current.date)}`,
      subtitle: current.note,
      category: current.commit === 'today' ? 'Current version' : `Commit ${current.commit}`,
      preview: current.image,
      image: current.image,
      thumbnail: current.image,
    })
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close() }
      // Up / Left go back in time, Down / Right come forward.
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft')    { e.preventDefault(); older() }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); newer() }
      if (e.key === 'Home') { e.preventDefault(); setIndex(0) }
      if (e.key === 'End')  { e.preventDefault(); setIndex(last) }
      if (e.key === 'Enter')     { e.preventDefault(); openCurrent() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  /* Scrolling travels one backup per gesture. A trackpad sends dozens of
     small deltas per swipe (and keeps sending momentum after the finger
     lifts), a mouse wheel a few big ones. Add them up and step once the total
     passes a threshold — then ignore everything until the scrolling has
     been quiet for a moment, which is when the gesture has really ended.
     One swipe is always exactly one backup. */
  const onWheel = (e) => {
    const w = wheel.current
    clearTimeout(w.quiet)
    w.quiet = setTimeout(() => { w.sum = 0; w.stepped = false }, 180)
    if (w.stepped) return
    w.sum += e.deltaY
    if (Math.abs(w.sum) < 40) return
    if (w.sum < 0) older(); else newer()
    w.stepped = true
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="tm"
          onWheel={onWheel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Which backup is in front, as Time Machine names it along the top. */}
          <div className="tm__top">
            <p className="tm__date">{index === 0 ? 'Today (Now)' : fmt(current.date)}</p>
            <p className="tm__title">{current.title} · {index + 1} of {BACKUPS.length}</p>
          </div>

          {/* The two big buttons either side of the stack — the obvious way
              through, for anyone who does not reach for the keyboard. */}
          <button className="tm__side tm__side--older" onClick={older} disabled={index === last} aria-label="Older backup">
            <span className="tm__side-disc"><SFSymbol name="chevron.left" size={20} /></span>
            <span>Older</span>
          </button>
          <button className="tm__side tm__side--newer" onClick={newer} disabled={index === 0} aria-label="Newer backup">
            <span className="tm__side-disc"><SFSymbol name="chevron.right" size={20} /></span>
            <span>Newer</span>
          </button>

          <div className="tm__stage">
            {BACKUPS.map((b, i) => {
              const k = i - index                      // 0 = front, >0 behind, <0 already passed
              const hidden = k < 0 || k > VISIBLE
              return (
                <motion.button
                  key={b.id}
                  className="tm__card"
                  style={{ zIndex: 100 - i, pointerEvents: k === 0 ? 'auto' : k > 0 && k <= VISIBLE ? 'auto' : 'none' }}
                  initial={false}
                  animate={{
                    y: k < 0 ? 140 : -k * 30,
                    scale: k < 0 ? 1.12 : 1 - k * 0.075,
                    opacity: hidden ? 0 : 1 - k * 0.13,
                    filter: k > 0 ? `brightness(${1 - k * 0.1})` : 'brightness(1)',
                  }}
                  transition={{ type: 'spring', stiffness: 170, damping: 24, mass: 0.9 }}
                  onClick={() => (k === 0 ? openCurrent() : setIndex(i))}
                  title={k === 0 ? 'Open in Preview' : fmt(b.date)}
                  aria-label={`${b.title}, ${fmt(b.date)}`}
                >
                  <img src={b.image} alt="" draggable={false} />
                </motion.button>
              )
            })}
          </div>

          <p className="tm__note">{current.note}</p>

          {/* The timeline down the right edge: every backup's date, the one in
              front highlighted, the arrows above and below. */}
          <div className="tm__rail">
            <button className="tm__arrow" onClick={older} disabled={index === BACKUPS.length - 1} title="Older (↑)">
              <SFSymbol name="chevron.up" size={14} />
            </button>
            <ol className="tm__timeline">
              {BACKUPS.map((b, i) => (
                <li key={b.id}>
                  <button className="tm__tick" data-on={i === index || undefined} onClick={() => setIndex(i)}>
                    <span className="tm__tick-text">
                      <span className="tm__tick-date">{i === 0 ? 'Today' : fmtShort(b.date)}</span>
                      <span className="tm__tick-title">{b.title}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <button className="tm__arrow" onClick={newer} disabled={index === 0} title="Newer (↓)">
              <SFSymbol name="chevron.down" size={14} />
            </button>
          </div>

          <div className="tm__bar">
            <button className="tm__btn" onClick={close}>Cancel</button>
            <button className="tm__btn tm__btn--primary" onClick={openCurrent}>Open</button>
          </div>
          <p className="tm__hint">← → or ↑ ↓ to travel · Return to open · Esc to leave</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
