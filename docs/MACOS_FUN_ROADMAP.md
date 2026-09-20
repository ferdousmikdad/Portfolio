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
| **Currently working on** | — nothing in flight — |
| **Last completed** | ✅ F9 — Dock launch bounce · **Tier 2 half done** |
| **Next up** | F10 (Quick Look) · F11 (Trash Put Back) — the rest of Tier 2 |

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

## Tier 1 — Highest payoff for a portfolio

Do these first. Best “this person sweats details” per hour. **All three shipped.**

| ID | Task | Status | Effort | Notes |
|---|---|---|---|---|
| F1 | **About This Mac** | ✅ | S | Done. `AboutMacWindow.jsx` + `AppleMenu.jsx`. Specs are **real facts** pulled from `BioWindow`/`AboutMeWindow` (5+ years, Figma·Illustrator·AE, React·Tailwind·Framer, print & branding origin) — only the chip name is a gag. Buttons: More Info… → About window, Contact… → `contact.txt`. Both verified. |
| F2 | **Real menu-bar menus** | ✅ | M | Done. `MenuBar.jsx` + `data/menuBar.js`. Apple · **App** · File · Edit · View · Go · Window · Help, rebuilt from the front window — app name tracks focus (verified Color Contrast → Terminal → Finder → Notes). Hover-to-switch between open menus, Esc/outside-click dismiss, disabled items dimmed not hidden. ⚠️ The three nav buttons moved into **Go** — see note below. |
| F3 | **Mission Control (F3)** | ✅ | M | Done. `MissionControl.jsx`. Tiles are DOM clones of the live windows — reuses the `windowSnapshots` trick the dock's minimised thumbnails already use, so no canvas library was needed. FLIP zoom from each window's real rect into a non-overlapping grid; click a tile to focus and dismiss; Esc or click-through to exit. Verified: 4 windows, no overlap, correct labels, focus follows the pick. ⚠️ F3 key usually eaten by macOS itself — **Window › Mission Control** is the reliable way in. |

---

## Tier 2 — Quick wins (pieces already exist)

| ID | Task | Status | Effort | Notes |
|---|---|---|---|---|
| F4 | Startup chime on “Fit Window” | ✅ | XS | Done. **Original** G-major chord synthesised by `assets/sounds/generate.cjs` — deliberately *not* Apple's chime, which is a registered trademark. Encoded to AAC (15 KB vs 207 KB WAV). Fires on Fit Window, which is also the first gesture that satisfies autoplay policy. Verified: fetched, ctx running, peak 0.877 / 2.3s decay. |
| F5 | `neofetch` in Terminal | ✅ | S | **Was already implemented** — FM ASCII logo + spec block. Real work done instead: the facts were duplicated across `neofetch` and About This Mac and had already drifted (Stack said “React · Figma · Motion”). Both now read `data/systemProfile.js`. Also fixed an off-by-one gutter in the neofetch renderer. |
| F6 | More Terminal commands | ✅ | S | `whoami`/`open` already existed. Added **working** shell commands — `pwd`, `ls` (lists the real `desktopFiles`), `echo`, `history`, `uname -a`, `man`, `say` (real speech synthesis) — plus `cowsay` and a `sudo` catch-all. All listed in `help`. Fixed a stale-closure bug found on the way: `execute` is a `useCallback` with no state deps, so `history` always read `[]`; now mirrored in `historyRef`, matching the existing `aiActiveRef` pattern. |
| F7 | Spotlight math + conversions | ✅ | S | Done. `utils/spotlightMath.js` — a real tokeniser + shunting-yard, **not `eval`**: this parses visitor input, so `eval`/`new Function` would be a script-injection hole. Result shows in a Calculator group above everything; Enter copies it. 32 unit tests pass, incl. precedence, right-assoc `^`, unary minus, unbalanced brackets and injection strings all returning null. ⚠️ **Currency deliberately omitted** — see Open decisions. |
| F8 | Dock right-click menus | ✅ | S | The Trash already had one; this adds menus to every **app** tile, state-dependent the way macOS is — running → Hide·Quit, hidden → Show·Quit, closed → Open — plus Show in Finder. Rises out of the icon, centred (`placement:'above'`). Verified in all three states. Also fixed a **pre-existing** `ContextMenu` bug: Escape never dismissed any menu (Trash and Finder included). |
| F9 | Dock launch bounce | ✅ | XS | **Was already built** — keyframes and trigger both existed. Fixed two gaps: the trigger reports a *window* id but tiles compared `item.id`, so the four page tiles (Home/Portfolio/Notes/Store) never bounced; and coming back from minimised counted as a launch, which macOS does not bounce for. Measured: both tile kinds now reach the full −17px, restore stays at 0. |
| F10 | Quick Look (spacebar) | 📋 | M | Select a desktop file or Finder item → space → preview panel. Ideal for project images. |
| F11 | Trash “Put Back” | 📋 | S | Restore path for trashed desktop files. Empty Trash alert already uses `MacAlert`. |

