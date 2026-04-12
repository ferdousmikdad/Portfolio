// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD / UPDATE PORTFOLIO IMAGES
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. Drop your image into the correct folder inside:
//      new/public/portfolio/
//
//    Use the folder that matches the category:
//      branding-logo/     ← logos, arabic logos, brand identity work
//      ui-ux-design/      ← landing pages, dashboards, mobile UI
//
//    Recommended naming: category-number.jpg  (e.g. logo-2.jpg)
//    Supported formats : .jpg  .jpeg  .png  .webp  .svg
//
// 2. In the `projects` array below, add or edit an entry.
//    Set `image` to the path starting with /portfolio/…
//
//    Example — add a new logo:
//      {
//        id: 10,
//        title: 'New Logo',
//        description: 'Clean wordmark for a fintech brand.',
//        image: '/portfolio/branding-logo/logo-2.jpg',   // ← just the path
//        category: 'logo',
//        tags: ['blue'],
//      },
//
// 3. Save the file. The grid updates instantly (hot-reload in dev).
//
// That's it — no import lines needed, no component edits required.
//
// ─────────────────────────────────────────────────────────────────────────────

// Tag colour palette
export const TAGS = [
  { id: 'red',    label: 'Red',    color: '#FF3B30' },
  { id: 'orange', label: 'Orange', color: '#FF9500' },
  { id: 'yellow', label: 'Yellow', color: '#FFCC00' },
  { id: 'green',  label: 'Green',  color: '#34C759' },
  { id: 'blue',   label: 'Blue',   color: '#007AFF' },
  { id: 'purple', label: 'Purple', color: '#AF52DE' },
  { id: 'gray',   label: 'Gray',   color: '#8E8E93' },
]

// Sidebar categories — edit labels here if you rename a section
export const CATEGORIES = [
  {
    section: 'Branding & Logo',
    items: [
      { id: 'logo',           label: 'Logo' },
      { id: 'arabic-logo',    label: 'Arabic Logo' },
      { id: 'brand-identity', label: 'Brand identity', tag: 'red' },
    ],
  },
  {
    section: 'UI/UX Design',
    items: [
      { id: 'landing-pages', label: 'Landing pages' },
      { id: 'dashboards',    label: 'Dashboards' },
      { id: 'mobile-ui',     label: 'Mobile UI' },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS LIST
// Fields:
//   id          — unique number (increment for each new entry)
//   title       — project name
//   description — one-line summary (used in list view)
//   thumbnail   — grid card image  (use -thumbnail version, 4:3 ratio)
//   preview     — full preview image shown in the lightbox (full resolution)
//   category    — must match one of the item ids in CATEGORIES above
//   tags        — array of tag ids from TAGS above (can be empty [])
//
// Folder convention:
//   public/portfolio/<category-folder>/<project-slug>/
//     <project-slug>-thumbnail.jpg   ← thumbnail (used in grid)
//     <project-slug>.jpg             ← preview   (shown in lightbox)
//
// If only one image exists, set both thumbnail and preview to the same path.
// ─────────────────────────────────────────────────────────────────────────────
const projects = [
  {
    id: 1,
    title: 'Brand Identity',
    description: 'Complete visual identity system — logo, type, colour palette and usage guidelines.',
    thumbnail: '/portfolio/branding-logo/brand-identity-1.svg',
    preview:   '/portfolio/branding-logo/brand-identity-1.svg',
    category: 'brand-identity',
    tags: ['red'],
  },
  {
    id: 2,
    title: 'Logo Design',
    description: 'Minimal wordmark with strong geometric structure for a tech startup.',
    thumbnail: '/portfolio/branding-logo/logo-1.png',
    preview:   '/portfolio/branding-logo/logo-1.png',
    category: 'logo',
    tags: ['blue'],
  },
  {
    id: 3,
    title: 'Arabic Logo',
    description: 'Calligraphy-inspired Arabic logotype crafted for a luxury fashion label.',
    thumbnail: '/portfolio/branding-logo/arabic-logo-1.svg',
    preview:   '/portfolio/branding-logo/arabic-logo-1.svg',
    category: 'arabic-logo',
    tags: ['purple'],
  },
  {
    id: 4,
    title: 'Landing Page',
    description: 'High-conversion SaaS landing page with motion and dark-mode support.',
    thumbnail: '/portfolio/ui-ux-design/landing-page-1/landing-page-1-thumbnail.jpg',
    preview:   '/portfolio/ui-ux-design/landing-page-1/landing-page-1.jpg',
    category: 'landing-pages',
    tags: ['green'],
  },
  {
    id: 5,
    title: 'Analytics Dashboard',
    description: 'Data-dense dashboard with chart library, filters, and dark theme.',
    thumbnail: '/portfolio/ui-ux-design/dashboard-1.png',
    preview:   '/portfolio/ui-ux-design/dashboard-1.png',
    category: 'dashboards',
    tags: ['orange'],
  },
  {
    id: 6,
    title: 'Mobile App UI',
    description: 'iOS-style mobile interface for a fitness tracking application.',
    thumbnail: '/portfolio/ui-ux-design/mobile-1.jpg',
    preview:   '/portfolio/ui-ux-design/mobile-1.jpg',
    category: 'mobile-ui',
    tags: ['yellow'],
  },
  {
    id: 7,
    title: 'Brand Guidelines',
    description: 'Comprehensive 48-page brand manual covering all visual and tonal rules.',
    thumbnail: '/portfolio/branding-logo/brand-identity-2.svg',
    preview:   '/portfolio/branding-logo/brand-identity-2.svg',
    category: 'brand-identity',
    tags: ['red', 'gray'],
  },
  {
    id: 8,
    title: 'Mobile Dashboard',
    description: 'Compact analytics view optimised for one-handed mobile use.',
    thumbnail: '/portfolio/ui-ux-design/mobile-2.jpg',
    preview:   '/portfolio/ui-ux-design/mobile-2.jpg',
    category: 'mobile-ui',
    tags: ['blue', 'green'],
  },
  {
    id: 9,
    title: 'E-commerce Landing',
    description: 'Product-first landing page with full-bleed imagery and cart CTA.',
    thumbnail: '/portfolio/ui-ux-design/landing-2.png',
    preview:   '/portfolio/ui-ux-design/landing-2.png',
    category: 'landing-pages',
    tags: ['orange', 'yellow'],
  },
]

export default projects
