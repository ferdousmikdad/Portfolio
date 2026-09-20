import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassLayers from '@/components/ui/LiquidGlass'
import useWindowStore from '@/store/windowStore'
import { GROUPS, CLAIMED } from '@/data/shortcuts'

/* ── Keyboard shortcuts ────────────────────────────────────────────────────
   ⌘/ puts up the whole list.

   It is a sheet rather than a window on purpose: it is a reference you read
   and dismiss, not something you arrange next to your work, and a window
   would end up in Mission Control and the dock for no reason.

   The footer is the honest half. This portfolio's menus draw ⌘W / ⌘M / ⌘Q /
   ⌘, the way AppKit does, but the browser and macOS take those before a web
   page ever sees them. A shortcuts sheet that listed them would be teaching
   visitors keys that do nothing, so it names them as claimed instead.     */

export default function ShortcutsOverlay() {
  const open  = useWindowStore((s) => s.shortcuts)
  const close = useWindowStore((s) => s.closeShortcuts)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); close() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="ks"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}
        >
          <motion.div
            className="ks__sheet"
            role="dialog"
            aria-label="Keyboard Shortcuts"
            initial={{ scale: 0.96, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: 6, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          >
            <GlassLayers />

            <header className="ks__head">
              <h2 className="ks__title">Keyboard Shortcuts</h2>
              <button type="button" className="ks__close" aria-label="Close" onClick={close}>
                <svg width="9" height="9" viewBox="0 0 8 8" fill="none"
                     stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                  <path d="M1 1l6 6M7 1L1 7" />
                </svg>
              </button>
            </header>

            <div className="ks__body">
              {GROUPS.map((g) => (
                <section className="ks__group" key={g.title}>
                  <h3 className="ks__group-title">{g.title}</h3>
                  <ul>
                    {g.items.map((it) => (
                      <li className="ks__row" key={`${g.title}-${it.label}-${it.keys.join('')}`}>
                        <span className="ks__keys">
                          {it.keys.map((k, i) => <kbd key={i}>{k}</kbd>)}
                        </span>
                        <span className="ks__label">
                          {it.label}
                          {it.note && <em className="ks__note"> — {it.note}</em>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <footer className="ks__foot">
              {CLAIMED.map((k) => <kbd key={k}>{k}</kbd>)}
              <span>
                are drawn in the menus but never reach a web page — the browser
                and macOS take them first. Use the menu items instead.
              </span>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
