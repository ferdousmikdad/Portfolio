# Assets

All project assets live here. Import them directly in components via the `@/assets/` alias.

```
assets/
├── images/       → Photos, profile picture, project screenshots, etc.
├── icons/        → Custom SVG icons (me-icon.svg, menu-short.svg, etc.)
├── sounds/       → UI sound effects (.mp3 / .webm for Howler.js)
├── fonts/        → Self-hosted font files (.woff2)
└── textures/     → Background textures (Noise & Texture.png, etc.)
```

## Usage in components

```jsx
// Image
import photo from '@/assets/images/mikdad.jpg'
<img src={photo} />

// SVG icon (as component)
import { ReactComponent as MeIcon } from '@/assets/icons/me-icon.svg'

// Sound (Howler.js)
import clickSound from '@/assets/sounds/click.mp3'
```

## public/ folder (project root)

Use `public/` only for files that need a **static URL** — things like `favicon.ico`, `og-image.jpg` (social share), or `robots.txt`.
Everything else belongs in `src/assets/`.

## Third-party icons

Two icons come from the [MacTahoe icon theme](https://github.com/vinceliuice/MacTahoe-icon-theme)
by Vince Liuice, which is licensed **GPL-3.0**:

| File | Upstream path |
|---|---|
| `icons/mac-folder-images.svg` | `src/places/scalable/folder-images.svg` |
| `icons/mac-system-settings.svg` | `src/apps/scalable/preferences-system.svg` |

GPL-3.0 is copyleft, so if this site is distributed these two files must keep
that licence and this attribution. Swap them for own-drawn artwork if that is
a problem — nothing else in the project depends on them beyond the Finder
sidebar's Portfolio row and the Settings window icon.
