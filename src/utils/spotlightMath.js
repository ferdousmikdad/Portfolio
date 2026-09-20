/* ── Spotlight calculator & conversions ────────────────────────────────────
   Spotlight answers `12*9` inline before it offers you anything to open, and
   so does this.

   The expression is parsed rather than evaluated. `eval` (or `new Function`)
   on a string the visitor typed is a script-injection hole for a feature
   whose whole job is to add two numbers — so this is a tokeniser and a
   shunting-yard pass over a fixed operator table. Anything it does not
   recognise returns null and Spotlight just shows its normal results.

   Currency is deliberately absent. Rates move daily; hard-coding one would
   mean confidently printing a wrong number, which is worse than printing
   nothing. Only conversions with fixed, defined ratios are here.          */

const OPS = {
  '+': { prec: 1, apply: (a, b) => a + b },
  '-': { prec: 1, apply: (a, b) => a - b },
  '*': { prec: 2, apply: (a, b) => a * b },
  '/': { prec: 2, apply: (a, b) => a / b },
  '%': { prec: 2, apply: (a, b) => a % b },
  '^': { prec: 3, apply: (a, b) => a ** b, right: true },
}

/** Split into numbers, operators and brackets. Returns null on any stray character. */
function tokenize(src) {
  // The symbols a person actually types, mapped to the ones the table knows.
  const s = src.replace(/×/g, '*').replace(/÷/g, '/').replace(/,/g, '')
  const tokens = []
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (c === ' ') { i++; continue }
    if (/[0-9.]/.test(c)) {
      let j = i
      while (j < s.length && /[0-9.]/.test(s[j])) j++
      const n = Number(s.slice(i, j))
      if (!Number.isFinite(n)) return null
      tokens.push({ t: 'num', v: n })
      i = j
      continue
    }
    if (OPS[c] || c === '(' || c === ')') { tokens.push({ t: 'op', v: c }); i++; continue }
    return null
  }
  return tokens
}

/** Shunting-yard into RPN, then fold. Null if the expression is malformed. */
function evalTokens(tokens) {
  const out = []
  const stack = []
  let prev = null

  for (const tok of tokens) {
    if (tok.t === 'num') { out.push(tok.v); prev = tok; continue }
    const c = tok.v
    if (c === '(') { stack.push(c); prev = tok; continue }
    if (c === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') out.push(stack.pop())
      if (!stack.length) return null            // unbalanced
      stack.pop()
      prev = tok
      continue
    }
    // Unary minus: a '-' with no value before it starts a negative number.
    if (c === '-' && (!prev || (prev.t === 'op' && prev.v !== ')'))) {
      out.push(0)
    }
    const op = OPS[c]
    while (stack.length) {
      const top = stack[stack.length - 1]
      if (top === '(') break
      const t = OPS[top]
      if (t.prec > op.prec || (t.prec === op.prec && !op.right)) out.push(stack.pop())
      else break
    }
    stack.push(c)
    prev = tok
  }
  while (stack.length) {
    const op = stack.pop()
    if (op === '(') return null                 // unbalanced
    out.push(op)
  }

  const vals = []
  for (const item of out) {
    if (typeof item === 'number') { vals.push(item); continue }
    const b = vals.pop()
    const a = vals.pop()
    if (a === undefined || b === undefined) return null
    vals.push(OPS[item].apply(a, b))
  }
  return vals.length === 1 ? vals[0] : null
}

/** Trim float noise without lying about precision. */
function tidy(n) {
  if (!Number.isFinite(n)) return null
  const r = Math.round(n * 1e10) / 1e10
  return Number.isInteger(r) ? String(r) : String(Number(r.toFixed(6)))
}

/* ── Units ─────────────────────────────────────────────────────────────────
   Every ratio here is exact by definition, so the answers cannot go stale
   the way a currency rate would. Base units: metre, gram, byte. */
const UNITS = {
  // length → metres
  mm: ['length', 0.001], cm: ['length', 0.01], m: ['length', 1], km: ['length', 1000],
  in: ['length', 0.0254], inch: ['length', 0.0254], inches: ['length', 0.0254],
  ft: ['length', 0.3048], foot: ['length', 0.3048], feet: ['length', 0.3048],
  yd: ['length', 0.9144], yard: ['length', 0.9144], yards: ['length', 0.9144],
  mi: ['length', 1609.344], mile: ['length', 1609.344], miles: ['length', 1609.344],
  // mass → grams
  mg: ['mass', 0.001], g: ['mass', 1], kg: ['mass', 1000],
  oz: ['mass', 28.349523125], lb: ['mass', 453.59237], lbs: ['mass', 453.59237],
  // data → bytes (binary, as a Mac reports them)
  b: ['data', 1], kb: ['data', 1024], mb: ['data', 1024 ** 2],
  gb: ['data', 1024 ** 3], tb: ['data', 1024 ** 4],
}

const TEMPS = { c: 1, celsius: 1, f: 1, fahrenheit: 1, k: 1, kelvin: 1 }
const toC = (v, u) => (u[0] === 'f' ? (v - 32) * 5 / 9 : u[0] === 'k' ? v - 273.15 : v)
const fromC = (v, u) => (u[0] === 'f' ? v * 9 / 5 + 32 : u[0] === 'k' ? v + 273.15 : v)

const CONVERT_RE = /^\s*(-?[\d.]+)\s*([a-z°]+)\s+(?:to|in|as)\s+([a-z°]+)\s*$/i

function convert(q) {
  const m = q.match(CONVERT_RE)
  if (!m) return null
  const value = Number(m[1])
  if (!Number.isFinite(value)) return null
  const from = m[2].toLowerCase().replace('°', '')
  const to = m[3].toLowerCase().replace('°', '')

  if (TEMPS[from] && TEMPS[to]) {
    const out = fromC(toC(value, from), to)
    // Kelvin takes no degree sign — it is an absolute scale, written "273.15 K".
    const sym = to[0] === 'k' ? 'K' : `°${to[0].toUpperCase()}`
    return { value: tidy(out), unit: sym }
  }

  const a = UNITS[from]
  const b = UNITS[to]
  if (!a || !b || a[0] !== b[0]) return null
  return { value: tidy((value * a[1]) / b[1]), unit: to }
}

/**
 * Returns `{ value, label }` for a query Spotlight can answer itself, or null.
 * `label` is what belongs under the answer — the query, echoed the way the
 * real Spotlight echoes it.
 */
export default function spotlightAnswer(raw) {
  const q = raw.trim()
  if (!q) return null

  const conv = convert(q)
  if (conv && conv.value !== null) {
    return { value: `${conv.value} ${conv.unit}`, label: q }
  }

  // Needs at least one operator, or every single number typed would "answer".
  if (!/[+\-*/%^×÷]/.test(q)) return null
  const tokens = tokenize(q.replace(/^=/, ''))
  if (!tokens || !tokens.length) return null
  const out = evalTokens(tokens)
  if (out === null) return null
  const value = tidy(out)
  return value === null ? null : { value, label: q.replace(/\s+/g, ' ') }
}
