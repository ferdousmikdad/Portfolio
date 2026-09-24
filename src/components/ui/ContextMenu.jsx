import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SFSymbol from '@/components/ui/SFSymbol'

/* ── macOS right-click menu ────────────────────────────────────────────────
   Portalled to <body> for the same reason the dock tooltip is: every surface
   that wants one is its own stacking context, and an inline menu is trapped
   under whatever outranks its host.

   Drawn to Tahoe's measurements (Finder's File menu at 2x): 24pt rows, 13pt
   labels, an SF Symbol in a leading column, shortcuts right-aligned in
   secondary grey with their glyphs spaced apart, hairline separators inset
   from both sides, a ~12pt radius.

   Items:
     { label, onClick, disabled, danger, shortcut, icon, image, checked, badge }
     { label, icon, submenu: [...items] }   — opens to the side on hover
     { sep: true }                          — a hairline
     { header: 'Applications' }           — a small grey section title

   `icon` is an SF Symbol name; `image` an app icon URL (Recent Items);
   `badge` a grey capsule such as "1 update"; `key` is accepted as an
   alias of `shortcut`, which is what the menu-bar data calls it.
     { tags: [{ id, color, label }], selected: [ids], onToggle(id) }
                                            — Finder's row of tag dots

   A disabled item is still drawn — macOS dims "Empty Trash" rather than
   hiding it, and that dimming is how you know the basket is already empty
   before you ever open it.

   `at` is `{ x, y }` at the cursor, or `{ x, y, placement: 'above',
   align: 'center' }` to rise from an anchor instead. Dock menus are the
   second kind: on a Mac they never drop down over the dock, they grow upward
   out of the icon you clicked, centred on it.                               */

const MARGIN = 8   // closest the menu may sit to a viewport edge

/* Shortcut glyphs are set apart, "⇧ ⌘ N", not run together — but a named
   key stays one word: "⌘ Space", not "⌘ S p a c e". */
function Keys({ value }) {
  const [, mods, rest] = /^([⌃⌥⇧⌘]*)(.*)$/.exec(value)
  return (
    <span className="mac-menu__key">
      {[...mods].map((ch, i) => <span key={i}>{ch}</span>)}
      {rest && <span>{rest}</span>}
    </span>
  )
}

/* One panel. The root menu and every submenu are the same thing, so a
   submenu can have submenus of its own. */
