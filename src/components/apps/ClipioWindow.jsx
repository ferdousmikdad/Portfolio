import Window from '@/components/window/Window'
import useWindowStore from '@/store/windowStore'
import {
  CLIPIO_ICON, CLIPIO_CAPTURES, CLIPIO_RECORDS, CLIPIO_FEATURES, CLIPIO_SPECS, openClipioSite,
} from '@/data/clipio'

/* ── Clipio ────────────────────────────────────────────────────────────────
   What the menu-bar extra opens: Clipio's own "about" panel. The About This
   Mac layout (icon, name, dim subtitle, right-aligned spec labels, buttons
   at the bottom) with the app's tools in between, each with its real glyph
   and default chord. Nothing on it captures — it shows what the app does.  */

function Tool({ label, glyph, keyLabel }) {
  return (
    <li className="clipio__tool">
      <span className="clipio__glyph" style={{ '--tpl': `url("${glyph}")` }} />
      <span className="clipio__tool-label">{label}</span>
      <kbd className="clipio__key">{keyLabel}</kbd>
    </li>
  )
}

export default function ClipioWindow() {
  const openWindow = useWindowStore((s) => s.openWindow)

  return (
    <Window id="clipio" title="" disableMaximize centerTitle>
      <div className="atm clipio">
        <img className="atm__art clipio__icon" src={CLIPIO_ICON} alt="" draggable={false} />

        <p className="atm__model">Clipio</p>
        <p className="atm__sub">Screen recorder, screenshots and GIFs for macOS</p>

        <ul className="clipio__features">
          {CLIPIO_FEATURES.map((f) => (
            <li key={f.title}>
              <strong>{f.title}</strong> {f.detail}
            </li>
          ))}
        </ul>

        <div className="clipio__tools">
          <ul>
            {CLIPIO_CAPTURES.map((t) => <Tool key={t.label} label={t.label} glyph={t.glyph} keyLabel={t.key} />)}
          </ul>
          <ul>
            {CLIPIO_RECORDS.map((t) => <Tool key={t.label} label={t.label} glyph={t.glyph} keyLabel={t.key} />)}
          </ul>
        </div>

        <dl className="atm__specs">
          {CLIPIO_SPECS.map(([label, value]) => (
            <div className="atm__row" key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="atm__buttons">
          <button type="button" className="atm__btn" onClick={() => openWindow('contact')}>
            Ask for the Beta…
          </button>
          <button type="button" className="atm__btn" data-default="true" onClick={openClipioSite}>
            Download for Mac…
          </button>
        </div>
      </div>
    </Window>
  )
}
