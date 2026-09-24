import useDesktopStore from '@/store/desktopStore'
import useTrashStore, { trashedFrom } from '@/store/trashStore'
import DESKTOP_FILES from '@/data/desktopFiles'
import folderIconUrl from '@/assets/icons/Folder.png'

/* The day the portfolio's own files were put on the desktop. */
export const SHIPPED_AT = '2026-09-01T10:00:00'
export const DESKTOP_PATH = 'Macintosh HD ▸ Users ▸ ferdous ▸ Desktop'

/* Everything on the desktop, as one list: the shipped files and the
   visitor's folders, minus whatever is in the Trash, with renames and tags
   applied. The desktop itself and Finder's Desktop, Recents and Tags views
   all read this, so a rename or a tag shows up everywhere at once. */
export default function useDesktopItems() {
  const folders    = useDesktopStore((s) => s.folders)
  const names      = useDesktopStore((s) => s.names)
  const tags       = useDesktopStore((s) => s.tags)
  const trashItems = useTrashStore((s) => s.items)
  const trashed    = trashedFrom(trashItems, 'desktop')

  return [
    ...DESKTOP_FILES.map((f) => ({ ...f, addedAt: Date.parse(SHIPPED_AT) })),
    ...folders.map((f) => ({ ...f, kind: 'folder', icon: folderIconUrl, size: 'Zero bytes' })),
  ]
    .filter((f) => !trashed.has(f.id))
    .map((f) => ({ ...f, name: names[f.id] ?? f.name, tags: tags[f.id] ?? [] }))
}
