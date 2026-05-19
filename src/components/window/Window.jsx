import { useRef, useEffect } from 'react'
import { motion, useDragControls, useMotionValue } from 'framer-motion'
import WindowControls from './WindowControls'
import useWindowStore from '@/store/windowStore'
import useSoundStore from '@/store/soundStore'
import { genieOut } from '@/utils/genie'
import { useResize, RESIZE_CURSORS } from '@/hooks/useResize'

export default function Window({ id, title, children, actionLabel, onAction, hideControls, hideTitleBar, toolbar, sidebarContent, shellStyle, navSlot }) {
  const { closeWindow, minimizeWindow, focusWindow, updatePosition, getWindow, toggleMaximize } = useWindowStore()
  const activeWindowId = useWindowStore((s) => s.activeWindowId)
  const play        = useSoundStore((s) => s.play)
  const win         = getWindow(id)
  const isActive    = activeWindowId === id
  const winRef      = useRef(null)
  const dragControls = useDragControls()

  // ── Motion values for geometry ─────────────────────────────────────────────
  // Using motion values instead of `animate` for x/y/width/height means that
  // .set() calls bypass React entirely — instant DOM updates, no spring lag.
  const mx = useMotionValue(win?.position.x ?? 0)
  const my = useMotionValue(win?.position.y ?? 0)
  const mw = useMotionValue(win?.size.width  ?? 0)
  const mh = useMotionValue(win?.size.height ?? 0)

  // Keep in sync with the store for all external changes
  // (drag commit, maximize/restore, openWindow position reset, etc.)
  useEffect(() => { win && mx.set(win.position.x) }, [win?.position.x])
  useEffect(() => { win && my.set(win.position.y) }, [win?.position.y])
  useEffect(() => { win && mw.set(win.size.width)  }, [win?.size.width])
  useEffect(() => { win && mh.set(win.size.height) }, [win?.size.height])

  const { startResize } = useResize(id, mx, my, mw, mh)

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
      className={`window-shell absolute${isActive ? ' focused' : ''}`}
      style={{
        // Geometry via motion values — updated directly, never spring-animated
        x:      mx,
        y:      my,
        width:  mw,
        height: mh,
        zIndex:        win.zIndex,
        pointerEvents: 'auto',
        boxShadow:     win.isMaximized ? 'none' : undefined,
        ...shellStyle,
      }}
      // animate only controls entrance/exit appearance — NOT geometry
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1, borderRadius: win.isMaximized ? 0 : 22 }}
      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      drag={!win.isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={() => {
        if (win.isMaximized) return
        // Read final position directly from motion values after drag
        updatePosition(id, { x: mx.get(), y: my.get() })
      }}
      onMouseDown={() => focusWindow(id)}
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
                {navSlot}
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
              {navSlot}
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

      {/* ── Resize handles (hidden when maximized) ──────────────────────────── */}
      {!win.isMaximized && (
        <>
          {/* Edges */}
          <div onMouseDown={(e) => startResize(e, 'top')}
            style={{ position:'absolute', top:0, left:10, right:10, height:6, cursor: RESIZE_CURSORS.top, zIndex:100 }} />
          <div onMouseDown={(e) => startResize(e, 'bottom')}
            style={{ position:'absolute', bottom:0, left:10, right:10, height:6, cursor: RESIZE_CURSORS.bottom, zIndex:100 }} />
          <div onMouseDown={(e) => startResize(e, 'left')}
            style={{ position:'absolute', left:0, top:10, bottom:10, width:6, cursor: RESIZE_CURSORS.left, zIndex:100 }} />
          <div onMouseDown={(e) => startResize(e, 'right')}
            style={{ position:'absolute', right:0, top:10, bottom:10, width:6, cursor: RESIZE_CURSORS.right, zIndex:100 }} />

          {/* Corners */}
          <div onMouseDown={(e) => startResize(e, 'top-left')}
            style={{ position:'absolute', top:0, left:0, width:14, height:14, cursor: RESIZE_CURSORS['top-left'], zIndex:101 }} />
          <div onMouseDown={(e) => startResize(e, 'top-right')}
            style={{ position:'absolute', top:0, right:0, width:14, height:14, cursor: RESIZE_CURSORS['top-right'], zIndex:101 }} />
          <div onMouseDown={(e) => startResize(e, 'bottom-left')}
            style={{ position:'absolute', bottom:0, left:0, width:14, height:14, cursor: RESIZE_CURSORS['bottom-left'], zIndex:101 }} />
          <div onMouseDown={(e) => startResize(e, 'bottom-right')}
            style={{ position:'absolute', bottom:0, right:0, width:14, height:14, cursor: RESIZE_CURSORS['bottom-right'], zIndex:101 }} />
        </>
      )}
    </motion.div>
  )
}
