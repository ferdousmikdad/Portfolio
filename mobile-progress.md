# Mobile Responsive Progress

## Breakpoint Strategy
- **Mobile**: < 768px → MobileApp (classic scrollable layout)
- **Tablet / Desktop**: ≥ 768px → Desktop (existing macOS UI, untouched)

## What Mobile Shows
- Sticky minimal nav (logo + hamburger)
- Hero section (avatar, name, role, CTAs, socials)
- Portfolio section (category pills + 2-col grid → opens ProjectPreviewWindow)
- About section (Q&A accordion)
- Tools section (2-col icon grid → opens tool URLs)
- Contact section (email, phone, social links)
- Mikuda AI chat FAB (bottom-right, kept)

## What Mobile Does NOT Show
- TopBar (macOS menu bar)
- Window system (draggable windows)
- Dock
- Pacman game
- Profile card window
- Notes window
- Coming Soon / Shop window

## Files Created
- [x] `src/hooks/useIsMobile.js`
- [x] `src/components/mobile/MobileApp.jsx`
- [x] `src/components/mobile/MobileNav.jsx`
- [x] `src/components/mobile/MobileHero.jsx`
- [x] `src/components/mobile/MobilePortfolio.jsx`
- [x] `src/components/mobile/MobileAbout.jsx`
- [x] `src/components/mobile/MobileTools.jsx`
- [x] `src/components/mobile/MobileContact.jsx`

## Files Modified
- [x] `src/App.jsx` — conditionally render MobileApp vs Desktop
- [x] `src/components/apps/ProjectPreviewWindow.jsx` — top:0 on mobile (no topbar)
- [x] `src/styles/globals.css` — mk-window width fix for mobile

## Sections
| Section    | Status | Notes                                     |
|------------|--------|-------------------------------------------|
| Nav        | done   | Logo + hamburger, smooth scroll links     |
| Hero       | done   | Avatar, name, role, CTAs, socials         |
| Portfolio  | done   | Category pills, 2-col grid, preview modal |
| About      | done   | Photo + Q&A accordion                     |
| Tools      | done   | 2-col icon grid, links to tool pages      |
| Contact    | done   | Email, phone, social links                |

## Known Constraints
- Tool pages (iframes) are HTML files — open directly via href on mobile, not in a window
- ProjectPreviewWindow is full-screen overlay — works on mobile as-is
- MikudaChat window width capped at calc(100vw - 32px) on mobile via CSS
- Dark/light theme toggles via themeStore — mobile nav includes theme toggle button
