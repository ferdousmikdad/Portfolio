import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import mikdadPhotoUrl  from '@/assets/images/mikdad.jpg'
import iphoneShotUrl   from '@/assets/images/iPhoneAR.jpg'
import macDocumentUrl  from '@/assets/icons/macDocument.png'
import pdfIconUrl      from '@/assets/icons/pdf.svg?url'
import folderIconUrl   from '@/assets/icons/Folder.png?url'
import useDesktopStore from '@/store/desktopStore'

/* Anything erased that was a folder made on the desktop goes for good. */
const forgetFolders = (items) =>
  useDesktopStore.getState().forget(items.filter((i) => i.kind === 'folder' && i.origin?.source === 'desktop').map((i) => i.origin.id))

/* ── What the Trash starts out holding ─────────────────────────────────────
   A Mac that has been used for five minutes has an empty Trash and nothing to
   say about it. Seeding a few files means a first-time visitor who clicks the
   basket finds a real folder with real contents, the way they would on their
   own machine — and it shows the put-back and erase paths without them having
   to drag something in first.

   `kind: 'image'` renders the file as its own thumbnail, which is how Finder
   draws a picture; everything else gets a document icon.

   These carry no `origin`, so they only ever leave by being erased — putting
   one back has nowhere to go, exactly like a file whose original folder is
   gone. Anything the visitor drags in later does carry an origin.          */
const SEEDED = [
  {
    id:        'seed-portrait',
    name:      'mikdad-portrait.jpg',
    kind:      'image',
    icon:      mikdadPhotoUrl,
    size:      '2.4 MB',
    deletedAt: '2026-09-11T09:24:00.000Z',
  },
  {
    id:        'seed-ar-shot',
    name:      'iphone-ar-mockup.jpg',
    kind:      'image',
    icon:      iphoneShotUrl,
    size:      '1.8 MB',
    deletedAt: '2026-09-12T16:03:00.000Z',
  },
  {
    id:        'seed-resume',
    name:      'resume-old-v3.pdf',
    kind:      'pdf',
    icon:      pdfIconUrl,
    size:      '412 KB',
    deletedAt: '2026-09-09T11:47:00.000Z',
  },
  {
    id:        'seed-invoice',
    name:      'client-notes-draft.txt',
    kind:      'document',
    icon:      macDocumentUrl,
    size:      '6 KB',
    deletedAt: '2026-09-14T20:15:00.000Z',
  },
  {
    id:        'seed-folder',
    name:      'untitled folder',
    kind:      'folder',
    icon:      folderIconUrl,
    size:      '—',
    deletedAt: '2026-09-15T08:02:00.000Z',
  },
]

/* Stored ids are matched against live sources — a trashed desktop file or
   Finder app disappears from where it was while it sits in the basket — so the
   store keeps the items, not the absence of them. */
const useTrashStore = create(
  persist(
    (set, get) => ({
      items: SEEDED,

      /* Move something in. `origin` is what makes Put Back possible:
         { source: 'desktop' | 'finder', id: <the id it had there> }. */
      trashItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.id === item.id)) return state
          return {
            items: [
              { ...item, deletedAt: new Date().toISOString() },
              ...state.items,
            ],
          }
        }),

      /* Put Back — the item leaves the Trash and reappears at its origin. */
      putBack: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      /* Delete Immediately — same removal, different words, and no way back. */
      eraseItem: (id) =>
        set((state) => {
          forgetFolders(state.items.filter((i) => i.id === id))
          return { items: state.items.filter((i) => i.id !== id) }
        }),

      emptyTrash: () => set((state) => { forgetFolders(state.items); return { items: [] } }),

      /* Restore the demo contents — Settings offers this so a visitor who
         erased everything can get the folder back without clearing storage. */
      resetTrash: () => set({ items: SEEDED }),

      isTrashed: (id) => get().items.some((i) => i.id === id),
    }),
    { name: 'portfolio-trash' }
  )
)

/* The ids a given source has sitting in the Trash. A trashed file is gone from
   the place it was trashed from — off the desktop, out of Finder's grid, out of
   the dock — and comes back when it is put back, so every one of those places
   filters itself against this. */
export const trashedFrom = (items, source) =>
  new Set(
    items
      .filter((i) => i.origin?.source === source)
      .map((i) => i.origin.id)
  )

export default useTrashStore
