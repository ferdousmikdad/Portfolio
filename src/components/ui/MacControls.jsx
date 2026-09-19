/* ── AppKit control vocabulary ──────────────────────────────────────────────
   The handful of controls System Settings is built out of, sized off the real
   thing: a 38×22 switch, a 4px slider track under a 20px knob, pop-up buttons
   that put the chevron pair in a tinted square, and the grouped card whose
   rows are divided by a hairline that stops short of the left inset.

   Everything here is presentation only — panes own their state.             */

import { useRef, useCallback } from 'react'

/* Grouped card. macOS puts the section title outside the card, in the window
   background, and never inside it. */
export function Group({ title, note, children }) {
  return (
    <div className="mac-group">
      {title && <h3 className="mac-group__title">{title}</h3>}
      <div className="mac-card">{children}</div>
      {note && <p className="mac-group__note">{note}</p>}
    </div>
  )
}

export function Row({ label, secondary, children, onClick, align = 'center', icon }) {
  const Tag = onClick ? 'button' : 'div'
  // A row with nothing on the left is a full-width well — the wallpaper grid,
  // a resolution strip — so the control stops hugging the right edge.
  const bare = !label && !secondary && !icon
  return (
    <Tag
      className={`mac-row${onClick ? ' mac-row--action' : ''}${bare ? ' mac-row--bare' : ''}`}
      style={{ alignItems: align === 'top' ? 'flex-start' : 'center' }}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {icon && <span className="mac-row__icon">{icon}</span>}
      {(label || secondary) && (
        <span className="mac-row__text">
          {label && <span className="mac-row__label">{label}</span>}
          {secondary && <span className="mac-row__secondary">{secondary}</span>}
        </span>
      )}
      <span className="mac-row__control">{children}</span>
    </Tag>
  )
}

/* A row whose content fills the full width — used for sliders and pickers that
   sit under their own label rather than beside it. */
export function StackRow({ label, children }) {
  return (
    <div className="mac-row mac-row--stack">
      {label && <span className="mac-row__label">{label}</span>}
      {children}
    </div>
  )
}

export function Switch({ value, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!value}
      disabled={disabled}
      className="mac-switch"
      data-on={!!value}
      onClick={(e) => { e.stopPropagation(); onChange(!value) }}
    >
      <span className="mac-switch__knob" />
    </button>
  )
}

export function Popup({ value, options, onChange, width }) {
  return (
    <label className="mac-popup" style={width ? { minWidth: width } : undefined}>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
      <span className="mac-popup__value">
        {options.find(o => String(o.value ?? o) === String(value))?.label
          ?? options.find(o => String(o) === String(value)) ?? value}
      </span>
      <span className="mac-popup__chevrons" aria-hidden="true">
        <svg width="7" height="12" viewBox="0 0 7 12" fill="currentColor">
          <path d="M3.5 0 L6.6 4.1 H0.4 Z" />
          <path d="M3.5 12 L0.4 7.9 H6.6 Z" />
        </svg>
      </span>
    </label>
  )
}

/* Dragging anywhere on the track moves the knob, which is how AppKit sliders
   behave — a click on the track jumps rather than paging. */
export function Slider({ value, onChange, min = 0, max = 100, leading, trailing, tone = 'accent' }) {
  const trackRef = useRef(null)

  const setFromEvent = useCallback((clientX) => {
    const el = trackRef.current
    if (!el) return
    const { left, width } = el.getBoundingClientRect()
    const t = Math.min(1, Math.max(0, (clientX - left) / width))
    onChange(Math.round(min + t * (max - min)))
  }, [min, max, onChange])

  const onPointerDown = (e) => {
    e.preventDefault()
    setFromEvent(e.clientX)
    const move = (ev) => setFromEvent(ev.clientX)
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="mac-slider" data-tone={tone}>
      {leading && <span className="mac-slider__cap">{leading}</span>}
      <div className="mac-slider__track" ref={trackRef} onPointerDown={onPointerDown}>
        <div className="mac-slider__fill" style={{ width: `${pct}%` }} />
        <div className="mac-slider__knob" style={{ left: `${pct}%` }} />
      </div>
      {trailing && <span className="mac-slider__cap">{trailing}</span>}
    </div>
  )
}

export function Radio({ checked, onChange, label }) {
  return (
    <button type="button" className="mac-radio" data-on={checked} onClick={() => onChange(true)}>
      <span className="mac-radio__dot" />
      {label && <span className="mac-radio__label">{label}</span>}
    </button>
  )
}

export function Checkbox({ checked, onChange, label }) {
  return (
    <button type="button" className="mac-check" data-on={checked} onClick={() => onChange(!checked)}>
      <span className="mac-check__box">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4.2 L3.6 6.8 L9 1.2" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {label && <span className="mac-check__label">{label}</span>}
    </button>
  )
}

export function PushButton({ children, onClick, prominent }) {
  return (
    <button type="button" className={`mac-button${prominent ? ' mac-button--prominent' : ''}`} onClick={onClick}>
      {children}
    </button>
  )
}

/* The thumbnail picker: Appearance's Auto/Light/Dark, Wallpaper's grid. The
   selection ring sits *outside* the thumbnail, so the artwork never shifts. */
export function ThumbOption({ selected, onClick, caption, children, wide }) {
  return (
    <button type="button" className="mac-thumb" data-on={selected} onClick={onClick}>
      <span className="mac-thumb__frame" style={wide ? { width: wide } : undefined}>{children}</span>
      {caption && <span className="mac-thumb__caption">{caption}</span>}
    </button>
  )
}

export function Swatch({ color, selected, onClick, label, multi }) {
  return (
    <button
      type="button"
      className="mac-swatch"
      data-on={selected}
      onClick={onClick}
      title={label}
      style={{
        background: multi
          ? 'conic-gradient(from 210deg, #f5c518, #63c76a, #0a84ff, #a259d9, #f0559c, #cf0506, #f0803c, #f5c518)'
          : color,
      }}
    />
  )
}
