# macOS UI Audit

What still looks unlike real macOS Tahoe, found by opening every window and
overlay of the site in a browser and comparing it with the real apps on the
Mac it was built beside (macOS 26, dark mode, blue accent).

Audited 2026-09-24. Tick an item off when it ships.

**Progress:** 11 of 18 done (items 1–7, 9, 10, 13 and 14, 2026-09-25).

## Already close — leave as is

Photos (Portfolio), Preview (project viewer), Contacts (About Me),
Messages (Home), the Siri bar (Mikuda), System Settings, Control Center,
the lock screen, About This Mac, Calculator, the menu bar itself (13px
fonts, semibold app name, matching the real one), and right-click menus
everywhere (item 2), the Apple menu and every menu-bar menu (item 3), and Finder (item 4).

---

## High priority — the most visible gaps

- [x] **1. Notification Center** — done 2026-09-25
  - **Cards:** each notification is its own glass card: the app's real icon
    on the left (Software Update, Contacts, Terminal, App Store), the title
    in semibold with the time top-right ("now", "3m ago", counted from when
    the site loaded), and the message below. The all-caps app labels are
    gone.
  - **Dismissing:** × on hover dismisses a card. When none are left the
    panel says "No recent notifications", as the real one does.
  - **Widgets:** the "NOW 6:42" block is replaced by Tahoe small widgets side
    by side: Calendar (month in red, today in a red disc) and an analog
    Clock with a live second hand, named after the visitor's own time-zone
    city.
  - **Edit Widgets** pill at the bottom opens System Settings → Desktop &
    Dock.
  - File: `NotificationCenter.jsx`.

- [x] **2. Right-click on the desktop** — done 2026-09-24
  - Was: right-clicking empty desktop or the desktop files showed nothing;
    only Finder and the Dock had menus.
  - Shipped, **empty desktop**:
    - New Folder: created where you click, name ready to type; opens empty
      in Finder under its own name.
    - Get Info, for the Desktop itself.
    - Change Wallpaper…, which opens Settings on Wallpaper.
    - Edit Widgets…, which opens Notification Center.
    - Sort By ▸ None / Name / Kind / Date Added / Size / Tags, with a ✓ on the
      current choice.
    - Clean Up.
  - Shipped, **a file or folder**:
    - Open, and Open With ▸ TextEdit (default).
    - Move to Trash: Put Back restores it, and Empty Trash deletes a
      visitor-made folder for good.
    - Get Info, a Finder-style info window.
    - Rename, inline, with the name selected up to its extension; Return on a
      selected icon also starts a rename.
    - Quick Look.
    - Share…, which opens AirDrop.
    - The colour-tag dot row; tags show as dots before the file name.
  - Shipped, **the menu itself**, restyled to Tahoe (see *Measured values*
    below):
    - SF Symbol icons.
    - Spaced-out shortcuts (⇧ ⌘ N).
    - Submenus.
    - Tag dots muted in dark mode.

    Finder's and the Dock's existing menus picked up the same style.
  - Saved per visitor in their browser (`src/store/desktopStore.js`):
    folders, renames, tags, sort order.
  - Left out on purpose, because here they would do nothing: Use Stacks,
    Compress, Duplicate, Make Alias, Show View Options.
  - Files:
    - `src/components/ui/ContextMenu.jsx`
    - `src/components/desktop/Desktop.jsx`
    - `src/components/desktop/GetInfo.jsx`
    - `src/store/desktopStore.js`
    - Finder's empty-folder view in `FinderWindow.jsx`

