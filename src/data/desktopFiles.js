import macDocumentUrl from '@/assets/icons/txtDocument.png'

/* The files sitting on the desktop. Each one can be dragged to the Trash and
   put back, so the list lives here rather than inline in Desktop — the Trash
   needs the same ids to know what it is holding. `windowId` is the window the
   file opens on double click. */
const DESKTOP_FILES = [
  {
    id:       'desktop-bio',
    windowId: 'bio',
    name:     'about_me.txt',
    kind:     'document',
    icon:     macDocumentUrl,
    size:     '3 KB',
    y:        80,
  },
  {
    id:       'desktop-skills',
    windowId: 'skills',
    name:     'skills.txt',
    kind:     'document',
    icon:     macDocumentUrl,
    size:     '2 KB',
    y:        180,
  },
  {
    id:       'desktop-contact',
    windowId: 'contact',
    name:     'contact.txt',
    kind:     'document',
    icon:     macDocumentUrl,
    size:     '1 KB',
    y:        280,
  },
]

export default DESKTOP_FILES
