---
name: Project Window Sizing
description: How the 3 default windows are scaled at 1440px breakpoint on first load
type: project
---

At ≤1440px viewport, the 3 default windows on first load are scaled to 90%:
- Portfolio window: initW/initH in windowStore.js (946×582 → ~851×524)
- Tools window (color-contrast): same initW/initH
- Mikuda AI: CSS media query on `.mk-window` (280×380 → 252×342)

**Key rules:**
- Switching to a new tool via dock → resets to 100% size and centers in viewport (switchTool action)
- Opening Portfolio from menu → resets to 100% size and centers (openWindow action)
- Fit to screen / restore down → recenters whichever tool is currently open (centerInitialWindows in Desktop.jsx)
- color-contrast on initial load keeps a -110px offset from center (staggered layout with portfolio)

**Why:** User's viewport is 1440px; without scaling the windows felt too large on first entry.
