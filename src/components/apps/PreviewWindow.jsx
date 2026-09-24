import { useCallback, useEffect, useRef, useState } from 'react'
import Window from '@/components/window/Window'
import WindowSidebar from '@/components/window/WindowSidebar'
import GlassLayers from '@/components/ui/LiquidGlass'
import SFSymbol from '@/components/ui/SFSymbol'
import useWindowStore from '@/store/windowStore'
import { CONTACT } from '@/data/mikudaAI'

/* ── Preview ─────────────────────────────────────────────────────────────────
   A portfolio piece opens here the way a picture on a Mac opens in Preview.
   Measured off Tahoe Preview: the file's name in bold beside the traffic
   lights, the tools in glass capsule groups — sidebar ▾, then zoom out |
   actual size | zoom in, then rotate — and the picture filling the window
   under the toolbar, clipped by its rounded corners.

   Like Preview, the window sizes itself to the picture when it opens, a
   project with several files opens with the thumbnail sidebar showing, and
   ⌘− ⌘0 ⌘+ and the arrow keys work while it has focus. Tall pieces (full
   landing pages) open fitted to the width so they read, and scroll.       */

const TOOLBAR_H = 40
const SIDEBAR_W = 150
const TOPBAR_H  = 28
const DOCK_SAFE = 88
const TALL      = 1.6    // height / width past which a piece is a scroll, not a picture

function itemsOf(project) {
  if (project?.content?.length) return project.content
  const fallback = project?.preview || project?.image || project?.thumbnail
  return fallback ? [{ url: fallback, type: project?.thumbnailType === 'video' ? 'video' : 'image' }] : []
}

const extOf = (url) => (url.split('?')[0].split('.').pop() || '').toLowerCase()
const label = (slug) => slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

// ── Toolbar pieces ────────────────────────────────────────────────────────────

function Group({ children }) {
  return (
    <div className="pv-group finder-glass" onPointerDown={(e) => e.stopPropagation()}>
      <GlassLayers small />
      {children}
    </div>
  )
}

function Tool({ symbol, title, onClick, disabled, on, size = 17 }) {
  return (
    <button className={`pv-tool${on ? ' pv-tool--on' : ''}`} title={title} onClick={onClick} disabled={disabled}>
      <SFSymbol name={symbol} size={size} />
    </button>
  )
}

// ── Media ─────────────────────────────────────────────────────────────────────

