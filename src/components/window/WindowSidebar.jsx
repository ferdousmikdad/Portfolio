import WindowControls from './WindowControls'

/* ── The sidebar pane ───────────────────────────────────────────────────────
   Every window with a left column shares this one shell, the way every macOS
   sidebar is the same NSVisualEffectView with different rows inside it.

   The pane is mostly the window's own solid colour. The backdrop only bleeds
   in over the top-right, fading out along the diagonal — and the band where
   the two meet, sampled colour blending into window colour, is the gradient a
   real sidebar actually shows. Glass is an accent here, not the fill.

   Three stacked layers inside the card, and the order is load-bearing:

     __glass   the vibrancy. `backdrop-filter` samples whatever is behind the
               window, blurred past the point where any shape survives, so
               only colour is left. Covers the whole card.

     __fill    the window's solid colour, painted OVER the glass with its
               alpha ramping from nothing at the top-right corner to opaque by
               a third of the way down. It has to sit on top: anything opaque
               *beneath* the glass would be all the filter could sample, and
               the vibrancy would collapse to a blur of one flat colour.

     rows      the traffic lights and whatever the window puts in.

   The content pane to the right stays opaque — that contrast is the whole
   reason the sidebar reads as glass sitting on the desktop rather than as a
   panel painted inside the window.                                          */

export default function WindowSidebar({
  width = 210,
  /* The solid frame around the card, given as border widths rather than
     padding: a border is painted outside the card's box, so the card is still
     backed by nothing but the desktop and its glass keeps sampling. Finder
     and Notes keep a hair of it on the right of the card; Home and Spotify
     run their card up to the content pane. */
  gutter = '6px 4px 6px 6px',
  tone,
  controls,
  panelStyle,
  style,
  children,
}) {
  return (
    <div
      className={`window-sidebar${tone ? ` window-sidebar--${tone}` : ''}`}
      style={{ width, borderWidth: gutter, ...style }}
    >
      <div className="window-sidebar__panel" style={panelStyle}>
        <div className="window-sidebar__glass" />
        <div className="window-sidebar__fill" />
        <div className="window-sidebar__lights">
          <WindowControls {...controls} />
        </div>
        {children}
      </div>
    </div>
  )
}
