import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Download, Trash2 } from 'lucide-react'
import { CATEGORIES, NOTES } from '@/data/notes.js'
import useWindowStore from '@/store/windowStore'

/* The Notes app's body — the entry list, the reader and the canvas — lifted
   out of the Notes window so Finder can show the same thing under its Notes
   favourite, the way [[ChatPanel]] and [[PortfolioPanel]] already do. The
   category lives with the caller, since each window picks it from its own
   sidebar. */

// ── Drawing Canvas ────────────────────────────────────────────────────────────
const COLORS  = ['#f3f0e5','#cf0506','#ffbd2e','#28c840','#3b82f6','#a78bfa','#f97316','#000000']
const SIZES   = [2, 4, 8, 14]

function DrawingCanvas() {
  const canvasRef  = useRef(null)
  const drawing    = useRef(false)
  const lastPos    = useRef(null)
  const [color,  setColor]  = useState('#f3f0e5')
  const [size,   setSize]   = useState(4)
  const [eraser, setEraser] = useState(false)

  const getPos = (e) => {
    const r = canvasRef.current.getBoundingClientRect()
    const src = e.touches ? e.touches[0] : e
    return { x: src.clientX - r.left, y: src.clientY - r.top }
  }

  const draw = useCallback((from, to) => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.globalCompositeOperation = eraser ? 'destination-out' : 'source-over'
    ctx.strokeStyle = color
    ctx.lineWidth   = eraser ? size * 3 : size
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
  }, [color, size, eraser])

  const onStart = (e) => {
    drawing.current = true
    lastPos.current = getPos(e)
  }
  const onMove = (e) => {
    if (!drawing.current) return
    const pos = getPos(e)
    draw(lastPos.current, pos)
    lastPos.current = pos
  }
  const onEnd = () => { drawing.current = false; lastPos.current = null }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
  }

  const exportPng = () => {
    const link  = document.createElement('a')
    link.download = 'mikdad-drawing.png'
    link.href   = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  // Resize canvas to match its CSS size
  useEffect(() => {
    const canvas = canvasRef.current
    const ro = new ResizeObserver(() => {
      const { width, height } = canvas.getBoundingClientRect()
      // Save pixels, resize, restore
      const tmp = canvas.toDataURL()
      canvas.width  = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0)
      img.src = tmp
    })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-4 py-2 flex-shrink-0 flex-wrap"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {/* Colors */}
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setEraser(false) }}
              style={{
                width: 16, height: 16, borderRadius: '50%', background: c,
                border: color === c && !eraser ? '2px solid var(--headline)' : '1.5px solid var(--border)',
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        <div style={{ width: 1, height: 16, background: 'var(--border)', flexShrink: 0 }} />

        {/* Brush sizes */}
        <div className="flex items-center gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => { setSize(s); setEraser(false) }}
              className="flex items-center justify-center"
              style={{ width: 20, height: 20 }}
            >
              <span
                style={{
                  display: 'block',
                  width: Math.min(s * 2.5, 16),
                  height: Math.min(s * 2.5, 16),
                  borderRadius: '50%',
                  background: size === s && !eraser ? 'var(--headline)' : 'var(--dot)',
                }}
              />
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 16, background: 'var(--border)', flexShrink: 0 }} />

        {/* Eraser */}
        <button
          onClick={() => setEraser((v) => !v)}
          className="text-xs px-2.5 py-1 rounded-md transition-colors"
          style={{
            background: eraser ? 'var(--social-hover)' : 'var(--social-bg)',
            color: 'var(--body)',
            border: '1px solid var(--border)',
            fontSize: 11,
          }}
        >
          Eraser
        </button>

        <div className="ml-auto flex gap-2">
          <button
            onClick={clearCanvas}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md transition-colors"
            style={{ background: 'var(--social-bg)', color: 'var(--body)', border: '1px solid var(--border)', fontSize: 11 }}
          >
            <Trash2 size={11} /> Clear
          </button>
          <button
            onClick={exportPng}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md transition-colors"
            style={{ background: 'var(--social-bg)', color: 'var(--body)', border: '1px solid var(--border)', fontSize: 11 }}
          >
            <Download size={11} /> Export PNG
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative" style={{ background: '#111' }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: eraser ? 'cell' : 'crosshair', touchAction: 'none' }}
          onMouseDown={onStart}
          onMouseMove={onMove}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
          onTouchStart={onStart}
          onTouchMove={onMove}
          onTouchEnd={onEnd}
        />
      </div>
    </div>
  )
}

