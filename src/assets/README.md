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