function Media({ item, style, onDims, controls = false, lazy = false }) {
  if (item.type === 'video') {
    return (
      <video
        src={item.url}
        autoPlay={!lazy} muted loop playsInline controls={controls}
        preload={lazy ? 'metadata' : 'auto'}
        style={style}
        onLoadedMetadata={(e) => onDims?.({ w: e.currentTarget.videoWidth, h: e.currentTarget.videoHeight })}
      />
    )
  }
  return (
    <img
      src={item.url}
      alt=""
      draggable={false}
      loading={lazy ? 'lazy' : undefined}
      decoding="async"
      style={style}
      onLoad={(e) => onDims?.({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
    />
  )
}

// ── Window ────────────────────────────────────────────────────────────────────

export default function PreviewWindow() {
  const project            = useWindowStore((s) => s.previewProject)
  const isActive           = useWindowStore((s) => s.activeWindowId === 'preview')
  const updateSizePosition = useWindowStore((s) => s.updateSizePosition)
  const openMailWindow     = useWindowStore((s) => s.openMailWindow)

  const items = itemsOf(project)

  const [index,    setIndex]    = useState(0)
  const [dims,     setDims]     = useState({})
  const [scale,    setScale]    = useState(null)    // null = zoom to fit
  const [rotation, setRotation] = useState(0)
  const [sidebar,  setSidebar]  = useState(false)
  const [info,     setInfo]     = useState(false)
  const [hud,      setHud]      = useState(null)
  const [box,      setBox]      = useState({ w: 0, h: 0 })

  const fitted   = useRef(null)

  // A new project starts over: first file, fitted, sidebar only if there is more than one.
  useEffect(() => {
    setIndex(0); setDims({}); setScale(null); setRotation(0); setInfo(false)
    setSidebar(itemsOf(project).length > 1)
    fitted.current = null
  }, [project])

  /* The stage's size, which "zoom to fit" is measured against. A callback
     ref, not an effect: showing or hiding the sidebar switches Window to
     its other layout and remounts the stage, and an observer left on the
     old node would keep reporting a stage that no longer exists. */
  const observer = useRef(null)
  const stageRef = useCallback((el) => {
    observer.current?.disconnect()
    observer.current = null
    if (!el) return
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    observer.current = ro
  }, [])

  /* Size the window to the first picture once its dimensions are known —
     the whole picture where it fits the screen, the full width of a tall
     one — and centre it in the space between the menu bar and the dock. */
  useEffect(() => {
    const d = dims[0]
    if (!project || !d || fitted.current === project) return
    fitted.current = project
    const side  = items.length > 1 ? SIDEBAR_W : 0
    const maxW  = Math.min(window.innerWidth * 0.82, 1280) - side
    const maxH  = window.innerHeight - TOPBAR_H - DOCK_SAFE - 40 - TOOLBAR_H
    const tall  = d.h / d.w > TALL
    const s     = tall ? Math.min(maxW / d.w, 820 / d.w, 1) : Math.min(maxW / d.w, maxH / d.h, 1)
    const w     = Math.max(460, Math.round(d.w * s) + side)
    const h     = Math.max(340, Math.round(tall ? maxH : d.h * s) + TOOLBAR_H)
    const usable = window.innerHeight - TOPBAR_H - DOCK_SAFE
    updateSizePosition('preview', { width: w, height: h }, {
      x: Math.round((window.innerWidth - w) / 2),
      y: Math.round(TOPBAR_H + Math.max(0, (usable - h) / 2)),
    })
  }, [dims, project, items.length, updateSizePosition])

  const item   = items[index]
  const d      = dims[index]
  const turned = rotation % 180 !== 0
  const rw     = d ? (turned ? d.h : d.w) : 0
  const rh     = d ? (turned ? d.w : d.h) : 0
  const fit    = d && box.w ? (rh / rw > TALL ? Math.min(box.w / rw, 1) : Math.min(box.w / rw, box.h / rh, 1)) : 1
  const eff    = scale ?? fit

  const zoomIn  = () => setScale(Math.min(8, eff * 1.25))
  const zoomOut = () => setScale(Math.max(0.05, eff / 1.25))
  const actual  = () => setScale(scale === 1 ? null : 1)
  const go      = (i) => { setIndex(i); setScale(null); setRotation(0) }

  const flash = (text) => { setHud(text); setTimeout(() => setHud(null), 1400) }
  const share = () => {
    navigator.clipboard?.writeText(window.location.href).then(() => flash('Link Copied'), () => flash('Couldn’t Copy Link'))
  }

  useEffect(() => {
    if (!isActive || !project) return
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.metaKey && (e.key === '=' || e.key === '+')) { e.preventDefault(); zoomIn() }
      else if (e.metaKey && e.key === '-')               { e.preventDefault(); zoomOut() }
      else if (e.metaKey && e.key === '0')               { e.preventDefault(); setScale(null) }
      else if ((e.key === 'ArrowDown' || e.key === 'ArrowRight') && index < items.length - 1) { e.preventDefault(); go(index + 1) }
      else if ((e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  && index > 0)                { e.preventDefault(); go(index - 1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!project || !item) return null

  const fileName = `${project.title}.${extOf(item.url) || 'jpg'}`

  // ── Chrome ──

  const sidebarGroup = (
    <Group>
      <button className="pv-tool pv-tool--wide" title={sidebar ? 'Hide Sidebar' : 'Show Sidebar'} onClick={() => setSidebar((v) => !v)}>
        <SFSymbol name="sidebar.left" size={17} />
        <SFSymbol name="chevron.down" size={8} style={{ marginLeft: 3, opacity: 0.8 }} />
      </button>
    </Group>
  )

  const toolbar = (
    <div className="flex items-center gap-2" style={{ pointerEvents: 'auto' }}>
      <Group>
        <Tool symbol="minus.magnifyingglass" title="Zoom Out (⌘−)" onClick={zoomOut} />
        <span className="pv-sep" />
        <Tool symbol="1.magnifyingglass" title="Actual Size" onClick={actual} on={scale === 1} />
        <span className="pv-sep" />
        <Tool symbol="plus.magnifyingglass" title="Zoom In (⌘+)" onClick={zoomIn} />
      </Group>
      <Group>
        <Tool symbol="rotate.right" title="Rotate Right" onClick={() => setRotation((r) => (r + 90) % 360)} disabled={item.type === 'video'} />
        <span className="pv-sep" />
        <Tool symbol="square.and.arrow.up" title="Share — Copy Link" onClick={share} size={16} />
      </Group>
      <Group>
        <Tool symbol="info.circle" title="Show Inspector" onClick={() => setInfo((v) => !v)} on={info} />
      </Group>
    </div>
  )

  const sidebarContent = sidebar ? ({ onClose, onMinimize, onMaximize }) => (
    <WindowSidebar width={SIDEBAR_W} gutter="6px 0 6px 6px" controls={{ onClose, onMinimize, onMaximize }}>
      <div className="pv-thumbs window-scroll">
        {items.map((it, i) => (
          <button key={it.url} className={`pv-thumb${i === index ? ' pv-thumb--on' : ''}`} onClick={() => go(i)}>
            <span className="pv-thumb__frame">
              <Media item={it} lazy style={{ width: '100%', height: 'auto', display: 'block' }} />
            </span>
            <span className="pv-thumb__num">{i + 1}</span>
          </button>
        ))}
      </div>
    </WindowSidebar>
  ) : undefined

  // ── Stage ──

  const frameW = rw * eff
  const frameH = rh * eff

  return (
    <Window
      id="preview"
      title={fileName}
      navSlot={sidebarGroup}
      toolbar={toolbar}
      sidebarContent={sidebarContent}
      minSize={{ width: 420, height: 300 }}
    >
      <div className="pv-body">
        <div ref={stageRef} className="pv-stage window-scroll">
          {d ? (
            <div className="pv-canvas" style={{ width: Math.max(frameW, box.w), height: Math.max(frameH, box.h) }}>
              <div className="pv-frame" style={{ width: frameW, height: frameH }}>
                <Media
                  key={item.url}
                  item={item}
                  controls
                  style={{
                    position: 'absolute', left: '50%', top: '50%',
                    width: d.w * eff, height: d.h * eff,
                    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease',
                  }}
                />
              </div>
            </div>
          ) : (
            /* Measured first, invisibly — the size decides the zoom and the window. */
            <Media
              key={item.url}
              item={item}
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
              onDims={(v) => setDims((prev) => ({ ...prev, [index]: v }))}
            />
          )}
        </div>

        {info && (
          <div className="pv-inspector" onPointerDown={(e) => e.stopPropagation()}>
            <p className="pv-inspector__name">{project.title}</p>
            <dl className="pv-inspector__grid">
              <dt>Kind</dt><dd>{item.type === 'video' ? 'Video' : `${extOf(item.url).toUpperCase()} image`}</dd>
              {project.category && (<><dt>Category</dt><dd>{label(project.category)}</dd></>)}
              {d && (<><dt>Dimensions</dt><dd>{d.w} × {d.h}</dd></>)}
              {items.length > 1 && (<><dt>File</dt><dd>{index + 1} of {items.length}</dd></>)}
            </dl>
            {(project.subtitle || project.description) && (
              <p className="pv-inspector__about">{project.subtitle || project.description}</p>
            )}
            <button className="pv-inspector__cta" onClick={() => openMailWindow(CONTACT.email)}>
              Get in Touch
            </button>
          </div>
        )}

        {hud && <div className="pv-hud">{hud}</div>}
      </div>
    </Window>
  )
}
