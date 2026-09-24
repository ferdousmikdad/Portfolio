import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Check, Copy } from 'lucide-react'
import useSound from '@/hooks/useSound'
import resources, { allCss, toHtmlFile } from '@/data/stickResources'

/* The Shop's shelf of stick-man UI animations, lifted out of the Shop window
   so Finder can show it under its Shop favourite, the way [[ChatPanel]],
   [[PortfolioPanel]] and [[NotesPanel]] already do. A card holds the real
   thing, paused until you hover it, and opening one puts the animation beside
   the file that produces it — the markup is injected straight from the same
   strings the copy button hands over, so the demo can never drift from the
   code.

   Adding a resource to `stickResources` is all it takes to stock both places:
   nothing here keeps a list of its own. */

// ── Code colouring ────────────────────────────────────────────────────────────

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/* Enough of a highlighter to read by: comments, tags, attribute names, strings
   and at-rules. One pass over already-escaped text, so nothing it emits can
   come from the snippet itself. */
const TOKENS = /(&lt;!--[\s\S]*?--&gt;|\/\*[\s\S]*?\*\/)|(&lt;\/?[a-zA-Z][\w-]*)|(@[a-z-]+)|([a-zA-Z-:]+)(?=="|=&)|("[^"\n]*")/g

const highlight = (code) =>
  escapeHtml(code).replace(TOKENS, (m, comment, tag, at, attr, str) => {
    if (comment) return `<span class="shop-tok-comment">${comment}</span>`
    if (tag)     return `<span class="shop-tok-tag">${tag}</span>`
    if (at)      return `<span class="shop-tok-at">${at}</span>`
    if (attr)    return `<span class="shop-tok-attr">${attr}</span>`
    if (str)     return `<span class="shop-tok-str">${str}</span>`
    return m
  })

// ── Copy button ───────────────────────────────────────────────────────────────

export function CopyButton({ text, label = 'Copy code' }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* Clipboard access is refused in some embeddings; the old way still
         works there and costs nothing to keep. */
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
  }

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(t)
  }, [copied])

  return (
    <button className="shop-copy-btn" data-copied={copied} onClick={copy} onPointerDown={(e) => e.stopPropagation()}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : label}
    </button>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────

function ResourceCard({ res, onOpen }) {
  /* A plain motion.button, deliberately without `layout`: the cards sit in a
     CSS grid that re-flows on its own, and a pending layout animation inside
     an exiting parent stops AnimatePresence's exit from ever completing —
     which, under mode="wait", means the detail view never gets to mount. */
  return (
    <motion.button
      className="shop-card"
      onClick={onOpen}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      {/* The animation itself, held still until the pointer arrives */}
      <div className="shop-card__stage">
        <div className="sm-frame" dangerouslySetInnerHTML={{ __html: res.html }} />
        <span className="shop-card__hint">Hover to play</span>
      </div>

      <div className="shop-card__foot">
        <div className="min-w-0">
          <p className="shop-card__title">{res.title}</p>
          <p className="shop-card__tags">{res.tags.join(' · ')}</p>
        </div>
        {/* Bottom-right, the way a store puts the price there */}
        <span className="shop-card__cta">Get code</span>
      </div>
    </motion.button>
  )
}

// ── Detail: preview beside its source ─────────────────────────────────────────

/* The live preview beside the file that produces it — shared by this
   panel's detail view and the App Store's product page. */
export function ResourcePanes({ res, stacked }) {
  const file = useMemo(() => toHtmlFile(res), [res])
  const code = useMemo(() => highlight(file), [file])
  return (
    <div className="shop-detail__cols" data-stacked={stacked}>
      <div className="shop-pane">
        <div className="shop-pane__head">
          <span>Preview</span>
          <span className="shop-pane__tags">{res.tags.join(' · ')}</span>
        </div>
        <div className="shop-pane__body shop-pane__body--preview">
          <div className="sm-frame sm-frame--live" dangerouslySetInnerHTML={{ __html: res.html }} />
        </div>
      </div>
      <div className="shop-pane shop-pane--code">
        <div className="shop-pane__head">
          <span className="font-mono">{res.id}.html</span>
          <CopyButton text={file} />
        </div>
        <div className="shop-pane__body shop-pane__body--code window-scroll">
          <pre className="shop-code"><code dangerouslySetInnerHTML={{ __html: code }} /></pre>
        </div>
      </div>
    </div>
  )
}

function ResourceDetail({ res, onBack, stacked }) {
  return (
    <motion.div
      className="shop-detail"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
    >
      <div className="shop-detail__bar">
        <button className="shop-back" onClick={onBack} onPointerDown={(e) => e.stopPropagation()}>
          <ChevronLeft size={13} /> All resources
        </button>
        <div className="min-w-0 flex-1">
          <p className="shop-detail__title">{res.title}</p>
          <p className="shop-detail__blurb">{res.blurb}</p>
        </div>
      </div>

      <ResourcePanes res={res} stacked={stacked} />
    </motion.div>
  )
}

// ── Panel ─────────────────────────────────────────────────────────────────────

/* `category` and `search` are the caller's to drive: the Shop window has no
   chrome for them, Finder filters from its own sidebar and search field. */
export default function ShopPanel({ category = null, search = '', heading = true }) {
  const play = useSound()
  const [openId, setOpenId] = useState(null)

  const shelf = useMemo(() => {
    let list = category ? resources.filter((r) => r.category === category) : resources
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((r) =>
        `${r.title} ${r.blurb} ${r.tags.join(' ')}`.toLowerCase().includes(q))
    }
    return list
  }, [category, search])

  /* A resource filtered out from under an open detail should not strand the
     view on something the shelf no longer holds. */
  const open = shelf.find((r) => r.id === openId) ?? null
  useEffect(() => { if (openId && !open) setOpenId(null) }, [openId, open])

  /* Side by side needs room. The panel is resizable and lives inside the
     viewport, so a media query would answer the wrong question — measure the
     pane instead. */
  const bodyRef = useRef(null)
  const [stacked, setStacked] = useState(false)
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setStacked(entry.contentRect.width < 680))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <>
      {/* Every snippet's keyframes, mounted once for the whole shelf */}
      <style dangerouslySetInnerHTML={{ __html: allCss }} />

      <div ref={bodyRef} className="shop-body window-scroll">
        <AnimatePresence mode="wait">
          {open ? (
            <ResourceDetail
              key={open.id}
              res={open}
              stacked={stacked}
              onBack={() => { play('open'); setOpenId(null) }}
            />
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {heading && (
                <div className="shop-head">
                  <p className="shop-head__title">Stick-man UI</p>
                  <p className="shop-head__sub">
                    {resources.length} free animations — HTML + Tailwind, one file each. Hover a card to play it.
                  </p>
                </div>
              )}

              {shelf.length > 0 ? (
                <div className="shop-grid">
                  {shelf.map((res) => (
                    <ResourceCard
                      key={res.id}
                      res={res}
                      onOpen={() => { play('open'); setOpenId(res.id) }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2" style={{ paddingTop: 72 }}>
                  <p className="text-[12px]" style={{ color: 'var(--body)', opacity: 0.55 }}>
                    No resources found
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
