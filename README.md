# macOS-Inspired Portfolio — Ferdous Mikdad

> A highly interactive, OS-like web portfolio inspired by macOS Tahoe 26.4.
> Users navigate a desktop environment rather than a traditional website.

---

## Project Vision

Complete rebuild of the portfolio from scratch. The experience should feel like a real operating system — draggable windows, a dock, keyboard shortcuts, sound, dark/light mode, and notifications — all presented with a minimal dark aesthetic.

**Core idea:** Every section is a macOS-style window. Every interaction is intentional.

---

## Design System

### Colors

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#080808` | Desktop background |
| `--brand` | `#CF0506` | Accent, icons, highlights |
| `--headline` | `#F3F0E5` | Primary text |
| `--body` | `#ABA795` | Secondary text |
| `--window-bg` | `#111111` | Window surface |
| `--window-border` | `rgba(255,255,255,0.08)` | Window borders |

### Background Texture
- Base: `#080808`
- Overlay: `Noise & Texture.png` (subtle grain)
- Dot grid: used in empty canvas areas

### Typography
- TBD — to be defined in `docs/DESIGN_SYSTEM.md`

---

## Window System

All sections behave like macOS windows.

### Traffic Light Controls (top-left of every window)
- 🔴 **Close** — removes the window from the desktop
- 🟡 **Minimize** — sends window to the dock/trash area
- 🟢 **Maximize** — expands window

### Minimize Behavior
- Minimized windows are stored in the **Dock (trash area)**
- On hover over dock: stacked preview appears (macOS Exposé-style)
- Click to restore any minimized window

---

## Navigation System

### Menu Bar (Dock)
- **Position:** Bottom center of screen
- **Inspired by:** Dynamic Island + macOS Dock
- **Structure:**
  - Left: `me-icon.svg` (avatar/profile)
  - Center: Active page title (e.g., *Home*, *About*)
  - Right: `menu-short.svg` (menu trigger)

### Opening the Menu
- Click menu icon **or** press `Cmd + F` / `Ctrl + F`
- Animates into a full macOS-style window listing all sections

### Keyboard Shortcuts

| Shortcut | Destination |
|---|---|
| `Shift + H` | Home |
| `Shift + A` | About Me |
| `Shift + P` | Portfolio |
| `Shift + S` | Shop |
| `Shift + N` | Notes |
| `Shift + T` | Tools |

---

## Global Right-Side Controls

A vertical control panel present on every page (right edge):

| Icon | Function |
|---|---|
| 🔔 | Notifications |
| 📊 | Stats / analytics view |
| 🌗 | Light / Dark mode toggle |

---

## Home Page Layout

Two windows on the desktop:

### Window 1 — Profile Card
- **Size:** 308 × 482px
- **Content:**
  - Top bar: window controls (left) + "Read more →" (right)
  - Photo: `mikdad.jpg`
  - Title: *About Me*
  - Subtitle: *"Designing digital experiences that blend creativity with usability. 5+ years in branding, web…"*
  - Social buttons: LinkedIn · Instagram · YouTube

### Window 2 — Pac-Man Game
- **Size:** 620 × 482px
- **Content:**
  - Enhanced interactive Pac-Man game
  - Game reveals portfolio content (carry over from existing build)
  - Styled as macOS window

---

## Notification System

- On **first visit**: latest news/post appears near the notification icon
- Style: stacked macOS-style cards
- On hover: cards expand in layered view

---

## Light & Dark Mode

- System-wide theme support
- Smooth CSS transitions
- Consistent across all windows and UI elements

---

## Pages (Planned)

| Page | Status |
|---|---|
| Home | Planned |
| About Me | Planned |
| Portfolio | Planned |
| Shop | Planned |
| Notes | Planned |
| Tools | Planned |

See `docs/PROGRESS.md` for detailed feature tracking.

---

## Tech Stack

See `docs/ARCHITECTURE.md` for full technical decisions.

| Layer | Tech |
|---|---|
| Framework | React + Vite |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| State | Zustand |
| Drag | @dnd-kit |
| Sound | Howler.js |
| Keyboard | tinykeys |

---

## Docs

| File | Purpose |
|---|---|
| `README.md` | Project overview and design spec |
| `docs/ARCHITECTURE.md` | Technical architecture, folder structure, component map |
| `docs/DESIGN_SYSTEM.md` | Design tokens, typography, component specs |
| `docs/PROGRESS.md` | Feature checklist and development status |