- [x] **3. Apple menu contents** — done 2026-09-24
  - Was: "Software Update…" and "Start Screen Saver" (not in the real menu),
    red "1" badges, no icons; missing Recent Items, Force Quit…, Shut Down…
    and Log Out….
  - Shipped, **the Apple menu**, row for row as Tahoe's, each with its icon:
    - About This Mac.
    - System Settings…, with a grey "1 update" capsule while the update is
      pending; the row then opens Software Update.
    - App Store…, which opens the Store.
    - Recent Items ▸: Applications and Documents opened this session, with
      their icons, and Clear Menu.
    - Force Quit… ⌥⌘⎋, opening a real **Force Quit Applications** window:
      running apps with icons, Finder always first; "Relaunch" for Finder,
      "Force Quit" for the rest.
    - Sleep; Restart…; Shut Down… (asks, then goes black until any key
      boots it, with a faint "Press any key to turn on" hint after 3s).
    - Lock Screen ⌃⌘Q; Log Out Ferdous Mikdad… ⇧⌘Q (asks, closes every
      window, returns to the lock screen).
  - Shipped, **Option held**, the real alternates: System Information…,
    Force Quit <front app>, and Restart / Shut Down / Log Out without the
    ellipsis and without asking. The menu keeps its width while they swap.
  - Shipped, **every menu-bar menu** (app, File, Edit, View, Go, Window,
    Help) now uses the same Tahoe panel as the right-click menus, with SF
    Symbol icons on the rows. The old `.mb-menu` styles are gone.
  - The App Store glyph is not a public SF Symbol, so it was lifted from
    the real menu as a mask (`src/assets/icons/sf/appstore.png`).
  - Files:
    - `src/data/menuBar.js`
    - `src/components/desktop/MenuBar.jsx`
    - `src/components/desktop/ForceQuit.jsx`
    - `src/components/desktop/PowerOverlay.jsx` (the powered-off state)
    - `src/components/ui/ContextMenu.jsx` (exported `Panel`: badges,
      headers, app icons)
    - `src/store/windowStore.js` (`shutDown`, `powerOn`, `logOut`)

- [x] **4. Finder** — done 2026-09-24
  - Was: coloured app icons and ">" chevrons in the sidebar; toolbar with only
    back/forward and a "Search tools…" field; the location name shown twice.
  - Shipped, **sidebar**:
    - Rows: Recents, Favorites (Applications, Desktop, Home, Portfolio, Notes,
      Store), Locations (Trash) and Tags (the seven colours).
    - Label-coloured outline SF Symbols; the selected row is a grey slab
      with symbol and name in the accent.
    - No chevrons. Portfolio, Notes and Store still list their sections,
      indented, while you are inside them.
  - Shipped, **toolbar**:
    - Back/forward capsule.
    - View switcher capsule (Icons · List · Columns · Gallery).
    - Group ▾ (None / Name / Kind / Tags).
    - Share · Tags · ⋯ capsule: AirDrop, tag dots for desktop items, and
      New Folder / Open / Get Info / Move to Trash.
    - A round search button that opens into a "Search" field.
  - Shipped, **four real views** on every file location
    (`FinderBrowser.jsx`):
    - Icons, with group headers.
    - List: Name / Date Modified / Size / Kind, striped rows.
    - Columns: the list plus a preview column with Information.
    - Gallery: a large preview and a thumbnail strip.
  - Shipped, **new locations**: Desktop (the same items as the real
    desktop), Recents (apps and files opened this session), and one view
    per Tag. Right-click works in all of them, and in the Trash (Put Back,
    Delete Immediately…).
  - Shared state: `src/hooks/useDesktopItems.js` (one desktop list for the
    desktop and Finder), plus Get Info and Recent Items in `desktopStore`.

- [x] **5. Store → App Store** — done 2026-09-25
  - Built against the real Tahoe App Store on the Mac (Arcade/Discover page).
  - **Sidebar:** search field at the top; Discover plus the shelf's five
    sections, each with an outline symbol, where the real one lists Create /
    Work / Play / Develop; the account pinned bottom-left (initials disc,
    name, "n of 10 got").
  - **Discover:** a hero card with the featured animation running and a
    blue button; a row of category chips; a two-column **Top Free** ranked
    list (icon, rank, grey eyebrow, name, tagline, grey capsule **Get**).
  - **Get** behaves like the real one: a progress ring, then the HTML file
    is copied and the button turns into **Open**, which goes to the product
    page.
  - **Product page:** back button, big icon, name, subtitle, blue Get; an
    info strip (Category / Format / Price / Developer); then the live
    preview beside the source with Copy code.
  - Icons are the animations themselves, playing on hover.
  - The app is named **App Store** in the menu bar, Dock, Launchpad,
    Spotlight and menus.
  - Files: `ShopWindow.jsx` (rewritten); `ShopPanel.jsx` now exports
    `ResourcePanes`. Finder's Store view is unchanged.

