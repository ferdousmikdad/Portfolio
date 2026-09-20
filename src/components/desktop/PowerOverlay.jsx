import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useWindowStore from '@/store/windowStore'
import useSoundStore from '@/store/soundStore'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'

/* ── Sleep and Restart ─────────────────────────────────────────────────────
   The two Apple-menu rows that had been sitting there disabled since the
   menu bar was built.

   **Sleep** fades the display down, the way a Mac's backlight ramps off
   rather than cutting. Any input brings it back — but not for the first
   moment: the click that chose "Sleep" is still settling, and the pointer
   has not finished moving, so an immediately-armed wake listener fires on
   the user's own gesture and the machine never sleeps at all. After the
   guard, the first key or click wakes it to the **lock screen**, which is
   where a Mac with the default settings puts you.

   **Restart** asks first — that is what the ellipsis in "Restart…" promises
   — then fades out, runs a boot bar, and comes back with every window
   closed and the startup chime playing. Closing the windows is the part
   that sells it; a restart that left your Finder open would be a wipe of
   the screen and nothing more.

   While either is running this swallows keyboard and mouse input in the
   capture phase, so F4 does not open Launchpad behind a black screen.    */

const SLEEP_FADE   = 1200   // ms for the display to ramp down
const WAKE_GUARD   = 900    // ms before input counts as "wake me"
const RESTART_FADE = 700    // ms of black before the boot bar appears
const BOOT_MS      = 2800   // ms the bar takes to fill

export default function PowerOverlay() {
  const power   = useWindowStore((s) => s.power)
  const wake    = useWindowStore((s) => s.wake)
  const finish  = useWindowStore((s) => s.finishRestart)
  const play    = useSoundStore((s) => s.play)

  const [booting, setBooting] = useState(false)

  /* ── Sleep: arm the wake listeners once the guard has passed ──────────── */
  useEffect(() => {
    if (power !== 'sleeping') return
    let armed = false
    const arm = setTimeout(() => { armed = true }, WAKE_GUARD)

    const swallow = (e) => {
      e.stopPropagation()
      if (!armed) return
      e.preventDefault()
      wake()
    }
    // Capture phase on window runs before every other listener in the app,
    // so nothing underneath reacts to the keys that wake the machine.
    window.addEventListener('keydown',   swallow, true)
    window.addEventListener('mousedown', swallow, true)
    window.addEventListener('wheel',     swallow, { capture: true, passive: false })
    return () => {
      clearTimeout(arm)
      window.removeEventListener('keydown',   swallow, true)
      window.removeEventListener('mousedown', swallow, true)
      window.removeEventListener('wheel',     swallow, { capture: true })
    }
  }, [power, wake])

  /* ── Restart: black, then the boot bar, then the desktop ──────────────── */
  useEffect(() => {
    if (power !== 'restarting') { setBooting(false); return }
    const swallow = (e) => { e.stopPropagation(); e.preventDefault() }
    window.addEventListener('keydown',   swallow, true)
    window.addEventListener('mousedown', swallow, true)

    const a = setTimeout(() => { setBooting(true); play('chime') }, RESTART_FADE)
    const b = setTimeout(() => { setBooting(false); finish() }, RESTART_FADE + BOOT_MS)
    return () => {
      clearTimeout(a); clearTimeout(b)
      window.removeEventListener('keydown',   swallow, true)
      window.removeEventListener('mousedown', swallow, true)
    }
  }, [power, finish, play])

  return (
    <AnimatePresence>
      {power && (
        <motion.div
          className="pwr"
          data-mode={power}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          /* Down slowly like a backlight, back up quickly — the asymmetry is
             what makes waking feel like waking rather than a cross-fade. */
          transition={{
            duration: (power === 'sleeping' ? SLEEP_FADE : RESTART_FADE) / 1000,
            ease: 'easeInOut',
          }}
        >
          <AnimatePresence>
            {booting && (
              <motion.div
                className="pwr__boot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.5 } }}
                transition={{ duration: 0.4 }}
              >
                <img className="pwr__logo" src={mikdadHeadUrl} alt="" draggable={false} />
                <div className="pwr__bar">
                  <motion.span
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: (BOOT_MS - 500) / 1000, ease: 'easeInOut' }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
