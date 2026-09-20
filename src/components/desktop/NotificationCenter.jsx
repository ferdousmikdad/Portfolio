import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassLayers from '@/components/ui/LiquidGlass'
import useWindowStore from '@/store/windowStore'
import TOOLS from '@/data/tools'
import SYS from '@/data/systemProfile'
import useUpdateStore from '@/store/updateStore'
import { UPDATE_NAME, UPDATE_SIZE } from '@/data/softwareUpdate'

/* ── Notification Centre ───────────────────────────────────────────────────
   The panel that slides in from the right edge: notifications on top, then
   the Today widgets under them.

   On a Mac it opens by clicking the menu-bar clock, so that is the trigger
   here too.

   There is no panel behind the cards: macOS floats each notification as its
   own frosted card over the desktop, and a single tinted slab holding them
   reads as a drawer instead.

   The notifications are real things about this desk rather than filler: what
   is actually installed, what the Terminal can actually do, and the one fact
   the whole portfolio exists to communicate.                               */

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']

function CalendarWidget({ now }) {
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()
  const first = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()

  const cells = [
    ...Array.from({ length: first }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ]

  return (
    <div className="nc-widget">
      <GlassLayers small />
      <p className="nc-widget__title">{MONTHS[month]} {year}</p>
      <div className="nc-cal">
        {DOW.map((d, i) => <span key={i} className="nc-cal__dow">{d}</span>)}
        {cells.map((d, i) => (
          <span key={i} className="nc-cal__day" data-today={d === today || undefined}>
            {d ?? ''}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function NotificationCenter() {
  const open = useWindowStore((s) => s.notificationCenter)
  const close = useWindowStore((s) => s.closeNotificationCenter)
  const openWindow = useWindowStore((s) => s.openWindow)
  const openSettingsAt = useWindowStore((s) => s.openSettingsAt)
  const updatePending = useUpdateStore((s) => s.stage !== 'installed')
  const [now, setNow] = useState(() => new Date())
  /* Dismissed notifications stay dismissed for the session, the way they do
     on a Mac — reopening the panel does not bring them back. */
  const [dismissed, setDismissed] = useState(() => new Set())

  useEffect(() => {
    if (!open) return
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 30_000)
    const onKey = (e) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => { clearInterval(t); window.removeEventListener('keydown', onKey) }
  }, [open, close])

  const notes = [
    /* macOS puts the pending update at the top of the stack and drops the
       card once it is installed, so this one is conditional rather than a
       permanent fixture. */
    ...(updatePending ? [{
      app: 'Software Update',
      title: `${UPDATE_NAME} is available`,
      body: `A ${UPDATE_SIZE} update is ready to install.`,
      onClick: () => openSettingsAt('softwareupdate'),
    }] : []),
    {
      app: 'Mikdad',
      title: SYS.status,
      body: 'Open to freelance projects, collaborations and full-time roles.',
      onClick: () => openWindow('contact'),
    },
    {
      app: 'Terminal',
      title: 'Try `neofetch`',
      body: 'Prints the system profile. `help` lists everything else.',
      onClick: () => openWindow('terminal'),
    },
    {
      app: 'Store',
      title: `${TOOLS.length} tools installed`,
      body: 'Colour, image and text utilities — all built in-house.',
      onClick: () => openWindow('shop'),
    },
  ]

  const time = `${String(now.getHours() % 12 || 12)}:${String(now.getMinutes()).padStart(2, '0')}`

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Click-away catcher. Transparent: macOS dims nothing when this
              opens, the desktop just keeps going behind it. */}
          <motion.div
            className="nc-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={close}
          />
          <motion.aside
            className="nc"
            initial={{ x: '108%' }}
            animate={{ x: 0 }}
            exit={{ x: '108%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            aria-label="Notification Centre"
          >
            <div className="nc__body">
              <AnimatePresence mode="popLayout">
              {notes.filter((n) => !dismissed.has(n.title)).map((n) => (
                /* A card, not a button: it carries its own close control, and
                   a button inside a button is not valid markup. */
                <motion.div
                  key={n.title}
                  className="nc-note"
                  layout
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                >
                  <GlassLayers small />
                  <button
                    className="nc-note__close"
                    aria-label={`Dismiss ${n.title}`}
                    onClick={() => setDismissed((d) => new Set(d).add(n.title))}
                  >
                    <svg width="7" height="7" viewBox="0 0 8 8" fill="none"
                         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M1 1l6 6M7 1L1 7" />
                    </svg>
                  </button>
                  <button className="nc-note__hit" onClick={() => { n.onClick(); close() }}>
                    <span className="nc-note__app">{n.app}</span>
                    <span className="nc-note__title">{n.title}</span>
                    <span className="nc-note__body">{n.body}</span>
                  </button>
                </motion.div>
              ))}
              </AnimatePresence>

              <div className="nc-widget nc-widget--clock">
                <GlassLayers small />
                <p className="nc-widget__title">Now</p>
                <p className="nc-clock">{time}</p>
              </div>

              <CalendarWidget now={now} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
