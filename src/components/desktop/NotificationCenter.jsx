import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassLayers from '@/components/ui/LiquidGlass'
import useWindowStore from '@/store/windowStore'
import TOOLS from '@/data/tools'
import SYS from '@/data/systemProfile'
import useUpdateStore from '@/store/updateStore'
import { UPDATE_NAME, UPDATE_SIZE } from '@/data/softwareUpdate'
import { PANE_ICONS } from '@/data/settingsPanes'
import contactsUrl from '@/assets/icons/Contacts.png?url'
import terminalUrl from '@/assets/icons/terminal.svg?url'
import appStoreUrl from '@/assets/icons/App Store.png?url'

/* The notifications arrived when the site loaded; their time counts from
   then, as a Mac's do from when they came in. */
const ARRIVED = Date.now()
const ago = (now) => {
  const m = Math.floor((now - ARRIVED) / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

/* The visitor's own city, from their time zone ("Asia/Dhaka" → Dhaka) —
   the face shows their time, so it names their place. */
const CITY = (Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local').split('/').pop().replace(/_/g, ' ')

/* Tahoe's Clock widget: an analog face, the hour marks as numerals. */
function ClockWidget({ now }) {
  const h = now.getHours() % 12, m = now.getMinutes(), sec = now.getSeconds()
  const hourA = (h + m / 60) * 30, minA = (m + sec / 60) * 6, secA = sec * 6
  return (
    <div className="nc-widget nc-widget--small nc-clockw">
      <GlassLayers small />
      <svg viewBox="0 0 100 100" className="nc-clockw__face">
        <circle cx="50" cy="50" r="48" className="nc-clockw__dial" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = ((i + 1) * 30 - 90) * Math.PI / 180
          return <text key={i} x={50 + 37 * Math.cos(a)} y={50 + 37 * Math.sin(a) + 4} textAnchor="middle" className="nc-clockw__num">{i + 1}</text>
        })}
        <line x1="50" y1="50" x2="50" y2="27" className="nc-clockw__hour" transform={`rotate(${hourA} 50 50)`} />
        <line x1="50" y1="50" x2="50" y2="15" className="nc-clockw__min" transform={`rotate(${minA} 50 50)`} />
        <line x1="50" y1="58" x2="50" y2="12" className="nc-clockw__sec" transform={`rotate(${secA} 50 50)`} />
        <circle cx="50" cy="50" r="2.4" className="nc-clockw__pin" />
      </svg>
      <p className="nc-clockw__city">{CITY}</p>
    </div>
  )
}

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
    <div className="nc-widget nc-widget--small">
      <GlassLayers small />
      <p className="nc-widget__title">{MONTHS[month].toUpperCase()}</p>
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
  const openFinderAt = useWindowStore((s) => s.openFinderAt)

  useEffect(() => {
    if (!open) return
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    const onKey = (e) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => { clearInterval(t); window.removeEventListener('keydown', onKey) }
  }, [open, close])

  const notes = [
    /* macOS puts the pending update at the top of the stack and drops the
       card once it is installed, so this one is conditional rather than a
       permanent fixture. */
    ...(updatePending ? [{
      app: 'Software Update', icon: PANE_ICONS.softwareupdate,
      title: `${UPDATE_NAME} is available`,
      body: `A ${UPDATE_SIZE} update is ready to install.`,
      onClick: () => openSettingsAt('softwareupdate'),
    }] : []),
    {
      app: 'Contacts', icon: contactsUrl,
      title: SYS.status,
      body: 'Open to freelance projects, collaborations and full-time roles.',
      onClick: () => openWindow('about'),
    },
    {
      app: 'Terminal', icon: terminalUrl,
      title: 'Try `neofetch`',
      body: 'Prints the system profile. `help` lists everything else.',
      onClick: () => openWindow('terminal'),
    },
    {
      app: 'App Store', icon: appStoreUrl,
      title: `${TOOLS.length} tools installed`,
      body: 'Colour, image and text utilities — all built in-house.',
      onClick: () => openFinderAt('applications'),
    },
  ]

  const visible = notes.filter((n) => !dismissed.has(n.title))

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
              {visible.length === 0 && (
                <motion.p key="none" className="nc-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  No recent notifications
                </motion.p>
              )}
              {visible.map((n) => (
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
                  {/* Tahoe's card: the app's icon on the left, then the title
                      with the time at the trailing edge, then the message. */}
                  <button className="nc-note__hit" onClick={() => { n.onClick(); close() }}>
                    <img className="nc-note__icon" src={n.icon} alt={n.app} draggable={false} />
                    <span className="nc-note__text">
                      <span className="nc-note__top">
                        <span className="nc-note__title">{n.title}</span>
                        <span className="nc-note__time">{ago(now)}</span>
                      </span>
                      <span className="nc-note__body">{n.body}</span>
                    </span>
                  </button>
                </motion.div>
              ))}
              </AnimatePresence>

              {/* Widgets: two small ones side by side, as Tahoe lays them. */}
              <div className="nc-widgets">
                <CalendarWidget now={now} />
                <ClockWidget now={now} />
              </div>

              <button className="nc-edit" onClick={() => { openSettingsAt('desktopdock'); close() }}>
                Edit Widgets
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