---

## Tier 3 — Showy

Visual spectacle. Worth it once Tier 1 is in.

| ID | Task | Status | Effort | Notes |
|---|---|---|---|---|
| F12 | Genie minimize | 📋 | M | The suck-into-dock warp. People notice it instantly. |
| F13 | Launchpad (F4 key) | 📋 | M | Blurred desktop, paginated icon grid, type-to-filter. Natural home for the 9 tools. |
| F14 | Idle screen saver | 📋 | M | The “Hello” script animation in many languages. Almost too on-the-nose for a portfolio, in a good way. |
| F15 | Lock screen | 📋 | M | Blurred wallpaper, avatar, password field; any input logs in. Could replace the welcome card as the entry moment. |
| F16 | **Stage Manager for real** | 📋 | L | ⚠️ The toggle already exists in Control Centre *and* Settings but only flips a flag — the UI is currently promising something it does not do. Windows should shrink into a left rail. |
| F17 | Notification Centre | 📋 | M | Slide-in banners + a panel with widgets (clock, calendar, now playing). |
| F18 | Hot corners | 📋 | S | Settings pane vocabulary already exists to configure them. |

---

## Tier 4 — Easter eggs

| ID | Task | Status | Effort | Notes |
|---|---|---|---|---|
| F19 | **Photo Booth** | 📋 | M | Webcam with effects — and one effect is your own Retro Dot. Ties a tool you already built into the OS fiction. |
| F20 | AirDrop → contact | 📋 | S | Drag a file onto AirDrop → “Sent to Mikdad” → opens the contact form. A funnel disguised as a joke. |
| F21 | Software Update | 📋 | S | “macOS Mikdad 26.1 available” → installs → reveals a new project. |
| F22 | Force Quit (⌘⌥Esc) | 📋 | S | With one app permanently “(not responding)”. Apple-menu row already there, disabled. |
| F23 | Keyboard shortcuts overlay (⌘/) | 📋 | S | Also doubles as real discoverability for everything above. |
| F24 | Sleep / Wake | 📋 | S | Apple-menu rows (Sleep, Restart…, Lock Screen) already there, disabled — this wires them. |

---

## Open decisions

| Topic | Note |
|---|---|
| **Nav moved into Go** (F2) | Portfolio / About Me / Notes were loose buttons on the menu bar, which no Mac has. They now live in **Go** alongside Home, Shop and Utilities. One extra click. Say the word and I will put the inline buttons back next to the menus. |
| **⌘ hints are decorative** (F2) | The menus draw ⌘W, ⌘M, ⌘Q, ⌘, the way AppKit does, but a web page cannot intercept those — the browser and OS claim them first. Clicking the items works. Drawn anyway because a Mac menu without them does not read as one. |
| **Focus after Minimize** (F2) | Minimising the front window leaves the app name as “Finder” rather than moving focus to the next visible window. Fixing it means changing `minimizeWindow` in `windowStore`, which is outside F2's scope. |
| **No currency in Spotlight** (F7) | `340 usd to bdt` was on the original wish-list but is not implemented. Rates move daily, so a hard-coded number would confidently print a wrong answer — worse than printing none. Only fixed-ratio conversions ship (length, mass, temperature, data). A live rate API would make it real. |
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
