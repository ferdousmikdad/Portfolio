# Mobile Redesign Progress

**Reference:** kalyp.so — page-based navigation, bottom nav pill, full-screen tool viewer  
**Started:** 2026-04-14  
**Status:** In progress

---

## Design Decisions

| Decision | Rationale |
|---|---|
| Page-based routing (state, not URL) | No need for a router; fast transitions, simple state |
| Bottom nav pill (always visible) | kalyp.so pattern — clear navigation without taking content space |
| Full-screen menu overlay | Exposes all sections (Contact, etc.) without cluttering the nav |
| Tools open inline (iframe overlay) | User requirement — no new windows/tabs on mobile |
| About = conversation style | Same Q&A pattern as desktop `AboutMeWindow` |
| Bottom nav: dark in light mode, elevated in dark mode | Contrast and usability across themes |

---

## Screens / Components

### New Components

| File | Status | Description |
|---|---|---|
| `MobileApp.jsx` | ✅ Done | Root — manages `activePage`, `menuOpen`, `activeTool` |
| `MobileNav.jsx` | ✅ Done | Fixed bottom nav pill with icons + Menu button |
| `MobileMenu.jsx` | ✅ Done | Full-screen menu overlay (dark, always) |
| `MobileHome.jsx` | ✅ Done | Home screen — display name, role, tagline, socials |
| `MobilePortfolio.jsx` | ✅ Done | Portfolio screen — category pills + 2-col project grid |
| `MobileAbout.jsx` | ✅ Done | About screen — conversation-style Q&A (like desktop) |
| `MobileTools.jsx` | ✅ Done | Tools grid — tapping opens inline `MobileToolViewer` |
| `MobileToolViewer.jsx` | ✅ Done | Full-screen iframe overlay for tools |
| `MobileContact.jsx` | ✅ Done | Contact screen — email, phone, social links |

### Files Replaced

| File | Change |
|---|---|
| `MobileNav.jsx` | Was sticky top bar → now fixed bottom pill |
| `MobileHero.jsx` | Renamed to `MobileHome.jsx`, redesigned |
| `MobileAbout.jsx` | Replaced scroll-in cards → conversation-style |
| `MobileTools.jsx` | Replaced anchor links → inline iframe viewer |

---

## Navigation Structure

```
Bottom Nav: [🏠 Home] [⊞ Work] [👤 About] [⚙ Tools] [≡ Menu]

Menu Overlay:
  ↳ Home
  ↳ Work
  ↳ About
  ↳ Tools
  ↳ Contact
```

---

## CSS Changes

- Added `--m-nav-bg`, `--m-nav-text`, `--m-nav-text-muted` CSS vars for bottom nav theming
- Added mobile nav + menu + tool viewer CSS classes at end of `globals.css`
- Kept existing `@media (max-width: 767px)` block (chat window override)

---

## Known Constraints

- `html, body, #root { overflow: hidden }` (desktop requirement) — mobile pages use `height: 100svh + overflowY: auto` within their content area to scroll internally
- `ProjectPreviewWindow` already handles `isMobile` prop (top: 0 instead of top: 28)
- MikudaChat FAB sits above the bottom nav (z-index 500, bottom: 80px on mobile)

---

## Checklist

- [x] Create progress doc
- [x] MobileApp — page state management
- [x] MobileNav — bottom pill nav
- [x] MobileMenu — full overlay
- [x] MobileHome — hero screen
- [x] MobilePortfolio — projects
- [x] MobileAbout — conversation style
- [x] MobileTools — inline tool viewer
- [x] MobileContact — contact screen
- [x] CSS additions
- [ ] Test light + dark mode on device
- [ ] Test tool iframe loading
- [ ] Test ProjectPreviewWindow on mobile
- [ ] Verify MikudaChat FAB doesn't overlap bottom nav
