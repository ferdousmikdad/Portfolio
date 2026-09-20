import Window from '@/components/window/Window'
import useWindowStore from '@/store/windowStore'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'

/* ── About This Mac ────────────────────────────────────────────────────────
   The panel the Apple menu puts up, with the résumé in place of the spec
   sheet. AppKit's layout: the device portrait on top, the model name under
   it in large semibold with a dim subtitle, then a two-column spec list —
   labels right-aligned against their values — and the buttons in a row at
   the bottom.

   Every value here is a real fact pulled from the portfolio's own copy
   (`BioWindow`, `AboutMeWindow`) rather than invented, so the joke is the
   framing, not the content. The one exception is the chip name, which is
   plainly a gag and reads as one.                                          */

const SPECS = [
  ['Chip',         'Mikdad M5 Pro'],
  ['Memory',       '5+ years experience'],
  ['Graphics',     'Figma · Illustrator · After Effects'],
  ['Engineering',  'React · Tailwind · Framer'],
  ['Startup Disk', 'Print & Branding'],
  ['Serial Number', 'AVAILABLE-FOR-HIRE'],
]

export default function AboutMacWindow() {
  const openWindow = useWindowStore((s) => s.openWindow)

  return (
    <Window id="about-mac" title="" disableMaximize centerTitle>
      <div className="atm">
        <img className="atm__art" src={mikdadHeadUrl} alt="" draggable={false} />

        <p className="atm__model">Ferdous Mikdad</p>
        <p className="atm__sub">Creative &amp; UI/UX Designer</p>

        <dl className="atm__specs">
          {SPECS.map(([label, value]) => (
            <div className="atm__row" key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="atm__buttons">
          <button type="button" className="atm__btn" onClick={() => openWindow('contact')}>
            Contact…
          </button>
          <button
            type="button"
            className="atm__btn"
            data-default="true"
            onClick={() => openWindow('about')}
          >
            More Info…
          </button>
        </div>
      </div>
    </Window>
  )
}
