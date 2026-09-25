# macOS Fun Roadmap

> Candidate features that make the portfolio feel more like a real Mac.
> One row per item, each with a stable ID so we can both point at the same thing.
> **Update the Status column as work happens** — this file is the shared source of truth.

---

## Status Legend

Same symbols as `PROGRESS.md`, so the two files read the same way.

| Symbol | Meaning |
|---|---|
| ✅ | Done |
| 🔄 | In Progress |
| 📋 | Planned (not started) |
| ⏸ | Blocked / On Hold |
| ❌ | Dropped (decided against) |

---

## Where We Are

| Field | Value |
|---|---|
| **Progress** | Tiers 1–4 **complete** (F1–F24). **Tier 5 added 2026-09-25: 9 new items (F25–F33), 1 shipped (F25)** |
| **Currently working on** | — nothing in flight — |
| **Last completed** | ✅ F25 — Time Machine |
| **Next up** | 📋 **F26 Messages that reach Mikdad**, then **F27 banners** (see Tier 5) |

### Done so far

| ID | Feature | |
|---|---|---|
| F1 | About This Mac | ✅ |
| F1.1 | Apple menu | ✅ |
| F2 | Real menu-bar menus | ✅ |
| F3 | Mission Control | ✅ |
| F4 | Startup chime | ✅ |
| F5 | `neofetch` (+ shared `systemProfile`) | ✅ |
| F6 | Terminal shell commands | ✅ |
| F7 | Spotlight calculator | ✅ |
| F8 | Dock right-click menus | ✅ |
| F9 | Dock launch bounce | ✅ |
| F10 | Quick Look (spacebar) | ✅ |
| F11 | Trash “Put Back” | ✅ |
| F12 | Genie minimize (already built) | ✅ |
| F13 | Launchpad | ✅ |
| F14 | Idle screen saver | ✅ |
| F15 | Lock screen | ✅ |
| F16 | Stage Manager | ✅ |
| F17 | Notification Centre | ✅ |
| F18 | Hot corners | ✅ |
| F19 | Photo Booth | ✅ |
| F20 | AirDrop → contact | ✅ |
| F21 | Software Update | ✅ |
| F23 | Keyboard shortcuts overlay | ✅ |
| F24 | Sleep / Wake / Restart | ✅ |

**Bugs fixed along the way** — none of these were on the list; they turned up
while building and testing the items above:

| Found during | Bug |
|---|---|
| F24 | `MacAlert`'s `icon` prop is a **URL**, not a node — passing JSX rendered `src="[object Object]"` and a broken image. Mine, caught in testing. |
| F21 | **The whole menu bar crashed on click** — `MenuBar`'s "tell the parent a menu opened" effect listed TopBar's inline `onMenuOpen` as a dependency, so: effect → parent setState → new arrow → effect → … React stopped it with "Maximum update depth exceeded" and unmounted the bar. Latent before F21; adding a store write to that callback tipped it over. Held in a ref, the way `ContextMenu`'s Escape fix does. |
| F20 | **Spotlight crashed the whole app** — `mikdadHeadUrl` used in Spotlight without its import, added during F19. White/black screen on open, because React unmounted. |
| F16 | **Clones inherited `data-window`**, so a window id matched two nodes — Mission Control, Stage Manager and the dock's genie all look windows up that way and could have grabbed a picture instead of the window. Fixed in `neutralise`. |
| F5 | `neofetch` and About This Mac held the same facts separately and had already drifted |
| F5 | Off-by-one gutter in the `neofetch` renderer once the info column outgrew the logo |
| F6 | `history` always empty — `execute` is a `useCallback` with no state deps, so it closed over `[]` |
| F7 | Menu-bar: clicking a sibling while a menu was open closed the bar instead of switching |
| F8 | **Pre-existing** — Escape never dismissed *any* `ContextMenu` (Trash and Finder included) |
| F9 | Page tiles never bounced (id vs. winId); un-minimising wrongly counted as a launch |

> **How to use this:** tell me an ID (“let’s do F4”) and I’ll flip it to 🔄, do the
> work, then flip it to ✅ with a note. If you want to know where we are, just ask
> for this file — the table above is the short answer.

