import Window from '@/components/window/Window'
import useWindowStore from '@/store/windowStore'
import useSettingsStore from '@/store/settingsStore'
import useUpdateStore from '@/store/updateStore'
import { RELEASE_NOTES, UPDATE_NAME } from '@/data/softwareUpdate'
import mikdadHeadUrl from '@/assets/icons/mikdad-head.svg?url'

/* ── What's New ────────────────────────────────────────────────────────────
   The sheet macOS puts up after an update installs.

   The roadmap's original plan for F21 was "installs → reveals a new
   project". That was dropped on purpose: the Portfolio is auto-discovered
   from `public/portfolio/`, so a project that appears only after an easter
   egg would have to be invented — fake design work presented as Mikdad's,
   which is not a trade worth making for a gag.

   So the reward is the truth instead. Every row below names something this
   desk can actually do and launches it, which makes the update the best
   guided tour the portfolio has. */

export default function WhatsNewWindow() {
  const openWindow     = useWindowStore((s) => s.openWindow)
  const openSettingsAt = useWindowStore((s) => s.openSettingsAt)
  const openSpotlight  = useWindowStore((s) => s.openSpotlight)
  const missionControl = useWindowStore((s) => s.toggleMissionControl)
  const launchpad      = useWindowStore((s) => s.toggleLaunchpad)
  const closeWindow    = useWindowStore((s) => s.closeWindow)
  const setStage       = useSettingsStore((s) => s.update)
  const version        = useUpdateStore((s) => s.installedVersion)

  /* Anything that takes over the screen closes this sheet first, or it ends
     up sitting on top of the thing it just showed you. */
  const run = (open) => {
    const { kind, id } = open
    if (kind === 'window')   { openWindow(id); return }
    if (kind === 'settings') { closeWindow('whats-new'); openSettingsAt(id); return }
    closeWindow('whats-new')
    if (id === 'mission')   missionControl()
    if (id === 'launchpad') launchpad()
    if (id === 'spotlight') openSpotlight()
    if (id === 'stage')     setStage({ stageManager: true })
  }

  return (
    <Window id="whats-new" title="" disableMaximize centerTitle
            minSize={{ width: 420, height: 420 }}>
      <div className="wn">
        <header className="wn__head">
          <img className="wn__art" src={mikdadHeadUrl} alt="" draggable={false} />
          <p className="wn__eyebrow">Update installed</p>
          <h2 className="wn__title">{version ? `macOS Mikdad ${version}` : UPDATE_NAME}</h2>
          <p className="wn__sub">
            Everything below is real and is one click away. Nothing was
            downloaded to get here.
          </p>
        </header>

        <ul className="wn__list">
          {RELEASE_NOTES.map((n) => (
            <li className="wn__note" key={n.title}>
              <div className="wn__note-text">
                <p className="wn__note-title">{n.title}</p>
                <p className="wn__note-body">{n.body}</p>
              </div>
              <button type="button" className="wn__note-btn" onClick={() => run(n.open)}>
                {n.cta}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Window>
  )
}
