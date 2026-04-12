# Design System

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#080808` | Desktop / page background |
| `--brand` | `#CF0506` | Accent color, icons, CTAs |
| `--headline` | `#F3F0E5` | Primary headings and labels |
| `--body` | `#ABA795` | Body text, secondary labels |
| `--window-bg` | `#111111` | Window surface |
| `--window-border` | `rgba(255,255,255,0.08)` | Window border (subtle) |
| `--dock-bg` | `rgba(30,30,30,0.85)` | Dock + menu bar background |
| `--overlay` | `rgba(0,0,0,0.6)` | Backdrop / blur overlay |

---

## Background

- **Base:** `#080808` solid
- **Texture:** `Noise & Texture.png` at low opacity (~0.04) — adds grain
- **Dot grid:** Used in empty canvas areas and game window  
  Pattern: `radial-gradient` dots, ~24px spacing, `rgba(255,255,255,0.06)`

---

## Typography

> To be finalized. Placeholder recommendations:

| Role | Font | Weight | Size |
|---|---|---|---|
| Headline | SF Pro Display / Inter | 600 | 24–32px |
| Body | SF Pro Text / Inter | 400 | 13–15px |
| Label | SF Pro Text / Inter | 500 | 11–13px |
| Shortcut | SF Mono / JetBrains Mono | 400 | 11px |

---

## Window Component Spec

### Structure
```
┌─────────────────────────────────────┐
│ ● ● ●   [Title]        [Action]     │  ← Title bar (40px)
├─────────────────────────────────────┤
│                                     │
│         Window content              │
│                                     │
└─────────────────────────────────────┘
```

### Measurements
- **Border radius:** 12px
- **Title bar height:** 40px
- **Border:** 1px solid `rgba(255,255,255,0.08)`
- **Background:** `#111111`
- **Box shadow:** `0 24px 64px rgba(0,0,0,0.6)`
- **Backdrop blur (optional):** `blur(20px)` for glass effect

### Traffic Lights
- **Close (red):** `#FF5F57` — size 12px, gap 8px between dots
- **Minimize (yellow):** `#FFBD2E`
- **Maximize (green):** `#28C840`
- On hover: show icons inside dots (×, −, ⤢)

---

## Dock / Menu Bar

### Dock Bar (bottom)
- **Height:** 52px
- **Border radius:** 28px (pill shape)
- **Background:** `rgba(28,28,28,0.9)` with backdrop blur
- **Border:** 1px solid `rgba(255,255,255,0.10)`
- **Padding:** 8px 20px

### Menu Window (expanded)
- **Width:** ~280px
- **Border radius:** 16px
- Matches window styling
- Items: 48px row height, icon (20px) + label + shortcut badge

### Shortcut Badge
- Background: `rgba(255,255,255,0.08)`
- Border radius: 6px
- Padding: 2px 8px
- Font: monospace, 11px

---

## Right-Side Controls

- **Width:** 32px strip
- **Gap between icons:** 16px
- **Icon size:** 20px
- **Color:** `#ABA795` default, `#F3F0E5` on active/hover

---

## Notification Cards

- **Width:** ~240px
- **Border radius:** 12px
- **Stack offset:** 8px vertical, 4px scale reduction per card behind
- **Background:** `#1A1A1A`
- **Animation:** spring-based expand on hover (Framer Motion)

---

## Animation Tokens

| Motion | Value |
|---|---|
| Window open | `spring { stiffness: 300, damping: 25 }` |
| Window close | `tween { duration: 0.2, ease: 'easeIn' }` |
| Minimize to dock | Scale down + translate to dock position |
| Menu expand | `spring { stiffness: 350, damping: 28 }` |
| Hover card expand | `spring { stiffness: 400, damping: 30 }` |

---

## Iconography

- Style: SF Symbols-inspired (rounded, minimal)
- Sources: Lucide React or custom SVGs
- Size: 20px standard, 16px compact
- Color: inherits from parent, uses `currentColor`

---

## Spacing Scale

Using Tailwind default 4px base unit.
Key values: 4, 8, 12, 16, 20, 24, 32, 40, 48px
