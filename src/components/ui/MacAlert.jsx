import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

/* ── macOS alert ───────────────────────────────────────────────────────────
   The panel emptying the Trash puts up. AppKit's proportions: a narrow column
   (~260pt), the app icon above the text, a bold message, dimmer body copy,
   and the buttons bottom-right with the default one rightmost and focused —
   so Return commits and Escape cancels without touching the mouse.

   There is deliberately no destructive variant: NSAlert tints its default
   button with the system accent whatever the action, and the red-button
   convention belongs to iOS.                                                */
export default function MacAlert({
  open,
  icon,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel  = 'Cancel',
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null)

  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onCancel?.() }
      if (e.key === 'Enter')  { e.preventDefault(); onConfirm?.() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onConfirm, onCancel])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="mac-alert__scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{    opacity: 0 }}
          transition={{ duration: 0.14 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel?.() }}
        >
          <motion.div
            className="mac-alert"
            role="alertdialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{    opacity: 0, scale: 0.96, y: -4 }}
            transition={{ type: 'spring', stiffness: 520, damping: 34 }}
          >
            {icon && <img className="mac-alert__icon" src={icon} alt="" draggable={false} />}

            <p className="mac-alert__title">{title}</p>
            {message && <p className="mac-alert__body">{message}</p>}

            <div className="mac-alert__buttons">
              {cancelLabel && (
                <button className="mac-alert__btn" onClick={onCancel}>
                  {cancelLabel}
                </button>
              )}
              <button
                ref={confirmRef}
                className="mac-alert__btn"
                data-default="true"
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