---

## Recently Shipped (context, not roadmap)

These are already done and are why several items below are cheap.

| ID | Task | Status | Notes |
|---|---|---|---|
| F0.1 | Control Centre → per-tile Liquid Glass | ✅ | `GlassLayers` per tile, dock-bar material |
| F0.2 | Liquid Glass slider (Displays › Brightness) | ✅ | `GlassSlider` in `MacControls.jsx` |
| F0.3 | Same slider in Retro Dot tool + macOS inspector pane | ✅ | `public/tools/retro-dot-effect.html` |
| F0.4 | Welcome card rebuilt on AppKit dialog grammar | ✅ | Glass, no typewriter, Esc/Return wired |
| F1.1 | Apple menu on the logo | ✅ | Shipped as F1's entry point, then folded into `MenuBar` by F2 (one code path for all menus; `AppleMenu.jsx` removed). |

---

## Tier 1 — Highest payoff for a portfolio  ✅ complete

Do these first. Best “this person sweats details” per hour. **All three shipped.**

| ID | Task | Status | Effort | Notes |
|---|---|---|---|---|
| F1 | **About This Mac** | ✅ | S | Done. `AboutMacWindow.jsx` + `AppleMenu.jsx`. Specs are **real facts** pulled from `BioWindow`/`AboutMeWindow` (5+ years, Figma·Illustrator·AE, React·Tailwind·Framer, print & branding origin) — only the chip name is a gag. Buttons: More Info… → About window, Contact… → `contact.txt`. Both verified. |
| F2 | **Real menu-bar menus** | ✅ | M | Done. `MenuBar.jsx` + `data/menuBar.js`. Apple · **App** · File · Edit · View · Go · Window · Help, rebuilt from the front window — app name tracks focus (verified Color Contrast → Terminal → Finder → Notes). Hover-to-switch between open menus, Esc/outside-click dismiss, disabled items dimmed not hidden. ⚠️ The three nav buttons moved into **Go** — see note below. |
| F3 | **Mission Control (F3)** | ✅ | M | Done. `MissionControl.jsx`. Tiles are DOM clones of the live windows — reuses the `windowSnapshots` trick the dock's minimised thumbnails already use, so no canvas library was needed. FLIP zoom from each window's real rect into a non-overlapping grid; click a tile to focus and dismiss; Esc or click-through to exit. Verified: 4 windows, no overlap, correct labels, focus follows the pick. ⚠️ F3 key usually eaten by macOS itself — **Window › Mission Control** is the reliable way in. |

---

## Tier 2 — Quick wins (pieces already exist)  ✅ complete

