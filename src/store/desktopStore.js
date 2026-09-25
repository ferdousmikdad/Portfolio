import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* ── What the visitor has done to the desktop ─────────────────────────────
   The shipped files live in data/desktopFiles; this holds everything the
   right-click menu can change on top of them, kept per visitor in their own
   browser so a folder they made or a tag they set is still there next time:

     folders  — folders made with New Folder: { id, name, x, y, addedAt }
     names    — renames, by item id
     tags     — Finder colour tags, by item id: ['red', 'blue', …]
     sortBy   — the desktop's Sort By choice: 'none' | 'name' | 'kind' |
                'dateAdded' | 'size' | 'tags'
     layout   — bumped by Clean Up and Sort By; icons re-seat on change   */

const useDesktopStore = create(
  persist(
    (set) => ({
      folders: [],
      names:   {},
      tags:    {},
      sortBy:  'none',
      layout:  0,

      /* A new folder lands where the menu was opened, named the way Finder
         names it — "untitled folder", then "untitled folder 2" and so on. */
      newFolder: (x, y) => {
        const id = `folder-${Date.now().toString(36)}`
        set((s) => {
          const taken = new Set(s.folders.map((f) => s.names[f.id] ?? f.name))
          let name = 'untitled folder'
          for (let n = 2; taken.has(name); n++) name = `untitled folder ${n}`
          return { folders: [...s.folders, { id, name, x, y, addedAt: Date.now() }] }
        })
        return id
      },
      rename: (id, name) => set((s) => ({ names: { ...s.names, [id]: name } })),
      toggleTag: (id, tag) => set((s) => {
        const now = s.tags[id] ?? []
        return { tags: { ...s.tags, [id]: now.includes(tag) ? now.filter((t) => t !== tag) : [...now, tag] } }
      }),
      /* Erased from the Trash: a folder the visitor made is gone for good.
         (Shipped files are not in here, so erasing one only empties the
         basket — the portfolio's own files come back.) */
      forget: (ids) => set((s) => ({ folders: s.folders.filter((f) => !ids.includes(f.id)) })),
      setSortBy: (sortBy) => set((s) => ({ sortBy, layout: s.layout + 1 })),
      cleanUp:   ()       => set((s) => ({ layout: s.layout + 1 })),

      /* Where each desktop widget was dragged to, by widget id. */
      widgetPos: {},
      placeWidget: (id, pos) => set((s) => ({ widgetPos: { ...s.widgetPos, [id]: pos } })),

      /* ── Session only (not saved) ──
         Get Info is one window whoever asks for it — the desktop or Finder.
         Recent Items is what was opened this session, newest first; the
         Apple menu and Finder's Recents both read it. */
      info: null,
      showInfo: (info) => set({ info }),
      recent: [],
      pushRecent: (entry) => set((s) => ({
        recent: [entry, ...s.recent.filter((r) => r.id !== entry.id)].slice(0, 12),
      })),
      clearRecent: () => set({ recent: [] }),
    }),
    {
      name: 'portfolio-desktop',
      partialize: ({ folders, names, tags, sortBy, layout, widgetPos }) => ({ folders, names, tags, sortBy, layout, widgetPos }),
    },
  ),
)

export default useDesktopStore
