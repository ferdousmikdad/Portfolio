import { useRef } from 'react'
import { motion, useDragControls } from 'framer-motion'
import WindowControls from './WindowControls'
import useWindowStore from '@/store/windowStore'
import useSoundStore from '@/store/soundStore'
import { genieOut } from '@/utils/genie'

export default function Window({ id, title, children, actionLabel, onAction, hideControls, hideTitleBar, toolbar, sidebarContent }) {
  const { closeWindow, minimizeWindow, focusWindow, updatePosition, getWindow, toggleMaximize } = useWindowStore()
  const play        = useSoundStore((s) => s.play)
  const win         = getWindow(id)
  const winRef      = useRef(null)
  const dragControls = useDragControls()

  const handleMaximize = () => {
    play('open')
    toggleMaximize(id)
  }

  if (!win || !win.isOpen || win.isMinimized) return null

  // ── Genie minimize ──────────────────────────────────────────────────────────
  const handleMinimize = () => {
    play('minimize')

    const el = winRef.current
    if (!el) { minimizeWindow(id); return }

    const rect  = el.getBoundingClientRect()
    const trash = document.querySelector('[data-trash]')
    let tx = 0, ty = 400
    if (trash) {
      const tr = trash.getBoundingClientRect()
      tx = (tr.left + tr.width  / 2) - (rect.left + rect.width  / 2)
      ty = (tr.top  + tr.height / 2) - (rect.top  + rect.height / 2)
    }

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
    clone.classList.add('genie-freeze')
    document.body.appendChild(clone)

    minimizeWindow(id)
    genieOut(clone, tx, ty, 520).then(() => clone.remove())
  }

  return (
    <motion.div
      ref={winRef}
      className="window-shell absolute"
      style={{
        width:         win.size.width,
        height:        win.size.height,
        zIndex:        win.zIndex,
        x:             win.position.x,
        y:             win.position.y,
        pointerEvents: 'auto',
        borderRadius:  win.isMaximized ? 0 : 22,
      }}
      initial={{ opacity: 0, scale: 0.92, y: win.position.y + 20 }}
      animate={{
        opacity: 1,
        scale:   1,
        x:       win.position.x,
        y:       win.position.y,
        width:   win.size.width,
        height:  win.size.height,
        borderRadius: win.isMaximized ? 0 : 22,
      }}
      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.15 } }}
      drag={!win.isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={(_, info) => {
        if (win.isMaximized) return
        updatePosition(id, {
          x: win.position.x + info.offset.x,
          y: win.position.y + info.offset.y,
        })
      }}
      onMouseDown={() => focusWindow(id)}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      {sidebarContent ? (
        /* ── Sidebar-panel layout ─────────────────────────────────────────── */
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
          {/* Left: sidebar panel (full height) */}
          <div style={{ flexShrink: 0, height: '100%' }}>
            {sidebarContent({
              onClose:    () => { play('close'); closeWindow(id) },
              onMinimize: handleMinimize,
              onMaximize: handleMaximize,
            })}
          </div>

          {/* Right: titlebar (drag handle, no traffic lights) + content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {!hideTitleBar && (
              <div
                className="window-titlebar relative"
                style={{
                  borderBottom: '1px solid var(--border)',
                  cursor: win.isMaximized ? 'default' : 'grab',
                }}
                onPointerDown={(e) => { if (!win.isMaximized) dragControls.start(e) }}
              >
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
                  <span className="ml-auto text-xs text-brand font-medium cursor-pointer hover:opacity-80 transition-opacity" onClick={onAction}>
                    {actionLabel}
                  </span>
                )}
              </div>
            )}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {children}
            </div>
          </div>
        </div>
      ) : (
        /* ── Default layout ───────────────────────────────────────────────── */
        <>
          {/* Title bar — drag handle only */}
          {!hideTitleBar && (
            <div
              className="window-titlebar relative"
              style={{
                borderBottom: toolbar ? '1px solid var(--border)' : 'none',
                cursor: win.isMaximized ? 'default' : 'grab',
              }}
              onPointerDown={(e) => {
                if (!win.isMaximized) dragControls.start(e)
              }}
            >
              {!hideControls && (
                <WindowControls
                  onClose={() => { play('close'); closeWindow(id) }}
                  onMinimize={handleMinimize}
                  onMaximize={handleMaximize}
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
                <span className="ml-auto text-xs text-brand font-medium cursor-pointer hover:opacity-80 transition-opacity" onClick={onAction}>
                  {actionLabel}
                </span>
              )}
            </div>
          )}

          {/* Content */}
          <div className={
            hideTitleBar
              ? 'h-full overflow-hidden'
              : 'h-[calc(100%-40px)] overflow-hidden'
          }>
            {children}
          </div>
        </>
      )}
    </motion.div>
  )
}
