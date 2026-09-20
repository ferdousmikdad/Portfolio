import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassLayers from '@/components/ui/LiquidGlass'
import useWindowStore from '@/store/windowStore'
import useDragStore from '@/store/dragStore'
import useSettingsStore from '@/store/settingsStore'
import SYS from '@/data/systemProfile'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'

/* ── AirDrop ───────────────────────────────────────────────────────────────
   Drag a desktop file anywhere near the avatar and it "sends" to Mikdad,
   then opens the contact card.

   Nothing is transferred and nothing is claimed to be: the sheet says the
   file stayed put. The joke is the handshake, and the useful part is where
   it lands — a visitor who just tried to send something is exactly the
   visitor who wants the contact details.

   The target only exists while a drag is in flight, which is how AirDrop
   behaves and also stops it being a permanent ornament on the desktop.    */

const STAGES = { idle: 0, sending: 1, sent: 2 }

export default function AirDropSheet() {
  const dragging = useDragStore((s) => s.payload)
  const over = useDragStore((s) => s.overAirDrop)
  const airDropping = useWindowStore((s) => s.airDropping)
  const finish = useWindowStore((s) => s.finishAirDrop)
  const openWindow = useWindowStore((s) => s.openWindow)
  const airdropMode = useSettingsStore((s) => s.airdrop)

  const [stage, setStage] = useState(STAGES.idle)

  /* The whole handshake, on a timer: Sending… → Sent → contact card. */
  useEffect(() => {
    if (!airDropping) { setStage(STAGES.idle); return }
    setStage(STAGES.sending)
    const a = setTimeout(() => setStage(STAGES.sent), 1100)
    const b = setTimeout(() => { openWindow('contact'); finish() }, 2300)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [airDropping, openWindow, finish])

  // AirDrop set to "No One" receives nothing, which is the honest behaviour
  // for a switch that is sitting right there in Control Centre.
  const off = airdropMode === 'off'
  const showTarget = !!dragging && !airDropping

  return (
    <>
      <AnimatePresence>
        {showTarget && (
          <motion.div
            className="ad-target"
            data-airdrop-target=""
            data-over={over || undefined}
            data-off={off || undefined}
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <GlassLayers small />
            <span className="ad-target__ring">
              <img src={mikdadHeadUrl} alt="" draggable={false} />
            </span>
            <span className="ad-target__name">{off ? 'AirDrop is off' : SYS.name}</span>
            <span className="ad-target__hint">
              {off ? 'Turn it on in Control Centre' : 'Drop to AirDrop'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {airDropping && (
          <motion.div
            className="ad-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="ad-card"
              initial={{ scale: 0.92, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: -8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            >
              <GlassLayers small />
              <span className="ad-card__ring" data-stage={stage}>
                <img src={mikdadHeadUrl} alt="" draggable={false} />
              </span>
              <p className="ad-card__name">{SYS.name}</p>
              <p className="ad-card__state">
                {stage === STAGES.sent ? 'Sent' : 'Sending…'}
              </p>
              {stage === STAGES.sent && (
                <p className="ad-card__note">
                  Nothing actually left your machine — your file is still on the
                  desktop. Opening the contact card instead.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
