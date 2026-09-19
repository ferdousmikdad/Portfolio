import { useRef, useEffect } from 'react'
import { motion, useDragControls, useMotionValue } from 'framer-motion'
import WindowControls from './WindowControls'
import useWindowStore from '@/store/windowStore'
import useSoundStore from '@/store/soundStore'
import { genieStage, flatten, afterMount } from '@/utils/genie'
import { setSnapshot } from '@/utils/windowSnapshots'
import { useResize, RESIZE_CURSORS } from '@/hooks/useResize'

export default function Window({ id, title, children, actionLabel, onAction, hideControls, hideTitleBar, toolbar, sidebarContent, shellStyle, paneStyle, navSlot, minSize, disableMaximize, titleBarBorder = false }) {
  const { closeWindow, minimizeWindow, focusWindow, updatePosition, getWindow, toggleMaximize } = useWindowStore()
  const activeWindowId = useWindowStore((s) => s.activeWindowId)
  const restoring   = useWindowStore((s) => s.restoringId) === id
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

  const { startResize } = useResize(id, mx, my, mw, mh, minSize)

  const handleMaximize = () => {
    play('open')
    toggleMaximize(id)
  }

  if (!win || !win.isOpen || win.isMinimized) return null

  // ── Genie minimize ──────────────────────────────────────────────────────────
  // The window shrinks into its own tile in the dock, the way macOS does it.
  // That tile only exists once the store knows the window is minimised, so the
  // dock is measured a frame later — but the stage is cut here, while the
  // window is still up, because building it is the only costly part and a
  // frame lost to it at the start is the one thing the eye always catches.
  const handleMinimize = () => {
    play('minimize')

    const el = winRef.current
    if (!el) { minimizeWindow(id); return }

    const rect = el.getBoundingClientRect()

    // One flattened copy serves three purposes: the stage below, the dock
    // tile's picture of the window, and the source its bands are cut from.
    // Flattening has to happen while the window is still live — that is the
    // only moment its canvases still have pixels to read.
    const flat = flatten(el)
    setSnapshot(id, flat, { width: rect.width, height: rect.height })

    // Somewhere below the window, for the frame before the dock tile exists
    const cx = rect.left + rect.width / 2
    let slot = { left: cx - 24, right: cx + 24, width: 48,
                 top: window.innerHeight - 8, bottom: window.innerHeight + 40, height: 48 }

    // Sits exactly on the window at rest, so putting it up changes nothing
    const stage = genieStage(flat, rect.width, rect.height)
    stage.place(rect, slot)
    stage.draw(0)

    minimizeWindow(id)

    afterMount(`[data-min-slot="${id}"]`).then((slotEl) => {
      if (slotEl) slot = slotEl.getBoundingClientRect()
      stage.place(rect, slot)
      stage.run(820, 0, 1).then(stage.destroy)
    })
  }

  return (
    <motion.div
      ref={winRef}
      data-window={id}
      className={`window-shell absolute${sidebarContent ? ' window-shell--split' : ''}${isActive ? ' focused' : ''}`}
      style={{
        // Geometry via motion values — updated directly, never spring-animated
        x:      mx,
        y:      my,
        width:  mw,
        height: mh,
        zIndex:        win.zIndex,
        pointerEvents: 'auto',
        boxShadow:     win.isMaximized ? 'none' : undefined,
        // held invisible while the genie draws it back out of the dock
        visibility:    restoring ? 'hidden' : undefined,
        ...shellStyle,
      }}
      // animate only controls entrance/exit appearance — NOT geometry.
      //
      // Deliberately no opacity on the way in. An element whose opacity is
      // below 1 becomes a backdrop root, and `backdrop-filter` inside it has
      // nothing left to sample — so for the length of the entrance the
      // sidebar's glass would show the desktop through it stone sharp, then
      // snap to blurred the instant opacity landed on 1. Scale alone opens
      // the window just as well and never breaks the sampling.
      initial={restoring ? false : { scale: 0.92 }}
      animate={{ scale: 1, borderRadius: win.isMaximized ? 0 : 22 }}
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
          {/* Left: the vibrant pane, full height, traffic lights on it */}
          <div style={{ flexShrink: 0, height: '100%' }}>
            {sidebarContent({
              onClose:    () => { play('close'); closeWindow(id) },
              onMinimize: handleMinimize,
              onMaximize: handleMaximize,
              maximizeDisabled: disableMaximize,
            })}
          </div>

          {/* Right: titlebar (drag handle, no traffic lights) + content. This
              is the pane that is opaque — the contrast against the glass on
              the left is what sells the sidebar as sitting on the desktop. */}
          <div className="window-pane" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', ...paneStyle }}>
            {!hideTitleBar && (
              <div
                className="window-titlebar relative"
                style={{
                  borderBottom: titleBarBorder ? '1px solid var(--border)' : 'none',
                  cursor: win.isMaximized ? 'default' : 'grab',
                }}
                onPointerDown={(e) => { if (!win.isMaximized) dragControls.start(e) }}
              >
                {navSlot}
                {title && <span className="window-titlebar__title">{title}</span>}
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
                borderBottom: titleBarBorder ? '1px solid var(--border)' : 'none',
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
                  maximizeDisabled={disableMaximize}
                />
              )}
              {navSlot}
              {title && <span className="window-titlebar__title">{title}</span>}
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