- [x] **6. Music → Apple Music** — done 2026-09-25
  - Built against the real Tahoe Music app: glass sidebar (Home, Playlists
    section, account pinned bottom-left), large bold "Home" title, red-pink
    promo card, playlist page with gradient artwork, name, owner in red and
    a red "Open in Spotify" capsule.
  - The music is Mikdad's Spotify playlist embed (Para-30); the artist
    embed and the "SIAME" wordmark are gone.
  - The real Music app icon (from Music.app's .icns) replaces the Spotify
    icon in the Dock, Launchpad, Spotlight, Finder and Mission Control; the
    app is named Music everywhere. File: `src/components/apps/MusicWindow.jsx`.

- [x] **7. Tool windows** — done 2026-09-25
  - All ten tools load one shared layer, `public/tools/macos.css` +
    `macos.js`, after their own styles:
    - **Colours:** the background is the site window's colour (was
      near-black `#080808` / beige); the accent follows the site's blue
      and Settings → Accent, live (was red `#cf0506`); dark/light still
      follows the site.
    - **Controls:** capsule buttons (accent when primary or active);
      rounded text fields with an accent focus ring; accent checkboxes;
      sliders with a 4pt accent-filled track and a white knob; quiet dashed
      drop zones that turn accent on hover or drag; thin macOS scrollbars;
      SF Pro Text throughout, SF Mono for code and hex.
  - Per-tool fixes:
    - Every hardcoded red in the styles is now the accent. Script colour
      values are left alone, and QR Code keeps its "red" theme.
    - Color Contrast: the demo background is blue `#0064D2` (was red); the
      ratio is SF Pro Display bold in system green / orange / red; failed
      checks use system red.
    - Typing Practice and Print Setup had fixed dark themes; mapped to the
      shared variables, so they work in light mode too. Wrong letters stay
      system red.

---

## Medium priority

- [ ] **8. Photo Booth**: needs the three layout buttons bottom-left, a large red
  shutter button in the centre and an **Effects** button on the right, in
  place of the "Normal / Retro Dot" toggle and pale "Take Photo" button.

- [x] **9. Notes toolbar** — done 2026-09-25
  - Built against the real Tahoe Notes window.
  - **Title:** folder name over its note count ("All / 9 notes") beside the
    traffic lights.
  - **Toolbar capsules:**
    - ⋯: View as List / Gallery, Copy Note, Delete Note.
    - Compose.
    - Aa (Title, Heading, Body, bulleted and numbered lists) · Checklist ·
      Table.
    - Share (copies the note).
    - A round search button that opens into a field.
  - **Compose writes real notes**, saved in the visitor's browser
    (`src/store/notesStore.js`). The editor is rich text: the first line is
    the title, the checklist has tickable circles, and tables are real
    (caret starts in the first cell). Mikdad's posts stay read-only, and the
    formatting buttons dim on them, as Notes dims them in a locked note.
  - **A note is always open** (the first in the list), with its date
    centred in grey above it; "Select a note to read" and the Back button
    are gone. List rows show date + preview; Gallery shows page thumbnails.
  - Files: `NotesWindow.jsx`, `NotesPanel.jsx`, `notesStore.js`. Finder's
    Notes view shares the panel and picks up the same list and reader.

- [x] **10. Spotlight** — done 2026-09-24
  - Measured off the real Tahoe Spotlight: a 360pt × 62pt capsule with its
    top 15% down the screen, and beside it four 62pt round glass buttons
    11pt apart. The site now matches to the point.
  - The buttons open the real modes:
    - **Applications:** an icon grid of every app and tool.
    - **Files:** desktop files and portfolio pieces.
    - **Actions:** Dark Mode, Mission Control, Launchpad, Notification Center,
      New Note, Email, Photo, AirDrop, Lock, Sleep.
    - **Clipboard:** text copied on the site this session, plus Spotlight's
      own copied answers.
  - Each mode shows as a chip in the field with its own placeholder
    ("Search Apps"…). Typing folds the buttons into the field.
  - Escape steps back one thing at a time: the text, then the mode, then
    Spotlight itself. Backspace in an empty field leaves the mode.
  - No permanent scrollbar in the results panel.
  - File: `src/components/desktop/Spotlight.jsx`.

