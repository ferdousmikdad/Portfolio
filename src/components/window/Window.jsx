import { useRef } from 'react'
import { motion } from 'framer-motion'
import WindowControls from './WindowControls'
import useWindowStore from '@/store/windowStore'
import useSoundStore from '@/store/soundStore'
import { genieOut } from '@/utils/genie'

export default function Window({ id, title, children, actionLabel, hideControls, hideTitleBar, toolbar }) {
  const { closeWindow, minimizeWindow, focusWindow, updatePosition, getWindow } = useWindowStore()
  const play   = useSoundStore((s) => s.play)
  const win    = getWindow(id)
  const winRef = useRef(null)

  if (!win || !win.isOpen || win.isMinimized) return null

  // ── Genie minimize ──────────────────────────────────────────────────────────
  const handleMinimize = () => {
    play('minimize')

    const el = winRef.current
    if (!el) { minimizeWindow(id); return }

    // Measure the window and the trash button
    const rect  = el.getBoundingClientRect()
    const trash = document.querySelector('[data-trash]')
    let tx = 0, ty = 400
    if (trash) {
      const tr = trash.getBoundingClientRect()
      tx = (tr.left + tr.width  / 2) - (rect.left + rect.width  / 2)
      ty = (tr.top  + tr.height / 2) - (rect.top  + rect.height / 2)
    }

    // Create a fixed-position snapshot clone so we can hide the real window
    // immediately while the animation plays on the disposable clone.
    const clone = el.cloneNode(true)
    clone.style.cssText = [
      'position:fixed',
      `top:${rect.top}px`,
      `left:${rect.left}px`,
      `width:${rect.width}px`,
      `height:${rect.height}px`,
      'margin:0',
      'box-sizing:border-box',
      'z-index:9999',
      'pointer-events:none',
      'transform-origin:50% 50%',
      'opacity:1',
      'animation:none',
    ].join(';')
    clone.classList.add('genie-freeze')   // freezes all child animations via CSS
    document.body.appendChild(clone)

    // Hide the real window in the store right away — zero visible gap
    minimizeWindow(id)

    // Animate the clone toward the trash, then remove it
    genieOut(clone, tx, ty, 520).then(() => clone.remove())
  }

  return (
    <motion.div
      ref={winRef}
      className="window-shell absolute"
      style={{
        width:  win.size.width,
        height: win.size.height,
        zIndex: win.zIndex,
        x: win.position.x,
        y: win.position.y,
      }}
      initial={{ opacity: 0, scale: 0.92, y: win.position.y + 20 }}
      animate={{ opacity: 1, scale: 1,    y: win.position.y      }}
      exit={{    opacity: 0, scale: 0.88, transition: { duration: 0.15 } }}
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={(_, info) => {
        updatePosition(id, {
          x: win.position.x + info.offset.x,
          y: win.position.y + info.offset.y,
        })
      }}
      onMouseDown={() => focusWindow(id)}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      {/* Title bar */}
      {!hideTitleBar && (
        <div
          className="window-titlebar relative"
          style={{ borderBottom: toolbar ? '1px solid var(--border)' : 'none' }}
        >
          {!hideControls && (
            <WindowControls
              onClose={() => { play('close'); closeWindow(id) }}
              onMinimize={handleMinimize}
              onMaximize={() => {}}
            />
          )}
          {title && (
            <span
              className="absolute left-1/2 -translate-x-1/2 text-xs font-medium"
              style={{ color: 'var(--body)', fontFamily: "'SF Pro Display'" }}
            >
              {title}
            </span>
          )}
          {toolbar && <div className="ml-auto flex items-center gap-2">{toolbar}</div>}
          {actionLabel && !toolbar && (
            <span className="ml-auto text-xs text-brand font-medium cursor-pointer hover:opacity-80 transition-opacity">
              {actionLabel}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className={
        hideTitleBar
          ? 'h-full overflow-hidden rounded-[20px]'
          : 'h-[calc(100%-40px)] overflow-hidden rounded-b-[20px]'
      }>
        {children}
      </div>
    </motion.div>
  )
}
