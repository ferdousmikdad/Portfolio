import TOOLS from '@/data/tools'

/* ── Menu bar definitions ──────────────────────────────────────────────────
   The menus to the right of the Apple menu belong to the *front-most app*,
   so the set is rebuilt whenever focus moves. Everything here is data; the
   rendering and open/close behaviour live in MenuBar.jsx.

   Item shape:
     { label, onClick, key?, disabled?, sep? }

   `key` is the shortcut hint shown right-aligned, the way AppKit draws it.
   Note these hints are decorative: a page cannot intercept ⌘W, ⌘M, ⌘Q or
   ⌘, — the browser and the OS claim them first. Clicking the item is what
   performs the action. They are drawn anyway because a Mac menu without
   them does not read as a Mac menu.                                       */

/* Window id → the app it belongs to, as the menu bar would name it. A doc
   window's app is TextEdit, not the file it has open. */
const APP_NAMES = {
  bio: 'TextEdit',
  skills: 'TextEdit',
  contact: 'TextEdit',
  profile: 'Contacts',
  about: 'About Me',
  pacman: 'Pac-Man',
  portfolio: 'Portfolio',
  shop: 'App Store',
  notes: 'Notes',
  terminal: 'Terminal',
  settings: 'System Settings',
  finder: 'Finder',
  mail: 'Mail',
  home: 'Mikuda',
  calculator: 'Calculator',
  spotify: 'Music',
  'about-mac': 'Finder',
}

export function appNameFor(windowId) {
  if (!windowId) return 'Finder'
  if (APP_NAMES[windowId]) return APP_NAMES[windowId]
  const tool = TOOLS.find((t) => t.id === windowId)
  return tool ? tool.name : 'Finder'
}

/**
 * Build the whole bar for the current context.
 *
 * `ctx` carries the front window plus the actions the items call, so this
 * module stays free of store imports and is trivial to reason about.
 */
export function buildMenus(ctx) {
  const {
    appName, hasWindow, isFullscreen, isDark,
    openWindow, navigate, closeActive, minimizeActive, zoomActive,
    closeAll, toggleFullscreen, toggleTheme, openSpotlight,
  } = ctx

  return [
    {
      id: 'apple',
      apple: true,
      items: [
        { label: 'About This Mac', onClick: () => openWindow('about-mac') },
        { sep: true },
        { label: 'System Settings…', key: '⌘,', onClick: () => openWindow('settings') },
        { label: 'App Store…', onClick: () => openWindow('shop') },
        { sep: true },
        { label: 'Sleep', disabled: true },
        { label: 'Restart…', disabled: true },
        { sep: true },
        { label: 'Lock Screen', disabled: true },
      ],
    },

    /* The app menu is bold and named after the front app. */
    {
      id: 'app',
      label: appName,
      bold: true,
      items: [
        { label: `About ${appName}`, onClick: () => openWindow('about-mac') },
        { sep: true },
        { label: 'Settings…', key: '⌘,', onClick: () => openWindow('settings') },
        { sep: true },
        { label: `Hide ${appName}`, key: '⌘H', disabled: !hasWindow, onClick: minimizeActive },
        { sep: true },
        { label: `Quit ${appName}`, key: '⌘Q', disabled: !hasWindow, onClick: closeActive },
      ],
    },

    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New Finder Window', key: '⌘N', onClick: () => openWindow('finder') },
        { label: 'Open Terminal', onClick: () => openWindow('terminal') },
        { sep: true },
        { label: 'Close Window', key: '⌘W', disabled: !hasWindow, onClick: closeActive },
        { label: 'Close All', disabled: !hasWindow, onClick: closeAll },
      ],
    },

    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'Undo', key: '⌘Z', onClick: () => document.execCommand('undo') },
        { label: 'Redo', key: '⇧⌘Z', onClick: () => document.execCommand('redo') },
        { sep: true },
        { label: 'Cut', key: '⌘X', onClick: () => document.execCommand('cut') },
        { label: 'Copy', key: '⌘C', onClick: () => document.execCommand('copy') },
        { label: 'Paste', key: '⌘V', onClick: () => document.execCommand('paste') },
        { sep: true },
        { label: 'Select All', key: '⌘A', onClick: () => document.execCommand('selectAll') },
      ],
    },

    {
      id: 'view',
      label: 'View',
      items: [
        {
          label: isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen',
          key: '⌃⌘F',
          onClick: toggleFullscreen,
        },
        { sep: true },
        {
          label: isDark ? 'Use Light Appearance' : 'Use Dark Appearance',
          onClick: toggleTheme,
        },
        { sep: true },
        { label: 'Show Spotlight', key: '⌘Space', onClick: openSpotlight },
      ],
    },

    /* Finder has a Go menu; the site's own navigation lives here rather than
       as loose buttons on the bar, which no Mac has. */
    {
      id: 'go',
      label: 'Go',
      items: [
        { label: 'Home', onClick: () => navigate('home') },
        { label: 'Portfolio', onClick: () => navigate('portfolio') },
        { label: 'About Me', onClick: () => navigate('about') },
        { label: 'Notes', onClick: () => navigate('notes') },
        { sep: true },
        { label: 'Shop', onClick: () => openWindow('shop') },
        { label: 'Utilities', onClick: () => openWindow('finder') },
      ],
    },

    {
      id: 'window',
      label: 'Window',
      items: [
        { label: 'Minimize', key: '⌘M', disabled: !hasWindow, onClick: minimizeActive },
        { label: 'Zoom', disabled: !hasWindow, onClick: zoomActive },
        { sep: true },
        { label: 'Bring All to Front', disabled: true },
      ],
    },

    {
      id: 'help',
      label: 'Help',
      items: [
        { label: 'Portfolio Help', onClick: openSpotlight },
        { sep: true },
        { label: 'About This Mac', onClick: () => openWindow('about-mac') },
      ],
    },
  ]
}
