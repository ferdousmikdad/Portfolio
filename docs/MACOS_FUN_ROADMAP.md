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
| **Last completed** | ✅ F2 — Real menu-bar menus |
| **Next up** | Your call — F3 finishes Tier 1, or F4/F5 for quick wins |

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

Do these first. Best “this person sweats details” per hour.

| ID | Task | Status | Effort | Notes |
|---|---|---|---|---|
| F1 | **About This Mac** | ✅ | S | Done. `AboutMacWindow.jsx` + `AppleMenu.jsx`. Specs are **real facts** pulled from `BioWindow`/`AboutMeWindow` (5+ years, Figma·Illustrator·AE, React·Tailwind·Framer, print & branding origin) — only the chip name is a gag. Buttons: More Info… → About window, Contact… → `contact.txt`. Both verified. |
| F2 | **Real menu-bar menus** | ✅ | M | Done. `MenuBar.jsx` + `data/menuBar.js`. Apple · **App** · File · Edit · View · Go · Window · Help, rebuilt from the front window — app name tracks focus (verified Color Contrast → Terminal → Finder → Notes). Hover-to-switch between open menus, Esc/outside-click dismiss, disabled items dimmed not hidden. ⚠️ The three nav buttons moved into **Go** — see note below. |
| F3 | **Mission Control (F3)** | 📋 | M | All open windows zoom out to a non-overlapping grid. `windowStore` already holds positions + sizes, so it is mostly one layout animation. Doubles as “see everything at once”. |

---

## Tier 2 — Quick wins (pieces already exist)

| ID | Task | Status | Effort | Notes |
|---|---|---|---|---|
| F4 | Startup chime on “Fit Window” | 📋 | XS | `soundStore` exists. Iconic; huge vibe return for the effort. |
| F5 | `neofetch` in Terminal | 📋 | S | ASCII Apple logo + fake specs. Pairs with F1 (same joke data). |
| F6 | More Terminal easter eggs | 📋 | S | `sudo` → “Nice try.”, `cowsay`, `open finder`, `whoami`. |
| F7 | Spotlight math + conversions | 📋 | S | Type `12*9` or `340 usd to bdt` → inline result row. Spotlight and Calculator both exist. |
| F8 | Dock right-click menus | 📋 | S | Options / Show in Finder / Quit. `ContextMenu.jsx` already exists. |
| F9 | Dock launch bounce | 📋 | XS | Icon bounces while an app opens. |
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
