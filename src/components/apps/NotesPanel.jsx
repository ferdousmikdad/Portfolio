import { useState, useRef, useEffect, useCallback } from 'react'
import { Download, Trash2 } from 'lucide-react'
import { CATEGORIES, NOTES } from '@/data/notes.js'
import useWindowStore from '@/store/windowStore'
import useNotesStore, { asNote } from '@/store/notesStore'

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

function ArticleView({ note }) {
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
      {/* Notes puts the date centred in grey above the note, nothing else. */}
      <p className="notes-date">{note.date}</p>
      <div className="notes-reader flex-1 overflow-y-auto window-scroll px-6 py-5">
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
        <b className="notes-row__date">{note.date}</b> {note.preview}
      </p>
      <span className="notes-row__rule" />
    </button>
  )
}

// ── Editor for the visitor's own notes ───────────────────────────────────
/* Rich text, like a real note: the first line is the title. The toolbar's
   Aa, checklist and table buttons send a command through a 'notes:format'
   event and it is applied where the caret was — a real heading, a real
   checklist with tickable circles, a real table you can type into. */
const TABLE = '<table class="notes-table" data-new><tbody>' +
  '<tr><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td></tr></tbody></table><p><br></p>'

function NoteEditor({ note }) {
  const update = useNotesStore((st) => st.update)
  const ref = useRef(null)
  const range = useRef(null)

  // Filled once per note; after that the DOM is the source of truth.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Every line is its own block, the first one included, so the first
    // line can be styled as the title.
    document.execCommand('defaultParagraphSeparator', false, 'div')
    el.innerHTML = note.content || '<div><br></div>'
    const t = setTimeout(() => { el.focus(); placeAtEnd(el) }, 60)
    return () => clearTimeout(t)
  }, [note.id])

  // Remember the caret, since pressing a toolbar button moves focus away.
  useEffect(() => {
    const onSel = () => {
      const sel = window.getSelection()
      if (sel?.rangeCount && ref.current?.contains(sel.anchorNode)) range.current = sel.getRangeAt(0).cloneRange()
    }
    document.addEventListener('selectionchange', onSel)
    return () => document.removeEventListener('selectionchange', onSel)
  }, [])

  const save = () => update(note.id, ref.current.innerHTML)

  useEffect(() => {
    const onFormat = (e) => {
      const el = ref.current
      if (!el) return
      const sel = window.getSelection()
      /* Toolbar buttons do not take focus, so the live caret is usually
         still in the note — use it. Fall back to the remembered one. */
      const live = sel.rangeCount && el.contains(sel.anchorNode)
      if (!live) {
        el.focus()
        if (range.current && el.contains(range.current.startContainer)) { sel.removeAllRanges(); sel.addRange(range.current) }
        else placeAtEnd(el)
      }
      const cmd = e.detail
      if (cmd === 'title')    document.execCommand('formatBlock', false, 'h1')
      if (cmd === 'heading')  document.execCommand('formatBlock', false, 'h2')
      if (cmd === 'body')     document.execCommand('formatBlock', false, 'p')
      if (cmd === 'bullet')   document.execCommand('insertUnorderedList')
      if (cmd === 'number')   document.execCommand('insertOrderedList')
      if (cmd === 'checklist') document.execCommand('insertHTML', false, '<ul class="notes-check"><li><br></li></ul>')
      if (cmd === 'table') {
        document.execCommand('insertHTML', false, TABLE)
        // The caret goes into the first cell, as in Notes.
        const t = el.querySelector('table[data-new]')
        if (t) {
          t.removeAttribute('data-new')
          const r = document.createRange()
          r.selectNodeContents(t.querySelector('td'))
          r.collapse(true)
          sel.removeAllRanges(); sel.addRange(r)
        }
      }
      save()
    }
    window.addEventListener('notes:format', onFormat)
    return () => window.removeEventListener('notes:format', onFormat)
  }, [note.id])

  return (
    <div className="flex flex-col h-full">
      <p className="notes-date">{note.date}</p>
      <div
        ref={ref}
        className="notes-editor window-scroll"
        contentEditable
        suppressContentEditableWarning
        data-placeholder="New Note"
        onInput={save}
        onMouseDown={(e) => {
          e.stopPropagation()
          // A checklist circle ticks its item.
          const li = e.target.closest?.('.notes-check > li')
          if (li && e.nativeEvent.offsetX < 22) { e.preventDefault(); li.classList.toggle('done'); save() }
        }}
        spellCheck
      />
    </div>
  )
}