export function Panel({ items, at, onClose, level = 0, className = '' }) {
  const ref = useRef(null)
  const [pos, setPos] = useState(null)
  const [openSub, setOpenSub] = useState(null)   // { index, rect }
  const hoverTimer = useRef(null)
  /* A menu never narrows while it is open: holding Option swaps rows for
     shorter alternates, and AppKit keeps the width so nothing shifts. */
  const widest = useRef(0)
  useLayoutEffect(() => {
    const w = ref.current?.getBoundingClientRect().width ?? 0
    if (w > widest.current) widest.current = w
  })

  /* Placed before paint, so the menu never flashes at the raw anchor point
     first: measure, apply the placement, then keep it clear of every edge the
     way AppKit does near the bottom of the display. A submenu opens to the
     right of its row and flips to the left when there is no room. */
  useLayoutEffect(() => {
    if (!at || !ref.current) return
    const r = ref.current.getBoundingClientRect()

    let x, y
    if (at.parent) {
      x = at.parent.right - 2
      if (x + r.width > window.innerWidth - MARGIN) x = at.parent.left - r.width + 2
      y = at.parent.top - 5
    } else {
      x = at.align === 'center' ? at.x - r.width / 2 : at.x
      y = at.placement === 'above' ? at.y - r.height : at.y
    }
    x = Math.min(x, window.innerWidth  - MARGIN - r.width)
    y = Math.min(y, window.innerHeight - MARGIN - r.height)
    setPos({ x: Math.max(MARGIN, x), y: Math.max(MARGIN, y) })
  }, [at])

  useEffect(() => () => clearTimeout(hoverTimer.current), [])

  // A leading column is drawn when anything in this panel needs it.
  const hasLead = items.some((it) => it.icon || it.image || it.checked !== undefined)

  const enterRow = (index, e, item) => {
    clearTimeout(hoverTimer.current)
    if (item.submenu && !item.disabled) {
      const rect = e.currentTarget.getBoundingClientRect()
      setOpenSub({ index, rect })
    } else if (openSub) {
      // A short grace period, so crossing a row on the way into the
      // submenu does not snap it shut.
      hoverTimer.current = setTimeout(() => setOpenSub(null), 180)
    }
  }

  return (
    <>
      <motion.div
        ref={ref}
        className={`mac-menu ${className}`}
        data-level={level}
        initial={{ opacity: 0, scale: level ? 1 : 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.08 } }}
        transition={{ duration: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          left: pos?.x ?? at.x ?? 0,
          top:  pos?.y ?? at.y ?? 0,
          visibility: pos ? 'visible' : 'hidden',
          minWidth: widest.current || undefined,
          transformOrigin: at.placement === 'above' ? 'bottom center' : 'top left',
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {items.map((item, i) => {
          if (item.sep) return <div key={`sep-${i}`} className="mac-menu__sep" />
          if (item.header) return <p key={`h-${i}`} className="mac-menu__header">{item.header}</p>

          if (item.tags) {
            return (
              <div key={`tags-${i}`} className="mac-menu__tags" onMouseEnter={(e) => enterRow(i, e, item)}>
                {item.tags.map((t) => {
                  const on = item.selected?.includes(t.id)
                  return (
                    <button
                      key={t.id}
                      className="mac-menu__tag"
                      data-on={on || undefined}
                      style={{ '--tag': t.color }}
                      title={on ? `Remove ${t.label}` : t.label}
                      onClick={() => { item.onToggle?.(t.id); onClose() }}
                    >
                      {on && <SFSymbol name="checkmark" size={8} />}
                    </button>
                  )
                })}
              </div>
            )
          }

          const open = openSub?.index === i
          return (
            <button
              key={item.label}
              className="mac-menu__item"
              data-disabled={item.disabled || undefined}
              data-danger={item.danger || undefined}
              data-open={open || undefined}
              data-lead={hasLead || undefined}
              disabled={item.disabled}
              onMouseEnter={(e) => enterRow(i, e, item)}
              onClick={(e) => {
                if (item.submenu) { setOpenSub({ index: i, rect: e.currentTarget.getBoundingClientRect() }); return }
                item.onClick?.()
                onClose()
              }}
            >
              {hasLead && (
                <span className="mac-menu__lead">
                  {item.checked
                    ? <SFSymbol name="checkmark" size={11} />
                    : item.image
                      ? <img src={item.image} alt="" draggable={false} className="mac-menu__img" />
                      : item.icon && <SFSymbol name={item.icon} size={13} />}
                </span>
              )}
              <span className="mac-menu__label">{item.label}</span>
              {item.badge && <span className="mac-menu__badge">{item.badge}</span>}
              {(item.shortcut ?? item.key) && <Keys value={item.shortcut ?? item.key} />}
              {item.submenu && <SFSymbol name="chevron.right" size={9} className="mac-menu__chev" />}
            </button>
          )
        })}
      </motion.div>

      {openSub && items[openSub.index]?.submenu && (
        <Panel
          key={openSub.index}
          items={items[openSub.index].submenu}
          at={{ parent: openSub.rect }}
          onClose={onClose}
          level={level + 1}
          className={className}
        />
      )}
    </>
  )
}

export default function ContextMenu({ at, items, onClose }) {
  const rootRef = useRef(null)

  /* Callers pass `onClose` as an inline arrow, so its identity changes on
     every render of the host. The dock re-renders on every mousemove while
     it magnifies, so keeping `onClose` in the dependency list tore these
     listeners down and rebuilt them dozens of times a second — and Escape
     went unheard. Held in a ref, the subscription happens once per open. */
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])

  useEffect(() => {
    if (!at) return
    const close  = () => closeRef.current?.()
    const onKey  = (e) => { if (e.key === 'Escape') { e.preventDefault(); close() } }
    // Any press outside every open panel — root or submenu — dismisses.
    const onDown = (e) => { if (!e.target.closest?.('.mac-menu')) close() }
    window.addEventListener('keydown', onKey)
    // Capture phase: close before the click reaches whatever is underneath.
    window.addEventListener('mousedown', onDown, true)
    window.addEventListener('contextmenu', onDown, true)
    window.addEventListener('blur', close)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onDown, true)
      window.removeEventListener('contextmenu', onDown, true)
      window.removeEventListener('blur', close)
    }
  }, [at])

  return createPortal(
    <AnimatePresence>
      {at && (
        <div ref={rootRef} key={`${at.x},${at.y}`}>
          <Panel items={items} at={at} onClose={() => closeRef.current?.()} />
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