| ID | Task | Status | Effort | Notes |
|---|---|---|---|---|
| F4 | Startup chime on “Fit Window” | ✅ | XS | Done. **Original** G-major chord synthesised by `assets/sounds/generate.cjs` — deliberately *not* Apple's chime, which is a registered trademark. Encoded to AAC (15 KB vs 207 KB WAV). Fires on Fit Window, which is also the first gesture that satisfies autoplay policy. Verified: fetched, ctx running, peak 0.877 / 2.3s decay. |
| F5 | `neofetch` in Terminal | ✅ | S | **Was already implemented** — FM ASCII logo + spec block. Real work done instead: the facts were duplicated across `neofetch` and About This Mac and had already drifted (Stack said “React · Figma · Motion”). Both now read `data/systemProfile.js`. Also fixed an off-by-one gutter in the neofetch renderer. |
| F6 | More Terminal commands | ✅ | S | `whoami`/`open` already existed. Added **working** shell commands — `pwd`, `ls` (lists the real `desktopFiles`), `echo`, `history`, `uname -a`, `man`, `say` (real speech synthesis) — plus `cowsay` and a `sudo` catch-all. All listed in `help`. Fixed a stale-closure bug found on the way: `execute` is a `useCallback` with no state deps, so `history` always read `[]`; now mirrored in `historyRef`, matching the existing `aiActiveRef` pattern. |
| F7 | Spotlight math + conversions | ✅ | S | Done. `utils/spotlightMath.js` — a real tokeniser + shunting-yard, **not `eval`**: this parses visitor input, so `eval`/`new Function` would be a script-injection hole. Result shows in a Calculator group above everything; Enter copies it. 32 unit tests pass, incl. precedence, right-assoc `^`, unary minus, unbalanced brackets and injection strings all returning null. ⚠️ **Currency deliberately omitted** — see Open decisions. |
| F8 | Dock right-click menus | ✅ | S | The Trash already had one; this adds menus to every **app** tile, state-dependent the way macOS is — running → Hide·Quit, hidden → Show·Quit, closed → Open — plus Show in Finder. Rises out of the icon, centred (`placement:'above'`). Verified in all three states. Also fixed a **pre-existing** `ContextMenu` bug: Escape never dismissed any menu (Trash and Finder included). |
| F9 | Dock launch bounce | ✅ | XS | Retuned twice since (timing, then sync with the window — see Change Log). **Was already built** — keyframes and trigger both existed. Fixed two gaps: the trigger reports a *window* id but tiles compared `item.id`, so the four page tiles (Home/Portfolio/Notes/Store) never bounced; and coming back from minimised counted as a launch, which macOS does not bounce for. Measured: both tile kinds now reach the full −17px, restore stays at 0. |
| F10 | Quick Look (spacebar) | ✅ | M | Done. `QuickLook.jsx` — select a desktop file, press space, panel shows the file's real contents (`DOCS`), space/Esc/click-away dismiss, “Open with TextEdit” hands off to the window. Guarded on `activeElement`: the Terminal, Spotlight and search fields keep their spaces — verified by typing `echo hi` into the Terminal with an icon selected. ⚠️ Desktop files only; Finder rows are not wired yet. |
| F11 | Trash “Put Back” | ✅ | S | **Was already built** — `trashStore.putBack` + the Finder context menu, correctly dimmed for the seeded files that have no `origin`. Verified end to end: dragged `about_me.txt` to the basket, Put Back from the Trash menu, file reappeared on the desktop. No code change needed. |

---

## Tier 3 — Showy  ✅ complete

Visual spectacle. Worth it once Tier 1 is in.

| ID | Task | Status | Effort | Notes |
|---|---|---|---|---|
| F12 | Genie minimize | ✅ | M | **Already built** — `utils/genie.js` (real warp stage, frame rasterising, iframe rehydration), used by `Window.jsx` on minimise and the dock on restore. Verified working during F9 testing. No work needed. |
| F13 | Launchpad (F4 key) | ✅ | M | Done. `Launchpad.jsx` — 7×3 fixed grid over a 40px-blurred desktop, **paged not scrolled** (that is what separates it from a folder window), type-to-filter, Return launches the top match, ←/→ page, Esc closes. All 19 apps incl. the 10 tools. Mutually exclusive with Mission Control in the store. F4 wired, same OS caveat as F3 — Window menu is the reliable way in. |
| F14 | Idle screen saver | ✅ | M | Done. `ScreenSaver.jsx` — “hello” cycling nine languages over black after 45s idle; any input wakes it. Apple menu ▸ Start Screen Saver triggers it on demand. ⚠️ Apple animates theirs as a **handwriting stroke**; that needs authored path data per script, so this uses type and gets its life from the transition instead. Languages are ones the portfolio actually touches (Bengali, Arabic) rather than a generic list. |
| F15 | Lock screen | ✅ | M | Done. `LockScreen.jsx` — the **real** wallpaper blurred, live clock, avatar, password field. Any password (or an empty Return) unlocks; Escape and the arrow button work too. Wires up the Apple menu's previously-dead **Lock Screen ⌃⌘Q** row. ⚠️ **Not** wired as the site's entry point — the welcome card still owns that; swapping them is a product decision, not a detail. |
| F16 | **Stage Manager for real** | ✅ | L | Done. `StageManager.jsx` — the toggle that has existed in Control Centre and Settings since before this roadmap now does something: one window on the stage, the rest as live thumbnails down the left rail, click to swap. Parked windows hide via `visibility` (not `opacity`, which would make them backdrop roots and kill their inner glass). Verified: 4 windows → 3 parked, 1 visible, swap moves the right pair. ⚠️ The rail overlays rather than insets the stage; macOS shifts windows right to clear it. |
| F17 | Notification Centre | ✅ | M | Done. `NotificationCenter.jsx` — slides in from the right with notification cards plus Now and Calendar widgets (real month grid, today in accent). Opens from the **menu-bar clock** (how you reach it on a Mac) and from the **side-rail bell, which was a button that did nothing**. Notes are real facts — availability, `neofetch`, the tool count from `TOOLS.length` — and each opens the thing it mentions. ⚠️ **Transient banners not built** — the panel only; see Open decisions. Reworked 21 Sep: cards float individually with no panel behind them, each dismissible. |
| F18 | Hot corners | ✅ | S | Done. `hooks/useHotCorners.js` + a Hot Corners group in Settings ▸ Desktop & Dock. Seven actions incl. Show Desktop. Two guards, both because a corner that fires on a passing cursor is worse than none: a **300ms dwell** and a **latch** so parking there does not retrigger. Only bottom-left is on by default — the one corner nothing else lives near. Verified: passing cursor no-fire, dwell fires, no retrigger, unassigned corner inert. |

