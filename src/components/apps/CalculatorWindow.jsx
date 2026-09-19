import { useState, useRef, useEffect, useCallback } from 'react'
import Window from '@/components/window/Window'
import useWindowStore from '@/store/windowStore'

/* ── macOS Calculator, basic mode ──────────────────────────────────────────────

   Round keys, as the Mac draws them: a grid of circles with a double-wide
   pill under the zero, in Apple's three colours — pale functions, near-black
   digits, the orange column down the right.

   The display carries two lines. The sum being built sits on top, small and
   dim (`2 + 2 =`), and the number itself sits under it at four times the size.
   That upper line is the whole point of the pairing: without it a chain of
   presses leaves nothing on screen to check, which is why the Mac shows it.

   The arithmetic follows the Calculator's own rules rather than a textbook's:
   `=` pressed twice repeats the last operation, `%` after a + or − is a
   percentage *of the running total*, and AC turns into C the moment anything
   is entered. */

const DIGITS = 12   // what fits on the display before it goes scientific

const KEYS = [
  [{ id: 'clear', kind: 'fn' }, { id: '+/−', kind: 'fn' }, { id: '%', kind: 'fn' }, { id: '÷', kind: 'op' }],
  [{ id: '7' }, { id: '8' }, { id: '9' }, { id: '×', kind: 'op' }],
  [{ id: '4' }, { id: '5' }, { id: '6' }, { id: '−', kind: 'op' }],
  [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '+', kind: 'op' }],
  [{ id: '0', wide: true }, { id: '.' }, { id: '=', kind: 'op' }],
]

const OPERATORS = ['÷', '×', '−', '+']

const apply = (a, op, b) => {
  switch (op) {
    case '+': return a + b
    case '−': return a - b
    case '×': return a * b
    case '÷': return a / b
    default:  return b
  }
}

/** A result as the display stores it: plain digits, no grouping yet. */
function toEntry(n) {
  if (!Number.isFinite(n)) return 'Error'
  const abs = Math.abs(n)
  if (abs !== 0 && (abs >= 1e12 || abs < 1e-9)) {
    return n.toExponential(6).replace(/\.?0+e/, 'e')
  }
  return String(Number(n.toPrecision(DIGITS)))
}

/** Thousands separators, applied only for the eye — never stored. */
function grouped(entry) {
  if (entry === 'Error' || entry.includes('e')) return entry
  const neg = entry.startsWith('-')
  const [int, frac] = (neg ? entry.slice(1) : entry).split('.')
  const body = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (frac !== undefined ? `.${frac}` : '')
  return neg ? `-${body}` : body
}

/* The result never scrolls and never wraps: it drops a size instead, the way
   the real window does as a number outgrows it. */
function resultSize(shown) {
  const n = shown.replace(/[^0-9a-z]/gi, '').length
  if (n <= 6)  return 44
  if (n <= 8)  return 38
  if (n <= 10) return 32
  if (n <= 12) return 27
  return 22
}

function Key({ label, kind, wide, active, onPress }) {
  return (
    <button
      type="button"
      className={`calc-key calc-key--${kind}${wide ? ' calc-key--wide' : ''}${active ? ' active' : ''}`}
      onClick={onPress}
      tabIndex={-1}
    >
      <span className="calc-key__label">{label}</span>
    </button>
  )
}

