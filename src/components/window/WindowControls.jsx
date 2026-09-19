/* The glyphs are cut out of `Icon_Buttons.svg` by viewBox rather than redrawn:
   each circle in that sheet is 155 units across, so cropping to one of them
   gives the artwork at its own scale, untouched. They are the Mac's three —
   the crossed bars, the single bar, and the two opposed arrows — and they sit
   in the dots the window already has, which keep their colours. */

const CROP = {
  close:    '0 0 155 155',
  minimize: '193 0 155 155',
  maximize: '384 0 155 155',
}

function Glyph({ kind }) {
  return (
    <svg viewBox={CROP[kind]} className="traffic-light__glyph" aria-hidden="true" focusable="false">
      {kind === 'close' && (
        <>
          <rect x="41.8701" y="103.388" width="87" height="11" transform="rotate(-45 41.8701 103.388)" />
          <rect x="41.8701" y="49.6482" width="11" height="87" transform="rotate(-45 41.8701 49.6482)" />
        </>
      )}
      {kind === 'minimize' && <rect x="227" y="72" width="87" height="11" />}
      {kind === 'maximize' && (
        <>
          <path d="M498.242 38.8833C498.797 38.8817 499.247 39.3317 499.245 39.8862L499.092 93.5891C499.09 94.4786 498.014 94.9223 497.385 94.2933L443.835 40.7432C443.206 40.1142 443.65 39.0387 444.539 39.0361L498.242 38.8833Z" />
          <path d="M423.886 115.245C423.332 115.247 422.882 114.797 422.883 114.242L423.036 60.5394C423.039 59.6499 424.114 59.2061 424.743 59.8351L478.293 113.385C478.922 114.014 478.479 115.09 477.589 115.092L423.886 115.245Z" />
        </>
      )}
    </svg>
  )
}

export default function WindowControls({ onClose, onMinimize, onMaximize, maximizeDisabled }) {
  return (
    <div className="traffic-lights group">
      <button onClick={onClose} className="traffic-light traffic-light-close" title="Close">
        <Glyph kind="close" />
      </button>
      <button onClick={onMinimize} className="traffic-light traffic-light-minimize" title="Minimize">
        <Glyph kind="minimize" />
      </button>
      {/* A window that cannot be zoomed greys the button out and stops
          answering it — no arrows on hover, no tooltip, nothing to click. */}
      {maximizeDisabled ? (
        <span className="traffic-light traffic-light--disabled" aria-disabled="true" />
      ) : (
        <button onClick={onMaximize} className="traffic-light traffic-light-maximize" title="Maximize">
          <Glyph kind="maximize" />
        </button>
      )}
    </div>
  )
}
