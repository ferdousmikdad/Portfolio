/* ── Time Machine backups ────────────────────────────────────────────────────
   Each backup is a real screenshot of this portfolio as it was: the commit
   was checked out, run, and captured at 1512×945 the way a visitor landed
   on it. Nothing here was recreated. Newest first, as Time Machine lists
   them; the notes come from the commit history of that period.

   To add one: check out the commit, run it, screenshot, save the .webp in
   public/timemachine/, and add a row here.                                */

const BACKUPS = [
  {
    id: 'tahoe',
    date: '2026-09-25',
    commit: 'today',
    title: 'The Tahoe rebuild',
    note: 'Blue accent, and the apps rebuilt against the real ones on a Mac: Photos, Preview, Contacts, Messages, App Store, Music, Notes, Finder, Spotlight.',
    image: '/timemachine/2026-09-tahoe.webp',
  },
  {
    id: 'dock',
    date: '2026-09-21',
    commit: '68dabf2',
    title: 'Liquid Glass dock and real menus',
    note: 'A Tahoe dock with Liquid Glass, real menu-bar menus, About This Mac, Mission Control, Launchpad, Stage Manager, Photo Booth and a working Software Update.',
    image: '/timemachine/2026-09-dock.webp',
  },
  {
    id: 'finder',
    date: '2026-05-20',
    commit: 'baf8f4e',
    title: 'Finder, Terminal and Settings',
    note: 'Finder and a Terminal (with Cloudflare Workers AI) arrive, then System Settings; the menu becomes a dock, and Home turns into an AI chat. Red was still the accent.',
    image: '/timemachine/2026-05-finder.webp',
  },
  {
    id: 'menubar',
    date: '2026-04-15',
    commit: 'f1f0f59',
    title: 'A menu bar and Mikuda',
    note: 'A macOS-style top bar, window colours matched to macOS, and the first Mikuda chatbot answering questions about the work.',
    image: '/timemachine/2026-04-menubar.webp',
  },
  {
    id: 'desktop',
    date: '2026-04-12',
    commit: '1c8fcbe',
    title: 'Moved to React, inspired by macOS',
    note: 'The site is rebuilt in React as a desktop: windows with traffic lights, an About card, and Pac-Man in a window of its own.',
    image: '/timemachine/2026-04-desktop.webp',
  },
  {
    id: 'tools',
    date: '2026-04-06',
    commit: '2f9a7be',
    title: 'Tools and a shop',
    note: 'Still one page of vanilla JS, now with ten design tools, a Shop and a Work page in the nav.',
    image: '/timemachine/2026-04-tools.webp',
  },
  {
    id: 'first',
    date: '2025-10-06',
    commit: '912f782',
    title: 'The first site',
    note: 'One dark page in a pixel font: portrait, a short bio, and a Pac-Man game behind “Play Game!”. Hand-written HTML, CSS and JavaScript.',
    image: '/timemachine/2025-10-first-site.webp',
  },
]

export default BACKUPS