export default function CalculatorWindow() {
  const isOpen   = useWindowStore((s) => s.getWindow('calculator')?.isOpen)
  const isActive = useWindowStore((s) => s.activeWindowId) === 'calculator'

  const [entry, setEntry] = useState('0')
  const [acc,   setAcc]   = useState(null)   // the operand waiting on the left
  const [op,    setOp]    = useState(null)
  // True while the display is showing a result rather than something typed —
  // the next digit starts a new number instead of appending to this one.
  const [fresh, setFresh] = useState(true)
  const [typed, setTyped] = useState(false)  // anything entered since the last clear
  /* The sum as it reads on the upper line, one token per press: numbers as
     they were shown, operators as their own glyphs, and `=` once it lands. */
  const [trail, setTrail] = useState([])
  const repeat = useRef(null)                // { op, operand } for a repeated `=`

  const reset = useCallback(() => {
    setEntry('0'); setAcc(null); setOp(null); setFresh(true); setTyped(false); setTrail([])
    repeat.current = null
  }, [])

  const press = useCallback((id) => {
    // An error is a dead end — anything but a clear just restates it.
    if (entry === 'Error' && id !== 'clear') return

    if (id === 'clear') {
      // C empties the number being typed; AC — which is what the key says once
      // there is nothing part-entered — wipes the sum with it.
      if (typed) { setEntry('0'); setFresh(true); setTyped(false) }
      else reset()
      return
    }

    // A digit after `=` opens a new sum rather than extending the finished one.
    const settled = trail[trail.length - 1] === '='

    if (/^[0-9]$/.test(id)) {
      setTyped(true)
      if (settled) setTrail([])
      if (fresh) { setEntry(id); setFresh(false); return }
      setEntry((e) => {
        if (e.replace(/[-.]/g, '').length >= DIGITS) return e
        return e === '0' ? id : e + id
      })
      return
    }

    if (id === '.') {
      setTyped(true)
      if (settled) setTrail([])
      if (fresh) { setEntry('0.'); setFresh(false); return }
      setEntry((e) => (e.includes('.') ? e : `${e}.`))
      return
    }

    if (id === '+/−') {
      setEntry((e) => (e === '0' ? e : e.startsWith('-') ? e.slice(1) : `-${e}`))
      return
    }

    if (id === '%') {
      const value = parseFloat(entry)
      // Apple's reading of `%`: after + or − it is a share of the running
      // total (200 + 10 % = 220), and on its own it is just a hundredth.
      const hundredth = (op === '+' || op === '−') && acc !== null
        ? (acc * value) / 100
        : value / 100
      setEntry(toEntry(hundredth))
      setFresh(true)
      setTyped(true)
      return
    }

    if (id === '=') {
      const value = parseFloat(entry)
      let result
      if (op !== null) {
        result = apply(acc, op, value)
        repeat.current = { op, operand: value }
        setTrail((t) => [...t, grouped(entry), '='])
      } else if (repeat.current) {
        result = apply(value, repeat.current.op, repeat.current.operand)
        // A repeat has no half-written sum behind it, so it states its own.
        setTrail([grouped(entry), repeat.current.op, grouped(toEntry(repeat.current.operand)), '='])
      } else {
        result = value
        setTrail([grouped(entry), '='])
      }
      setEntry(toEntry(result))
      // A finished sum leaves nothing part-entered, so the key goes back to AC.
      setAcc(null); setOp(null); setFresh(true); setTyped(false)
      return
    }

    // An operator: fold whatever is pending first, so a chain evaluates as it
    // is typed. Pressing a second operator straight after the first only
    // swaps it — nothing has been entered to fold.
    const swapping = op !== null && fresh && OPERATORS.includes(trail[trail.length - 1])
    const value = parseFloat(entry)
    if (op !== null && !fresh) {
      const result = apply(acc, op, value)
      setAcc(result)
      setEntry(toEntry(result))
    } else if (op === null) {
      setAcc(value)
    }
    setTrail((t) => {
      if (swapping) return [...t.slice(0, -1), id]
      // Carrying on from a result starts the line over with that result.
      return [...(t[t.length - 1] === '=' ? [] : t), grouped(entry), id]
    })
    setOp(id)
    setFresh(true)
    repeat.current = null
  }, [entry, acc, op, fresh, typed, trail, reset])

  /* The keyboard drives the same keys the mouse does, so there is one path
     through the machine. Only the focused Calculator listens. */
  useEffect(() => {
    if (!isOpen || !isActive) return
    const MAP = {
      '*': '×', 'x': '×', 'X': '×',
      '/': '÷',
      '-': '−',
      '+': '+',
      '=': '=', 'Enter': '=',
      '%': '%',
      '.': '.', ',': '.',
      'Escape': 'clear', 'c': 'clear', 'C': 'clear',
      'n': '+/−', 'N': '+/−',
    }
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Backspace') {
        e.preventDefault()
        if (entry === 'Error') { reset(); return }
        if (fresh) return
        setEntry((v) => {
          const next = v.replace(/.$/, '')
          return next === '' || next === '-' ? '0' : next
        })
        return
      }
      const id = /^[0-9]$/.test(e.key) ? e.key : MAP[e.key]
      if (!id) return
      e.preventDefault()
      press(id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, isActive, press, entry, fresh, reset])

  const shown = grouped(entry)

  return (
    <Window
      id="calculator"
      minSize={{ width: 232, height: 372 }}
      /* The Mac's Calculator has nothing to fill a screen with, so its zoom
         button is greyed out — this is the only window here that is. */
      disableMaximize
      shellStyle={{ background: '#1c1c1e', border: '1px solid rgba(255, 255, 255, 0.10)' }}
    >
      <div className="calc-shell">
        <div className="calc-display">
          {/* Kept in the layout even when empty, so the number never shifts up
              and down as a sum is started and finished. */}
          <div className="calc-trail">{trail.join(' ') || ' '}</div>
          <div className="calc-result" style={{ fontSize: resultSize(shown) }}>{shown}</div>
        </div>
        <div className="calc-pad">
          {KEYS.flat().map((key) => (
            <Key
              key={key.id}
              label={key.id === 'clear' ? (typed ? 'C' : 'AC') : key.id}
              kind={key.kind ?? 'num'}
              wide={key.wide}
              // The pending operator stays lit until it is spent, which is the
              // only reminder that a half-finished sum is being held.
              active={key.kind === 'op' && key.id === op && fresh}
              onPress={() => press(key.id)}
            />
          ))}
        </div>
      </div>
    </Window>
  )
}
