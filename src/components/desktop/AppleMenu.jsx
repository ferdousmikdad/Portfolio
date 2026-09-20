import { motion } from 'framer-motion'
import GlassLayers from '@/components/ui/LiquidGlass'
import useWindowStore from '@/store/windowStore'

/* ── Apple menu ────────────────────────────────────────────────────────────
   The first menu on the bar, the one that belongs to the system rather than
   to whatever app is in front. Deliberately short: only items that actually
   do something. macOS also lists Sleep, Force Quit and Recent Items here —
   those are separate roadmap entries (F24, F22), and a menu full of dead
   rows reads worse than a short one that works.

   Uses the .topbar-panel material, which was already in the stylesheet with
   glass support and no consumer.                                          */

export default function AppleMenu({ onClose }) {
  const { openWindow, navigate } = useWindowStore()

  const run = (fn) => () => { fn(); onClose?.() }

  const items = [
    { label: 'About This Mac', onClick: run(() => openWindow('about-mac')) },
    { sep: true },
    { label: 'System Settings…', onClick: run(() => openWindow('settings')) },
    { label: 'App Store…',       onClick: run(() => openWindow('shop')) },
    { sep: true },
    { label: 'Home',             onClick: run(() => navigate('home')) },
  ]

  return (
    <motion.div
      className="topbar-panel apple-menu"
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.13 }}
      role="menu"
    >
      <GlassLayers small />
      {items.map((item, i) =>
        item.sep ? (
          <div className="apple-menu__sep" key={`sep-${i}`} />
        ) : (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            className="apple-menu__item"
            onClick={item.onClick}
          >
            {item.label}
          </button>
        ),
      )}
    </motion.div>
  )
}
