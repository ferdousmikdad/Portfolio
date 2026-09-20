import { useEffect, useRef } from 'react'
import useWindowStore from '@/store/windowStore'
import useSettingsStore from '@/store/settingsStore'

/* ── Hot corners ───────────────────────────────────────────────────────────
   Push the pointer into a corner and something happens.

   Two guards, both of which exist because a corner that fires on a passing
   cursor is worse than no corner at all:

   • A dwell. The pointer has to *stay* in the corner, not skim through it on
     the way to somewhere else. macOS fires immediately, but macOS corners
     are opt-in and a visitor here has not opted into anything.
   • A latch. Once a corner has fired it will not fire again until the
     pointer has left the zone, so sitting still does not retrigger it.    */

const ZONE = 8      // px from the corner that counts as being in it
const DWELL = 300   // ms the pointer must stay there

export default function useHotCorners() {
  const hotCorners = useSettingsStore((s) => s.hotCorners)
  const store = useWindowStore
  const timer = useRef(null)
  const armed = useRef(true)

  useEffect(() => {
    const run = (action) => {
      const w = store.getState()
      switch (action) {
        case 'mission':   w.toggleMissionControl(); break
        case 'launchpad': w.toggleLaunchpad(); break
        case 'saver':     w.startScreenSaver(); break
        case 'lock':      w.lock(); break
        case 'notes':     w.toggleNotificationCenter(); break
        case 'sleep':     w.sleep(); break
        /* Show Desktop: everything out of the way, nothing destroyed —
           minimise rather than close, so it is one click to come back. */
        case 'desktop': {
          w.windows
            .filter((win) => win.isOpen && !win.isMinimized)
            .forEach((win) => w.minimizeWindow(win.id))
          break
        }
        default: break
      }
    }

    const cornerAt = (x, y) => {
      const nearL = x <= ZONE
      const nearR = x >= window.innerWidth - ZONE
      const nearT = y <= ZONE
      const nearB = y >= window.innerHeight - ZONE
      if (nearT && nearL) return 'topLeft'
      if (nearT && nearR) return 'topRight'
      if (nearB && nearL) return 'bottomLeft'
      if (nearB && nearR) return 'bottomRight'
      return null
    }

    const onMove = (e) => {
      const corner = cornerAt(e.clientX, e.clientY)
      if (!corner) {
        clearTimeout(timer.current)
        timer.current = null
        armed.current = true          // left the zone — ready to fire again
        return
      }
      const action = hotCorners?.[corner] ?? 'none'
      if (action === 'none' || !armed.current || timer.current) return
      timer.current = setTimeout(() => {
        timer.current = null
        armed.current = false
        run(action)
      }, DWELL)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      clearTimeout(timer.current)
      window.removeEventListener('mousemove', onMove)
    }
  }, [hotCorners, store])
}
