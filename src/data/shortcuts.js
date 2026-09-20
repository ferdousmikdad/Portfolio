/* ── Keyboard shortcuts ────────────────────────────────────────────────────
   What the ⌘/ overlay lists.

   Every entry here is a key this app actually binds — checked against the
   handlers rather than transcribed from the menus. That distinction matters:
   the menu bar draws ⌘W, ⌘M, ⌘Q and ⌘, because a Mac menu without them does
   not read as a Mac menu, but a web page never sees those keys. Printing
   them in a sheet headed "Keyboard Shortcuts" would be a straight lie, so
   they live in `CLAIMED` below and the sheet says who took them.

   `keys` is an array so each chord renders as its own key cap.            */

export const GROUPS = [
  {
    title: 'Anywhere',
    items: [
      { keys: ['⌘', 'Space'], label: 'Spotlight — apps, tools, projects, and arithmetic' },
      { keys: ['⌘', '/'],     label: 'This list' },
      { keys: ['F4'],         label: 'Launchpad' },
      { keys: ['F3'],         label: 'Mission Control', note: 'macOS usually claims F3 first' },
      { keys: ['esc'],        label: 'Close whatever is on top' },
    ],
  },
  {
    title: 'Go',
    items: [
      { keys: ['⇧', 'H'], label: 'Home' },
      { keys: ['⇧', 'P'], label: 'Portfolio' },
      { keys: ['⇧', 'S'], label: 'Store' },
      { keys: ['⇧', 'N'], label: 'Notes' },
    ],
  },
  {
    title: 'Spotlight',
    items: [
      { keys: ['↑', '↓'], label: 'Move through the results' },
      { keys: ['↩'],      label: 'Open the selection — or copy the answer' },
    ],
  },
  {
    title: 'Desktop',
    items: [
      { keys: ['Space'], label: 'Quick Look the selected file' },
      { keys: ['Space'], label: 'Close Quick Look', note: 'esc works too' },
    ],
  },
  {
    title: 'Launchpad',
    items: [
      { keys: ['type'],   label: 'Filter the grid' },
      { keys: ['←', '→'], label: 'Change page' },
      { keys: ['↩'],      label: 'Launch the first match' },
    ],
  },
  {
    title: 'Terminal',
    items: [
      { keys: ['↑', '↓'], label: 'Command history' },
      { keys: ['↩'],      label: 'Run' },
    ],
  },
  {
    title: 'Calculator',
    items: [
      { keys: ['0–9'], label: 'Type a number' },
      { keys: ['+', '−', '*', '/'], label: 'Operators' },
      { keys: ['↩'],  label: 'Equals' },
      { keys: ['⌫'],  label: 'Delete the last digit' },
      { keys: ['C'],  label: 'Clear' },
      { keys: ['N'],  label: 'Flip the sign' },
    ],
  },
]

/* The chords the menus draw but the page never receives. Named here so the
   sheet can say so out loud instead of quietly omitting them. */
export const CLAIMED = ['⌘W', '⌘M', '⌘Q', '⌘,', '⌘H']
