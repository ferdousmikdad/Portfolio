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
  about: 'Contacts',
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
  'photo-booth': 'Photo Booth',
  'about-mac': 'Finder',
  preview: 'Preview',
  chess: 'Chess',
  'whats-new': 'System Settings',
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
    closeAll, toggleFullscreen, toggleTheme, openSpotlight, missionControl, launchpad,
    lock, openSettingsAt, updatePending, shortcuts, sleep, restart,
    option, recent, clearRecent, forceQuit, forceQuitFront, shutDown, logOut, userName,
  } = ctx

  /* Recent Items: the apps and documents opened this session, newest first,
     under the grey section titles the real submenu uses. */
  const recentApps = recent.filter((r) => !r.doc)
  const recentDocs = recent.filter((r) => r.doc)
  const recentItems = [
    { header: 'Applications' },
    ...recentApps.map((r) => ({ label: r.name, image: r.icon, onClick: () => openWindow(r.id) })),
    { header: 'Documents' },
    ...recentDocs.map((r) => ({ label: r.name, image: r.icon, onClick: () => openWindow(r.id) })),
    { sep: true },
    { label: 'Clear Menu', disabled: recent.length === 0, onClick: clearRecent },
  ]

  const menus = [
    {
      id: 'apple',
      apple: true,
      /* Tahoe's Apple menu, row for row, with its icons. Holding Option
         swaps rows for their alternates exactly as the real one does: the
         ellipses go (no confirmation), About becomes System Information,
         and Force Quit targets the front app. */
      items: [
        { label: option ? 'System Information…' : 'About This Mac', icon: 'laptopcomputer',
          onClick: () => openWindow('about-mac') },
        { sep: true },
        /* A waiting macOS update shows as a grey capsule on this row, and
           the row then goes straight to Software Update. */
        { label: 'System Settings…', icon: 'gearshape',
          badge: updatePending ? '1 update' : undefined,
          onClick: () => (updatePending ? openSettingsAt('softwareupdate') : openWindow('settings')) },
        { label: 'App Store…', icon: 'appstore', onClick: () => openWindow('shop') },
        { sep: true },
        { label: 'Recent Items', icon: 'clock', submenu: recentItems },
        { sep: true },
        option
          ? { label: `Force Quit ${appName}`, icon: 'xmark.circle', key: '⌥⇧⌘⎋', onClick: forceQuitFront }
          : { label: 'Force Quit…', icon: 'xmark.circle', key: '⌥⌘⎋', onClick: forceQuit },
        { sep: true },
        { label: 'Sleep', icon: 'sleep', onClick: sleep },
        /* The ellipsis is a promise that it will ask first, so it does —
           and with Option held it drops the ellipsis and does not ask. */
        { label: option ? 'Restart'   : 'Restart…',   icon: 'restart', onClick: () => restart(!option) },
        { label: option ? 'Shut Down' : 'Shut Down…', icon: 'power',   onClick: () => shutDown(!option) },
        { sep: true },
        { label: 'Lock Screen', icon: 'lock', key: '⌃⌘Q', onClick: lock },
        { label: `Log Out ${userName}${option ? '' : '…'}`, icon: 'person.crop.circle', key: '⇧⌘Q',
          onClick: () => logOut(!option) },
      ],
    },

    /* The app menu is bold and named after the front app. */
    {
      id: 'app',
      label: appName,
      bold: true,
      items: [
        { label: `About ${appName}`, icon: 'info.circle', onClick: () => openWindow('about-mac') },
        { sep: true },
        { label: 'Settings…', icon: 'gearshape', key: '⌘,', onClick: () => openWindow('settings') },
        { sep: true },
        { label: `Hide ${appName}`, key: '⌘H', disabled: !hasWindow, onClick: minimizeActive },
        { sep: true },
        { label: `Quit ${appName}`, icon: 'xmark', key: '⌘Q', disabled: !hasWindow, onClick: closeActive },
      ],
    },

    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New Finder Window', icon: 'macwindow.badge.plus', key: '⌘N', onClick: () => openWindow('finder') },
        { label: 'Open Terminal', icon: 'terminal', onClick: () => openWindow('terminal') },
        { sep: true },
        { label: 'Close Window', icon: 'xmark', key: '⌘W', disabled: !hasWindow, onClick: closeActive },
        { label: 'Close All', disabled: !hasWindow, onClick: closeAll },
      ],
    },

    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'Undo', icon: 'arrow.uturn.backward', key: '⌘Z', onClick: () => document.execCommand('undo') },
        { label: 'Redo', icon: 'arrow.uturn.forward', key: '⇧⌘Z', onClick: () => document.execCommand('redo') },
        { sep: true },
        { label: 'Cut', icon: 'scissors', key: '⌘X', onClick: () => document.execCommand('cut') },
        { label: 'Copy', icon: 'doc.on.doc', key: '⌘C', onClick: () => document.execCommand('copy') },
        { label: 'Paste', icon: 'doc.on.clipboard', key: '⌘V', onClick: () => document.execCommand('paste') },
        { sep: true },
        { label: 'Select All', icon: 'checkmark.circle', key: '⌘A', onClick: () => document.execCommand('selectAll') },
      ],
    },

    {
      id: 'view',
      label: 'View',
      items: [
        {
          label: isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen',
          icon: 'arrow.up.left.and.arrow.down.right',
          key: '⌃⌘F',
          onClick: toggleFullscreen,
        },
        { sep: true },
        {
          label: isDark ? 'Use Light Appearance' : 'Use Dark Appearance',
          icon: isDark ? 'sun.max' : 'moon',
          onClick: toggleTheme,
        },
        { sep: true },
        { label: 'Show Spotlight', icon: 'magnifyingglass', key: '⌘Space', onClick: openSpotlight },
      ],
    },

    /* Finder has a Go menu; the site's own navigation lives here rather than
       as loose buttons on the bar, which no Mac has. */
    {
      id: 'go',
      label: 'Go',
      items: [
        { label: 'Home', icon: 'house', onClick: () => navigate('home') },
        { label: 'Portfolio', icon: 'photo.on.rectangle', onClick: () => navigate('portfolio') },
        { label: 'About Me', icon: 'person.crop.square', onClick: () => navigate('about') },
        { label: 'Notes', icon: 'note.text', onClick: () => navigate('notes') },
        { sep: true },
        { label: 'App Store', icon: 'bag', onClick: () => openWindow('shop') },
        { label: 'Utilities', icon: 'wrench.and.screwdriver', onClick: () => openWindow('finder') },
      ],
    },

    {
      id: 'window',
      label: 'Window',
      items: [
        { label: 'Minimize', icon: 'minus', key: '⌘M', disabled: !hasWindow, onClick: minimizeActive },
        { label: 'Zoom', icon: 'arrow.up.left.and.arrow.down.right', disabled: !hasWindow, onClick: zoomActive },
        { sep: true },
        /* The reliable way in: macOS usually claims F3 before the page. */
        { label: 'Mission Control', icon: 'rectangle.3.group', key: 'F3', onClick: missionControl },
        { label: 'Launchpad', icon: 'square.grid.3x3', key: 'F4', onClick: launchpad },
        { sep: true },
        { label: 'Bring All to Front', disabled: true },
      ],
    },

    {
      id: 'help',
      label: 'Help',
      items: [
        { label: 'Portfolio Help', icon: 'questionmark.circle', onClick: openSpotlight },
        /* The one ⌘ hint in the whole bar that is not decorative — the
           browser lets ⌘/ through. */
        { label: 'Keyboard Shortcuts', icon: 'keyboard', key: '⌘/', onClick: shortcuts },
        { sep: true },
        { label: 'About This Mac', icon: 'laptopcomputer', onClick: () => openWindow('about-mac') },
      ],
    },
  ]

  /* Chess brings its own menus, the way the real app does: Game in place of
     File, and Moves between View and Window. */
  if (appName === 'Chess' && ctx.chess) {
    const c = ctx.chess
    const game = {
      id: 'game',
      label: 'Game',
      items: [
        { label: 'New Game', icon: 'square.and.pencil', key: '⌘N', onClick: c.newGame },
        { sep: true },
        { label: 'Computer Level', submenu: [
          { label: 'Easy',   checked: c.level === 2, onClick: () => c.setLevel(2) },
          { label: 'Normal', checked: c.level === 3, onClick: () => c.setLevel(3) },
          { label: 'Hard',   checked: c.level === 4, onClick: () => c.setLevel(4) },
        ] },
      ],
    }
    const moves = {
      id: 'moves',
      label: 'Moves',
      items: [
        { label: 'Take Back Move', icon: 'arrow.uturn.backward', key: '⌘Z', disabled: !c.canTakeBack, onClick: c.takeBack },
        { sep: true },
        { label: 'Show Hint', icon: 'questionmark.circle', key: '⌘?', disabled: !c.canHint, onClick: c.showHint },
      ],
    }
    const out = menus.map((m) => (m.id === 'file' ? game : m))
    out.splice(out.findIndex((m) => m.id === 'view') + 1, 0, moves)
    return out.filter((m) => m.id !== 'go')
  }
  return menus
}