# Progress Tracker

> Track what's been built, what's in progress, and what's next.
> Update this file as features are completed.

---

## Status Legend

| Symbol | Meaning |
|---|---|
| ✅ | Done |
| 🔄 | In Progress |
| 📋 | Planned |
| ⏸ | Blocked / On Hold |

---

## Phase 1 — Project Setup

| Task | Status | Notes |
|---|---|---|
| Define design system & colors | ✅ | See `DESIGN_SYSTEM.md` |
| Write architecture docs | ✅ | See `ARCHITECTURE.md` |
| Create project with Vite + React | ✅ | Vite 5.4 + React 18 |
| Configure Tailwind CSS | ✅ | v3.4, custom tokens in `tailwind.config.js` |
| Set up Zustand stores | ✅ | windowStore, themeStore, soundStore |
| Set up folder structure | ✅ | Full src/ tree per ARCHITECTURE.md |

---

## Phase 2 — Core Desktop Shell

| Task | Status | Notes |

| Window open/close/minimize animation | 📋 | |
| Z-index / focus management | 📋 | |
| WindowManager (renders all open windows) | 📋 | |

---

## Phase 3 — Dock + Navigation

| Task | Status | Notes |
|---|---|---|
| Keyboard shortcuts (tinykeys) | 📋 | Shift+H, A, P, S, N, T |
| Minimized window previews in dock | 📋 | |


---

## Phase 4 — Home Page

| Task | Status | Notes |
|---|---|---|
| Profile Card window (308×482) | 📋 | Photo, bio, socials |
| Pac-Man game window (620×482) | 📋 | Port from existing build |
| Window layout on desktop | 📋 | |

---

## Phase 5 — Global Controls (Right Side)

| Task | Status | Notes |
|---|---|---|
| Right-side control strip | 📋 | |
| Dark / Light mode toggle | 📋 | |
| Sound toggle | 📋 | |
| Notification icon | 📋 | |
| Notification cards (stacked, hover expand) | 📋 | |

---

## Phase 6 — Sound System

| Task | Status | Notes |
|---|---|---|
| Howler.js setup | 📋 | |
| UI sound effects (click, open, close, minimize) | 📋 | |
| Notification sound | 📋 | |
| Sound on/off toggle | 📋 | |

---

## Phase 7 — Individual Pages (Windows)

| Page | Status | Notes |
|---|---|---|
| About Me | 📋 | |
| Portfolio | 📋 | |
| Shop | 📋 | |
| Notes | 📋 | |
| Tools | 📋 | |

---

## Phase 8 — Polish & Performance

| Task | Status | Notes |
|---|---|---|
| Lazy loading for page windows | 📋 | |
| Mobile responsive considerations | 📋 | |
| Accessibility (keyboard nav, focus traps) | 📋 | |
| SEO meta tags | 📋 | |
| Performance audit | 📋 | |
| Cross-browser testing | 📋 | |

---

## Known Issues / Blockers

_None yet — project not started._

---

## Decisions Log

| Date | Decision | Reason |
|---|---|---|
| 2026-04-10 | Vite + React over Next.js | Pure SPA, no SSR needed, faster setup |
| 2026-04-10 | @dnd-kit over React Draggable | More modern, touch support, actively maintained |
| 2026-04-10 | tinykeys for shortcuts | Under 1kb, clean API |