// ── Article Reader ────────────────────────────────────────────────────────────
function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={j} style={{ color: 'var(--headline)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
      : part
  )
}

function ArticleView({ note, onBack }) {
  const lines = note.content.split('\n')

  // Group lines into blocks: table | divider | text
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim().startsWith('|')) {
      const tableRows = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const isSep = !lines[i].replace(/[|\-\s]/g, '').trim()
        if (!isSep) {
          const cells = lines[i].trim().split('|').slice(1, -1).map(c => c.trim())
          tableRows.push(cells)
        }
        i++
      }
      if (tableRows.length) blocks.push({ type: 'table', rows: tableRows })
    } else if (line.trim() === '---') {
      blocks.push({ type: 'divider' })
      i++
    } else {
      blocks.push({ type: 'line', content: line })
      i++
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={onBack} className="flex items-center gap-1 text-body hover:text-headline transition-colors text-xs">
          <ChevronLeft size={14} /> Back
        </button>
        <span className="text-body text-xs" style={{ marginLeft: 'auto' }}>{note.date}</span>
      </div>
      <div className="flex-1 overflow-y-auto window-scroll px-6 py-5">
        <h1 className="text-headline font-medium text-lg leading-tight mb-4" style={{ fontFamily: "'SF Pro Display'" }}>
          {note.title}
        </h1>
        <div className="text-body text-[13px] leading-relaxed" style={{ fontFamily: "'SF Pro Text'" }}>
          {blocks.map((block, bi) => {
            if (block.type === 'divider') return (
              <hr key={bi} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '14px 0' }} />
            )
            if (block.type === 'table') return (
              <div key={bi} style={{ overflowX: 'auto', marginBottom: 14 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  {block.rows.map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: '1px solid var(--border)', background: ri === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                      {row.map((cell, ci) => {
                        const Tag = ri === 0 ? 'th' : 'td'
                        return (
                          <Tag key={ci} style={{
                            padding: '7px 12px', textAlign: 'left',
                            color: ri === 0 ? 'var(--headline)' : 'var(--body)',
                            fontWeight: ri === 0 ? 600 : 400,
                            fontSize: ri === 0 ? 10.5 : 12,
                            fontFamily: "'SF Pro Text'",
                            whiteSpace: 'nowrap',
                          }}>
                            {renderInline(cell)}
                          </Tag>
                        )
                      })}
                    </tr>
                  ))}
                </table>
              </div>
            )
            if (!block.content.trim()) return <div key={bi} className="h-3" />
            return <p key={bi} className="mb-0">{renderInline(block.content)}</p>
          })}
        </div>
      </div>
    </div>
  )
}

// ── Notes Entry Row ───────────────────────────────────────────────────────────
/* A row in the note list. Two things here are what make it read as Notes
   rather than as a styled <ul>: the selected row takes the accent colour (a
   grey wash is what an *unfocused* macOS list shows), and the hairline between
   rows starts at the text rather than at the pane edge — every inset list on
   the system divides that way. The divider is a child so the selected row can
   swallow it, which is also what AppKit does. */
function NoteRow({ note, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`notes-row w-full text-left px-4 py-3 transition-colors${active ? ' notes-row--on' : ''}`}
    >
      <p
        className="notes-row__title text-[12.5px] font-medium leading-tight truncate"
        style={{ fontFamily: "'SF Pro Display'" }}
      >
        {note.title}
      </p>
      <p className="notes-row__sub text-[11px] mt-0.5 truncate">
        {note.date} — {note.preview}
      </p>
      <span className="notes-row__rule" />
    </button>
  )
}

// ── Panel ─────────────────────────────────────────────────────────────────────

