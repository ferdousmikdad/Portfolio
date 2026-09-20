import SYS, { osString } from '@/data/systemProfile'

/* ── The available update ──────────────────────────────────────────────────
   One descriptor, read by the Software Update pane, the Notification Centre
   note that advertises it, and the What's New window that opens once it has
   installed. Bump `VERSION` and write a new note list and all three follow.

   The release notes are the one part of this that is not a joke: every line
   describes something this desk can genuinely do, and every line launches
   the thing it names. A fake changelog would have been easier and would have
   taught a visitor nothing.                                                */

export const UPDATE_VERSION = '26.1'
export const UPDATE_NAME    = osString(UPDATE_VERSION)
/* Sized like a real macOS point release rather than a punchline — the number
   is wallpaper, and a silly one would undercut the pane around it. */
export const UPDATE_SIZE    = '3.14 GB'

export const UPDATE_SUMMARY =
  `${UPDATE_NAME} brings window management, a Terminal that answers back, ` +
  'and a camera that shoots in halftone.'

/* `open` is resolved by the component, so this file imports no stores.
   'window'  → openWindow(id)
   'action'  → one of the desktop-wide toggles the What's New window wires up
   'tool'    → the tools page, focused on that tool                          */
export const RELEASE_NOTES = [
  {
    title: 'Mission Control',
    body: 'Every open window laid out at once, live rather than screenshotted. ' +
          'Click one to bring it forward.',
    open: { kind: 'action', id: 'mission' },
    cta: 'Show me',
  },
  {
    title: 'Stage Manager',
    body: 'One window on the stage, the rest as thumbnails down the left. ' +
          'Also in Control Centre.',
    open: { kind: 'action', id: 'stage' },
    cta: 'Turn it on',
  },
  {
    title: 'Launchpad',
    body: 'Everything installed on one grid. Start typing to filter it.',
    open: { kind: 'action', id: 'launchpad' },
    cta: 'Open',
  },
  {
    title: 'Spotlight does arithmetic',
    body: 'Type a sum or a unit conversion into Spotlight and the answer ' +
          'comes back above the results. Parsed properly — no `eval`.',
    open: { kind: 'action', id: 'spotlight' },
    cta: 'Try it',
  },
  {
    title: 'A Terminal that answers',
    body: 'Run `neofetch` for the spec sheet, `help` for everything else. ' +
          'The commands are real, the sudoers line is not.',
    open: { kind: 'window', id: 'terminal' },
    cta: 'Open Terminal',
  },
  {
    title: 'Photo Booth',
    body: 'The Retro Dot halftone running live on the webcam — the same ' +
          'filter as the standalone tool. Nothing leaves the browser.',
    open: { kind: 'window', id: 'photo-booth' },
    cta: 'Open',
  },
  {
    title: 'Hot corners',
    body: 'Push the pointer into a corner and something happens. Bottom-left ' +
          'is on out of the box; the rest are yours to assign.',
    open: { kind: 'settings', id: 'desktopdock' },
    cta: 'Configure',
  },
]

/* What the pane prints once there is nothing left to install. */
export const upToDateLine = (version) =>
  `${osString(version ?? SYS.osVersion)} — your Mac is up to date`
