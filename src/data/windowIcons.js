import TOOLS from '@/data/tools'

import documentUrl  from '@/assets/icons/macDocument.png?url'
import mikdadUrl    from '@/assets/icons/mikdad-head.svg?url'
import folderUrl    from '@/assets/icons/Folder.png?url'
import appStoreUrl  from '@/assets/icons/App Store.png?url'
import noteUrl      from '@/assets/icons/note.png?url'
import homeUrl      from '@/assets/icons/Home.png?url'
import terminalUrl  from '@/assets/icons/terminal.svg?url'
import finderUrl    from '@/assets/icons/finder.svg?url'
import settingsUrl  from '@/assets/icons/mac-system-settings.svg?url'
import spotifyUrl   from '@/assets/icons/spotify.svg?url'
import photoBoothUrl from '@/assets/icons/photobooth.png?url'
import PANE_ICONS_SOFTWARE from '@/assets/icons/settings/softwareupdate.png?url'

/* Icon shown on a window's dock tile while it is minimised. Tools carry their
   own artwork, so they are looked up rather than listed here. */
const WINDOW_ICONS = {
  bio:       documentUrl,
  skills:    documentUrl,
  contact:   documentUrl,
  profile:   mikdadUrl,
  about:     mikdadUrl,
  home:      homeUrl,
  portfolio: folderUrl,
  shop:      appStoreUrl,
  notes:     noteUrl,
  terminal:  terminalUrl,
  finder:    finderUrl,
  settings:  settingsUrl,
  spotify:   spotifyUrl,
  'about-mac': mikdadUrl,
  'whats-new': PANE_ICONS_SOFTWARE,
  'photo-booth': photoBoothUrl,
}

export default function windowIcon(id) {
  return (
    WINDOW_ICONS[id] ??
    TOOLS.find((t) => t.id === id)?.icon ??
    documentUrl
  )
}