function placeAtEnd(el) {
  const r = document.createRange()
  r.selectNodeContents(el)
  r.collapse(false)
  const sel = window.getSelection()
  sel.removeAllRanges()
  sel.addRange(r)
}

// ── Gallery card ──────────────────────────────────────────────────────────────
function NoteCard({ note, active, onClick }) {
  return (
    <button className={`notes-card${active ? ' notes-card--on' : ''}`} onClick={onClick}>
      <span className="notes-card__page">
        <span className="notes-card__page-title">{note.title}</span>
        <span className="notes-card__page-body">{note.preview}</span>
      </span>
      <span className="notes-card__title">{note.title}</span>
      <span className="notes-card__date">{note.date}</span>
    </button>
  )
}

// ── Panel ─────────────────────────────────────────────────────────────────────

/* `honorRequests` belongs to exactly one mount — the Notes window — because a
   request from the Terminal names a note to open and is consumed once.
   `wide` centres the columns inside a maximized window.

   Selection can be driven from outside (`selectedId` / `onSelect`), which is
   how the Notes window's toolbar knows what Share or Delete act on; Finder
   leaves it to the panel. `view` is 'list' or 'gallery'. */
export default function NotesPanel({
  category = 'all', onCategoryChange, search = '', honorRequests = false, wide = false,
  selectedId, onSelect, view = 'list', onViewChange,
}) {
  const noteRequest      = useWindowStore((s) => s.noteRequest)
  const clearNoteRequest = useWindowStore((s) => s.clearNoteRequest)
  const mine             = useNotesStore((s) => s.mine)

  const [ownId, setOwnId] = useState(null)
  const activeId  = selectedId !== undefined ? selectedId : ownId
  const setActive = onSelect ?? setOwnId

  // Auto-navigate when the Terminal (or anything) asks for a specific note
  useEffect(() => {
    if (!honorRequests || !noteRequest) return
    const note = NOTES.find((n) => n.id === noteRequest.noteId)
    if (note) {
      onCategoryChange?.(noteRequest.category)
      setActive(note.id)
      onViewChange?.('list')
    }
    clearNoteRequest()
  }, [noteRequest, honorRequests])

  const myNotes = mine.map(asNote)
  const base = category === 'all'
    ? [...myNotes, ...NOTES]
    : category === 'notes'
      ? [...myNotes, ...NOTES.filter((n) => n.category === 'notes')]
      : category === 'drawing' ? [] : NOTES.filter((n) => n.category === category)

  /* Search narrows the list the caller is already showing. */
  const q = search.trim().toLowerCase()
  const filtered = q
    ? base.filter((n) => `${n.title} ${n.preview}`.toLowerCase().includes(q))
    : base

  /* Notes always has a note open — the first in the list until you pick
     another. There is no "select a note" page. */
  const activeNote = filtered.find((n) => n.id === activeId) ?? filtered[0] ?? null
  useEffect(() => {
    if (category !== 'drawing' && activeNote && activeNote.id !== activeId) setActive(activeNote.id)
  }, [activeNote?.id, category])

  const label = CATEGORIES.find((c) => c.id === category)?.label

  if (category === 'drawing') return <div className="h-full w-full"><DrawingCanvas /></div>

  if (view === 'gallery') {
    return (
      <div className="h-full w-full overflow-y-auto window-scroll">
        <div className={`notes-gallery ${wide ? 'max-w-[1140px] mx-auto' : ''}`}>
          {filtered.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              active={activeNote?.id === note.id}
              onClick={() => { setActive(note.id); onViewChange?.('list') }}
            />
          ))}
          {filtered.length === 0 && <p className="notes-empty">{q ? 'No Results' : 'No Notes'}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
    <div className={`flex h-full w-full ${wide ? 'max-w-[1140px] mx-auto' : ''}`}>

      {/* ── List ── */}
      <div className="notes-list flex flex-col flex-shrink-0 overflow-y-auto window-scroll">
        <p className="notes-list__heading">{q ? 'Results' : label}</p>
        {filtered.length === 0 && <p className="notes-empty">{q ? 'No Results' : 'No Notes'}</p>}
        {filtered.map((note) => (
          <NoteRow
            key={note.id}
            note={note}
            active={activeNote?.id === note.id}
            onClick={() => setActive(note.id)}
          />
        ))}
      </div>

      {/* ── The open note ── */}
      <div className="flex-1 min-w-0 h-full">
        {activeNote && (activeNote.mine
          ? <NoteEditor key={activeNote.id} note={activeNote} />
          : <ArticleView key={activeNote.id} note={activeNote} />)}
      </div>

    </div>
    </div>
  )
}
