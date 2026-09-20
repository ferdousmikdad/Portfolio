import Window from '@/components/window/Window'
import useWindowStore from '@/store/windowStore'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'
import SYS from '@/data/systemProfile'

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
  ['Chip',          SYS.chip],
  ['Memory',        SYS.experience],
  ['Graphics',      SYS.design],
  ['Engineering',   SYS.engineering],
  ['Startup Disk',  SYS.origin],
  ['Serial Number', SYS.serial],
]

export default function AboutMacWindow() {
  const openWindow = useWindowStore((s) => s.openWindow)

  return (
    <Window id="about-mac" title="" disableMaximize centerTitle>
      <div className="atm">
        <img className="atm__art" src={mikdadHeadUrl} alt="" draggable={false} />

        <p className="atm__model">{SYS.name}</p>
        <p className="atm__sub">{SYS.role}</p>

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