- [ ] **11. Launchpad → Apps**: Tahoe removed Launchpad. Its replacement is the
  **Apps** view: a full-screen glass grid with a search field and category
  filters.

- [ ] **12. Mission Control**: missing the Spaces bar across the top
  ("Desktop 1" plus a + button).

- [x] **13. Scrollbars** — done 2026-09-25
  - macOS overlay behaviour everywhere, including the tool pages: no bar at
    rest; a thin grey thumb (38% white in dark mode, 38% black in light, no
    track) appears the moment an area scrolls and disappears about a second
    after it stops.
  - How it works:
    - One global rule (`* { scrollbar-width: thin; scrollbar-color:
      transparent … }`) covers every scroll area, marked or not.
    - `src/utils/overlayScrollbars.js` (one capture-phase scroll listener)
      adds `.is-scrolling` to whatever is scrolling.
    - The tool pages get the same from `public/tools/macos.js`.
  - Verified: the System Settings sidebar and the What's New list are clean
    at rest, show a thumb while scrolling, and clear again after.

- [x] **14. Desktop `.txt` files** — done 2026-09-25
  - **Icon:** the real macOS plain-text document icon (a page of monospace
    text marked "TXT"), rendered from the system with
    `NSWorkspace.icon(for: .plainText)`, now `src/assets/icons/txtDocument.png`.
    It's used on the desktop, in Finder, in the Trash and in the Dock's
    minimised tiles. Saved Trash contents pick up the new icon on load.
  - **TextEdit windows:** the typed "────" rules are gone (a .txt file
    cannot draw a line); headings are set off by a blank line. Text is in
    Menlo, TextEdit's default plain-text font, and the file name is centred
    in the title bar. File: `BioWindow.jsx`.

---

## Low priority

- [ ] **15. Terminal title**: should read `ferdous — -zsh — 80×24`, not
  `ferdous@portfolio ~ — zsh`.
- [ ] **16. Mail compose**: Send (paper-plane) button at the left of the toolbar
  next to the traffic lights, plus Cc/Bcc fields and a format bar.
- [ ] **17. Control Center**: Tahoe shows "Edit Controls" at the bottom rather
  than a "System Settings…" pill.
- [ ] **18. Keyboard Shortcuts sheet**: useful, but macOS has nothing like it.
  If kept, style it as a Tips-style help window.

---

## Suggested order

Next: the rest of the medium list (8, 11, 12), then the low list (15–18).

## Measured values

Reference numbers taken off the real Mac, for reuse.

**Menus** (Finder's File menu, Tahoe, dark, at 2x):

| Part | Value |
|---|---|
| Row height | 24pt |
| Label | 13pt |
| Corner radius | about 12pt |
| Padding | about 5pt |
| Icon | SF Symbol about 11–13pt, centred about 23pt from the left edge |
| Label start | about 37pt from the left edge |
| Shortcuts | right-aligned about 12pt in, secondary grey, glyphs spaced apart |
| Separators | hairline, inset about 15pt each side, about 5pt above and below |
| Tag dots | 13pt with a darker rim, on a 24pt pitch |
| Tag dot colours (muted in dark) | red `#A15F5C`, orange `#A37D59`, yellow `#A6975A`, green `#669368`, blue `#527BA7`, purple `#945CA2`, grey `#7D7D80` |

## How each fix is built

Measure the real app on the Mac rather than working from memory:
- `screencapture` for the layout.
- Sampled pixel colours for fills, rims and text.
- SF Symbols rendered from the system into `src/assets/icons/sf/`, used
  through `SFSymbol`.
- Standard app icons from each app's bundled `.icns`.

Then screenshot the site in headless Chrome and compare the two before
calling the fix done.

Do not send clicks to the live screen to open a real menu. Window order on
a working desktop is unpredictable, and a right-click can land in whatever
app happens to be in front. Open real menus through accessibility instead
(`System Events … click menu bar item`), which never touches another
app's window.