---

## Tier 4 — Easter eggs

| ID | Task | Status | Effort | Notes |
|---|---|---|---|---|
| F19 | **Photo Booth** | ✅ | M | Done. `PhotoBoothWindow.jsx` + `utils/photoFilters.js`. Two effects — Normal and **Retro Dot, the real halftone** from the standalone tool — same Rec. 709 luminance, same radius-from-darkness mapping, same 45° rotated grid — so the two genuinely agree. (Trimmed from six on 21 Sep; the other four were filler.) Shutter with flash, capture strip, click a shot to download. Camera is released the moment the window closes, and nothing leaves the browser. Filters live in their own module and are covered by **22 unit tests**. ⚠️ Live camera path unverifiable here — see Open decisions. |
| F20 | **AirDrop → contact** | ✅ | S | Done. `AirDropSheet.jsx`. The target only appears **while a drag is in flight**, highlights on hover, then runs Sending… → Sent → contact card. Honest about itself: the sheet says nothing left your machine and the file stays on the desktop. Respects the Control Centre switch — set to “No One” it shows as off. `dragStore` generalised from a hard-coded Trash check to attribute-based drop targets, so future targets need no store changes. |
| F21 | **Software Update** | ✅ | M | Done. `updateStore.js` + `softwareUpdate.js` + `WhatsNewWindow.jsx`. The pane that used to read "up to date" now has a real update behind it: **Upgrade Now → download → install → What's New**, with the red **1** badge macOS puts on the Apple menu, the Settings sidebar and the General list, and a Notification Centre card advertising it. The stage machine lives in the store so the bar does not freeze when you leave the pane; installed state persists so a returning visitor is not nagged. Version is unified in `systemProfile` — `neofetch` and `uname -a` print **26.1** after the install and 26.0.1 before it. Also real: `softwareupdate -l / -i / --uninstall` in the Terminal. ⚠️ Payoff changed from "reveals a new project" — see Open decisions. |
| F22 | Force Quit (⌘⌥Esc) | ✅ | S | Dropped on 21 Sep, then **built on 24 Sep** as part of the macOS UI audit (item 3, the Apple menu), which rebuilt the menu row for row including **Force Quit…**. `ForceQuit.jsx`: the real "Force Quit Applications" window — running apps with icons, Finder first, **Relaunch** for Finder, **Force Quit** for the rest (closes that app's windows). Holding Option shows *Force Quit <front app>*. See `docs/MACOS_UI_AUDIT.md`. |
| F23 | **Keyboard shortcuts overlay (⌘/)** | ✅ | S | Done. `ShortcutsOverlay.jsx` + `data/shortcuts.js`. ⌘/ (and ⌘?, and ⌃/ for PC keyboards) puts up a two-column glass sheet of **24 shortcuts in 7 groups**, also reachable from **Help ▸ Keyboard Shortcuts**. Every entry was checked against the actual handlers rather than copied off the menus, and the footer names ⌘W / ⌘M / ⌘Q / ⌘, / ⌘H as **claimed by the browser** instead of quietly listing keys that do nothing. A flag, not a window — it would otherwise show up in Mission Control and the dock. Verified: all seven listed global chords fire, both themes, and it fits without scrolling down to 820px. |
| F24 | **Sleep / Wake** | ✅ | M | Done. `PowerOverlay.jsx` + `power` state in `windowStore`. The two Apple-menu rows that had been drawn **disabled since the menu bar was built** now work. **Sleep** ramps the display down over 1.2s, holds a **900 ms guard** so the click that chose it does not immediately wake it, then any key or click wakes to the **lock screen** — where a Mac with default settings puts you. Windows survive. **Restart…** keeps its ellipsis honest: a `MacAlert` asks first, then black → boot bar → **startup chime** → desktop with every window closed, which is the part that sells it. Both swallow input in the **capture phase**, so F4 cannot open Launchpad behind a black screen. Also added **Put Display to Sleep** as a hot-corner action, which is a real macOS one. |

---

## Tier 5 — Fun that also works for the portfolio  📋 added 2026-09-25

Chosen against the caution below: each one is either about Mikdad's work,
brings a visitor closer to contacting him, or finishes something already
half-built — not more breadth for its own sake.

| ID | Task | Status | Effort | Notes |
|---|---|---|---|---|
| F25 | **Time Machine — the site's own history** | ✅ | L | Done. `TimeMachine.jsx` + `data/timeMachine.js`. **Seven real backups**: each era's commit was checked out, run, and screenshotted as a visitor landed on it (Oct 6 '25 first site → Apr 6 tools → Apr 12 React desktop → Apr 15 menu bar + Mikuda → May 20 Finder/Terminal/Settings → Sep 21 dock + menus → today), ~300 KB of WebP in `public/timemachine/`. Full screen over the blurred desktop: stack receding upward, date on top, timeline down the right, Cancel / Open. ↑↓, scroll and the timeline travel; Enter / Open shows the backup full size in Preview; notes from the commit messages. Entry points: Launchpad, Spotlight, Finder › Applications (real Time Machine icon) and **System Settings › General › Time Machine**, which was a dead stub. |
| F26 | **Messages that actually reach Mikdad** | 📋 | M | ⭐ Home already is Messages. Add a real conversation *with Mikdad*: the visitor writes, it arrives as an email through the existing Cloudflare worker, the bubble shows **Delivered**, and his real reply appears when they come back. The contact form, without feeling like one — the item most likely to bring work. Needs a worker endpoint + a reply store; spam protection required. |
| F27 | **Slide-in notification banners, real triggers only** | 📋 | S | Closes the F17 open decision. Banners from the top-right that go into Notification Centre, fired only by real events: *"Password Peek copied"* after Get in the App Store, *"Photo saved"* in Photo Booth, *"Mikuda answered"* if the Siri bar was closed mid-question. No invented alerts. |
| F28 | **Mikuda can listen and speak** | 📋 | M | The mic in the Siri bar is decorative today. Browser speech recognition to ask out loud, speech synthesis to read the answer. Must degrade quietly where the browser lacks it (Firefox) and ask for the mic only on press. |
| F29 | **Dynamic wallpaper by local time** | 📋 | S | Tahoe wallpapers shift from day to night. Follow the *visitor's* clock — someone at 2 am sees the night variant. Needs a day and a night version of the wallpaper. |
| F30 | **Widgets on the desktop** | 📋 | M | Tahoe lets widgets sit on the desktop itself. A **Now working on** card, the **Music** widget playing Mikdad's playlist, and his clock beside the visitor's (*"It's 1:40 AM for Mikdad"*). Should follow Settings → Desktop & Dock and be movable. |
| F31 | **⌘P → print sheet → résumé PDF** | 📋 | S | The real macOS print sheet, and **Save as PDF** hands over Mikdad's actual CV. Useful to recruiters, a smile for everyone else. Needs the CV file. |
| F32 | **Activity Monitor** | 📋 | M | A real list of what is running — open windows, the Mikuda worker, animations — with live CPU-style graphs from actual frame timing. Nerdy, and it signals understanding of the thing built. Must use real numbers, not decorative ones. |
| F33 | **Chess** | 📋 | M | Ships on every Mac; a quick game against Mikuda suits a portfolio people linger in. Could use an open-source engine rather than writing one. |

**Considered and skipped**

| Idea | Why not |
|---|---|
| ⌘Tab app switcher | The browser never receives ⌘Tab — macOS claims it first — so it could only ever run on a substitute key and would feel broken. |
| Achievements ("12 of 20 secrets found") | Fun for a day, but it points at the tricks rather than the work. |

**Suggested order:** F25 → F26 → F27, then the rest as time allows. F27 is
the quickest win; F25 is the one visitors will remember.

---

## Open decisions

| Topic | Note |
|---|---|
| **Nav moved into Go** (F2) | Portfolio / About Me / Notes were loose buttons on the menu bar, which no Mac has. They now live in **Go** alongside Home, Shop and Utilities. One extra click. Say the word and I will put the inline buttons back next to the menus. |
| **⌘ hints are decorative** (F2) | The menus draw ⌘W, ⌘M, ⌘Q, ⌘, the way AppKit does, but a web page cannot intercept those — the browser and OS claim them first. Clicking the items works. Drawn anyway because a Mac menu without them does not read as one. **Since F23 the ⌘/ sheet says this out loud** rather than leaving a visitor to discover it by pressing keys that do nothing. |
| **Focus after Minimize** (F2) | Minimising the front window leaves the app name as “Finder” rather than moving focus to the next visible window. Fixing it means changing `minimizeWindow` in `windowStore`, which is outside F2's scope. |
| **Photo Booth camera untested** (F19) | Headless Chrome enumerates its fake camera but cannot start it (`NotReadableError`), so the live preview and capture could not be exercised end to end. What *is* verified: the window, the effect row, the permission-denied state, and all the filter maths (22 unit tests). **Worth a manual look on a real machine.** |
| **No slide-in banners** (F17) | The roadmap item said “banners + panel”; only the panel is built. A banner system needs events worth announcing, and inventing fake ones (“New message!”) would be noise rather than fidelity. Worth doing if there is a real trigger — a finished export, say. |
| **No currency in Spotlight** (F7) | `340 usd to bdt` was on the original wish-list but is not implemented. Rates move daily, so a hard-coded number would confidently print a wrong answer — worse than printing none. Only fixed-ratio conversions ship (length, mass, temperature, data). A live rate API would make it real. |
| **No unlockable project** (F21) | The roadmap said the update should "reveal a new project". Dropped deliberately: the Portfolio is auto-discovered from `public/portfolio/`, so a hidden project would have to be **invented** — fake design work presented as Mikdad's. The payoff is a **What's New** sheet instead, where all seven rows name something the desk genuinely does and launch it. Honest, and it doubles as the best guided tour the portfolio has. If you would rather a real project stayed hidden until the update runs, that is a one-line filter — just say which one. |
| **F3 key is unreliable** (F3) | macOS claims F3 for its own Mission Control before the page sees it. The key is wired anyway for non-Mac keyboards; Window › Mission Control always works. |

---

## One honest caution

There are already ~15 apps and 28 Settings panes. **The risk is not running out of
ideas — it is that breadth starts reading as unfinished rather than deep.**

- **F1, F2, F4** give the most “detail-obsessed” signal per hour of work.
- **F13 (Launchpad)** and **F3 (Mission Control)** mostly re-present things a
  visitor has already seen — high effort, lower new information.
- **F16 (Stage Manager)** is the only item that fixes an existing broken promise,
  which is worth more than any new feature on this list.

Prefer finishing a few of these properly over starting many.

---

## Change Log

| Date | Change |
|---|---|
| 2026-09-20 | File created; F0.1–F0.4 recorded as shipped, F1–F24 planned |
| 2026-09-20 | ✅ F1 About This Mac shipped, with the Apple menu (F1.1) as its entry point |
| 2026-09-20 | ✅ F2 Menu bar shipped; Apple menu folded into `MenuBar`, nav moved to Go |
| 2026-09-20 | ✅ F3 Mission Control shipped — **Tier 1 complete** |
| 2026-09-20 | ✅ F4 Startup chime shipped (original composition, AAC) |
| 2026-09-20 | ✅ F5 `neofetch` already existed; facts unified into `systemProfile.js` |
| 2026-09-20 | ✅ F6 Terminal shell commands + `historyRef` stale-closure fix |
| 2026-09-20 | Defaults: blue accent + Sonoma Horizon wallpaper; Shop renamed to Store |
| 2026-09-20 | ✅ F7 Spotlight calculator; fixed menu-bar hover/click conflict found while testing |
| 2026-09-20 | ✅ F8 Dock app-tile menus; fixed pre-existing ContextMenu Escape bug |
| 2026-09-20 | ✅ F9 Launch bounce already existed; fixed page-tile id mismatch + un-minimise |
| 2026-09-20 | ✅ F10 Quick Look built; F11 Put Back already existed and verified — **Tier 2 complete** |
| 2026-09-20 | Dock bounce retimed: 0.62s single-ease → 1.15s with per-leg gravity easing |
| 2026-09-20 | ✅ F12 genie minimize confirmed already built |
| 2026-09-20 | ✅ F13 Launchpad shipped |
| 2026-09-20 | Dock launch resynced: bounce now starts on click and the window lands as the icon touches down (was opening instantly, bouncing after) |
| 2026-09-20 | ✅ F14 Screen saver shipped |
| 2026-09-20 | ✅ F15 Lock screen shipped; Enter handled explicitly after implicit form submit proved unreliable |
| 2026-09-20 | ✅ F16 Stage Manager shipped; `neutralise` now strips window ids from clones |
| 2026-09-20 | ✅ F17 Notification Centre shipped; the dead side-rail bell now does something |
| 2026-09-20 | ✅ F18 Hot corners shipped — **Tier 3 complete** |
| 2026-09-21 | Removed the left icon rail (bell / sound / theme) — no Mac has one; all three controls already existed in Control Centre and the View menu |
| 2026-09-21 | Notification Centre reworked: no panel surface, each card its own glass, per-card close button |
| 2026-09-21 | Dismiss badge now straddles the card corner (half in, half out); fixed a specificity bug that had it laid out in the flow rather than positioned |
| 2026-09-21 | ✅ F19 Photo Booth shipped; Retro Dot halftone shared with the standalone tool |
| 2026-09-21 | ✅ F20 AirDrop shipped; dragStore now resolves drop targets by attribute rather than hard-coding the Trash |
| 2026-09-21 | 🐞 Fixed: Spotlight crashed on open (missing `mikdadHeadUrl` import introduced in F19) |
| 2026-09-21 | Photo Booth: real `photobooth.png` artwork everywhere (was the head avatar), added to Finder › Applications, effects cut to Normal + Retro Dot |
| 2026-09-21 | ✅ F21 Software Update shipped — live install flow, badges, What's New sheet, `softwareupdate` CLI; OS version unified in `systemProfile` |
| 2026-09-21 | 🐞 Fixed: the menu bar crashed with "Maximum update depth exceeded" on any menu click (latent dependency loop, surfaced by F21) |
| 2026-09-21 | ❌ F22 Force Quit dropped at your request — not built |
| 2026-09-21 | ✅ F23 Keyboard shortcuts overlay shipped — ⌘/ sheet, Help menu entry, and an honest footer about the chords the browser claims |
| 2026-09-21 | ✅ F24 Sleep / Wake / Restart shipped — the last two disabled Apple-menu rows now work; **roadmap complete** |
| 2026-09-24 | ✅ F22 Force Quit built after all, as part of the macOS UI audit (Apple menu, item 3) — `ForceQuit.jsx` |
| 2026-09-25 | ✅ F25 Time Machine shipped — seven real snapshots of the site's history, full-screen stack + timeline; the Settings Time Machine row now works |
| 2026-09-25 | 📋 Tier 5 added: F25–F33 (Time Machine, real Messages, banners, voice, dynamic wallpaper, desktop widgets, résumé print, Activity Monitor, Chess); ⌘Tab and achievements considered and skipped |
