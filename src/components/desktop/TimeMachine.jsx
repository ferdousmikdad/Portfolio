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

   What makes this one different from a Mac\x27s: the backups are of the
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
  const wheelLock = useRef(0)

  useEffect(() => { if (open) setIndex(0) }, [open])

  const older = () => setIndex((i) => Math.min(BACKUPS.length - 1, i + 1))
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
      if (e.key === 'ArrowUp')   { e.preventDefault(); older() }
      if (e.key === 'ArrowDown') { e.preventDefault(); newer() }
      if (e.key === 'Enter')     { e.preventDefault(); openCurrent() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // Scrolling travels one backup per notch — away from you is back in time.
  const onWheel = (e) => {
    const now = Date.now()
    if (now - wheelLock.current < 280 || Math.abs(e.deltaY) < 8) return
    wheelLock.current = now
    if (e.deltaY < 0) older(); else newer()
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
            <p className="tm__title">{current.title}</p>
          </div>

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

          {/* The timeline down the right edge: every backup\x27s date, the one in
              front highlighted, the arrows above and below. */}
          <div className="tm__rail">
            <button className="tm__arrow" onClick={older} disabled={index === BACKUPS.length - 1} title="Older (↑)">
              <SFSymbol name="chevron.up" size={14} />
            </button>
            <ol className="tm__timeline">
              {BACKUPS.map((b, i) => (
                <li key={b.id}>
                  <button className="tm__tick" data-on={i === index || undefined} onClick={() => setIndex(i)}>
                    {i === 0 ? 'Today' : fmtShort(b.date)}
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}
