import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useWindowStore from '@/store/windowStore'
import useSettingsStore from '@/store/settingsStore'
import SYS from '@/data/systemProfile'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'

/* ── Lock screen ───────────────────────────────────────────────────────────
   The blurred wallpaper, the clock, the avatar and a password field.

   Any password gets you in — there is nothing here to protect, and a
   portfolio that actually locked people out would be a portfolio nobody
   reads. The field is the picture, not a gate, so it accepts anything and
   even an empty Return.

   Deliberately *not* wired as the site's entry point: the welcome card owns
   that moment, and replacing it is a product decision rather than a detail.
   This is reached from the Apple menu, the way ⌃⌘Q reaches it on a Mac.   */

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']

export default function LockScreen() {
  const locked = useWindowStore((s) => s.locked)
  const unlock = useWindowStore((s) => s.unlock)
  const background = useSettingsStore((s) => s.background)
  const wallpaper = useSettingsStore((s) => s.wallpaper)

  const [pw, setPw] = useState('')
  const [now, setNow] = useState(() => new Date())
  const inputRef = useRef(null)

  useEffect(() => {
    if (!locked) { setPw(''); return }
    inputRef.current?.focus()
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [locked])

  useEffect(() => {
    if (!locked) return
    const onKey = (e) => { if (e.key === 'Escape') unlock() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [locked, unlock])

  const h24 = now.getHours()
  const time = `${String(h24 % 12 || 12)}:${String(now.getMinutes()).padStart(2, '0')}`
  const date = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`

  return (
    <AnimatePresence>
      {locked && (
        <motion.div
          className="lock"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* The real wallpaper, blurred — a lock screen over a stand-in
              colour gives the game away immediately. */}
          {background === 'wallpaper' && (
            <div
              className="lock__paper"
              style={{ backgroundImage: `url('/${wallpaper}')` }}
            />
          )}
          <div className="lock__scrim" />

          <div className="lock__clock">
            <p className="lock__date">{date}</p>
            <p className="lock__time">{time}</p>
          </div>

          <form
            className="lock__auth"
            onSubmit={(e) => { e.preventDefault(); unlock() }}
          >
            <img className="lock__avatar" src={mikdadHeadUrl} alt="" draggable={false} />
            <p className="lock__user">{SYS.name}</p>

            <div className="lock__field">
              <input
                ref={inputRef}
                type="password"
                value={pw}
                placeholder="Enter Password"
                onChange={(e) => setPw(e.target.value)}
                /* Handled explicitly rather than left to the form's implicit
                   submission, which did not fire reliably here. Return is how
                   anyone actually unlocks a Mac — it should not depend on a
                   browser behaviour we are not in control of. */
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); unlock() } }}
                aria-label="Password"
              />
              <button type="submit" className="lock__go" aria-label="Unlock">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
                     stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5" />
                </svg>
              </button>
            </div>

            <p className="lock__hint">Touch ID or Enter Password</p>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