/* `honorRequests` belongs to exactly one mount — the Notes window — because a
   request from the Terminal names a note to open and is consumed once; two
   panels racing for it would leave one of them holding nothing. `wide` centres
   the columns inside a maximized window. */
export default function NotesPanel({
  category = 'all', onCategoryChange, search = '', honorRequests = false, wide = false,
}) {
  const noteRequest      = useWindowStore((s) => s.noteRequest)
  const clearNoteRequest = useWindowStore((s) => s.clearNoteRequest)

  const [activeNote, setActiveNote] = useState(null)
  const [reading,    setReading]    = useState(false)

  // Auto-navigate when the Terminal (or anything) asks for a specific note
  useEffect(() => {
    if (!honorRequests || !noteRequest) return
    const note = NOTES.find((n) => n.id === noteRequest.noteId)
    if (note) {
      onCategoryChange?.(noteRequest.category)
      setActiveNote(note)
      setReading(true)
    }
    clearNoteRequest()
  }, [noteRequest, honorRequests])

  // A note belongs to the category it was opened from: leaving clears it.
  const lastCategory = useRef(category)
  useEffect(() => {
    if (lastCategory.current === category) return
    lastCategory.current = category
    setActiveNote(null)
    setReading(false)
  }, [category])

  const base = category === 'all' || category === 'drawing'
    ? NOTES
    : NOTES.filter((n) => n.category === category)

  /* Search narrows the list the caller is already showing, rather than
     reaching across categories — the same way it behaves in a Finder folder. */
  const q = search.trim().toLowerCase()
  const filtered = q
    ? base.filter((n) => `${n.title} ${n.preview}`.toLowerCase().includes(q))
    : base

  return (
    <div className="flex h-full w-full overflow-hidden">
    <div className={`flex h-full w-full ${wide ? 'max-w-[1140px] mx-auto' : ''}`}>

      {/* ── List / Drawing ── */}
      <div
        className="flex flex-col flex-shrink-0 overflow-y-auto window-scroll"
        style={{ width: 220, background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)' }}
      >
        {category === 'drawing' ? (
          <div className="flex items-center justify-center h-full text-body text-xs">
            Open the canvas →
          </div>
        ) : (
          <>
            <div className="px-4 pt-4 pb-2 flex-shrink-0">
              <p
                className="text-[13px] font-semibold"
                style={{ color: 'var(--headline)', fontFamily: "'SF Pro Display'" }}
              >
                {CATEGORIES.find((c) => c.id === category)?.label}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--body)' }}>
                {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
              </p>
            </div>
            {q && filtered.length === 0 && (
              <p className="px-4 py-3 text-[11px]" style={{ color: 'var(--body)', opacity: 0.6 }}>
                No notes found
              </p>
            )}
            {filtered.map((note) => (
              <NoteRow
                key={note.id}
                note={note}
                active={activeNote?.id === note.id}
                onClick={() => { setActiveNote(note); setReading(true) }}
              />
            ))}
          </>
        )}
      </div>

      {/* ── Content panel ── */}
      <div className="flex-1 min-w-0 h-full">
        <AnimatePresence mode="wait">
          {category === 'drawing' ? (
            <motion.div
              key="drawing"
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <DrawingCanvas />
            </motion.div>
          ) : reading && activeNote ? (
            <motion.div
              key={activeNote.id}
              className="h-full"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
            >
              <ArticleView note={activeNote} onBack={() => setReading(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center h-full gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* A raster emoji sat here, which no Mac app would use for an
                  empty state. This is the Notes glyph drawn as a symbol, in
                  the same muted weight AppKit gives a placeholder. */}
              <svg width="34" height="34" viewBox="0 0 16 16" fill="none"
                   style={{ color: 'var(--body)', opacity: 0.28 }}>
                <rect x="2.6" y="1.9" width="10.8" height="12.2" rx="2.2"
                      stroke="currentColor" strokeWidth="1.1" />
                <path d="M5.3 5.6h5.4M5.3 8h5.4M5.3 10.4h3.2"
                      stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
              <p className="text-body text-xs">Select a note to read</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
    </div>
  )
}
