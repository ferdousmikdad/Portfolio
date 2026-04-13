// ─────────────────────────────────────────────────────────────────────────────
// ADDING A NEW PROJECT — drop a folder and you're done
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. Create a project folder inside the right section:
//
//      public/portfolio/ui-ux-design/my-project/
//      public/portfolio/branding-logo/my-project/
//
// 2. Drop your images in (any image format works):
//
//      my-project-thumbnail.jpg   ← grid card thumbnail
//      my-project.jpg             ← full preview (opened on click)
//
//    Only one image? That's fine — it's used for both.
//
// 3. Done. The portfolio updates automatically on save.
//
// ── How category is assigned ──────────────────────────────────────────────
//
//   Folder name starts with...   →  Category shown in sidebar
//   ────────────────────────────────────────────────────────
//   landing-page / landing       →  Landing pages
//   dashboard                    →  Dashboards
//   mobile                       →  Mobile UI
//   arabic-logo / arabic         →  Arabic Logo
//   brand-identity / brand       →  Brand identity
//   (anything else)              →  Logo  (in branding-logo/)
//                                →  Landing pages  (in ui-ux-design/)
//
// ── Optional metadata override ────────────────────────────────────────────
//
//   Drop a _meta.json in the project folder:
//   {
//     "title": "My Custom Title",
//     "description": "One-line summary.",
//     "category": "dashboards",
//     "tags": ["blue", "green"]
//   }
//   Tag ids: red · orange · yellow · green · blue · purple · gray
//
// ─────────────────────────────────────────────────────────────────────────────

// Auto-discovered projects (powered by vite-plugin-portfolio)
export { default } from 'virtual:portfolio-projects'

// Tag colour palette — used by the sidebar tag filters
export const TAGS = [
  { id: 'red',    label: 'Red',    color: '#FF3B30' },
  { id: 'orange', label: 'Orange', color: '#FF9500' },
  { id: 'yellow', label: 'Yellow', color: '#FFCC00' },
  { id: 'green',  label: 'Green',  color: '#34C759' },
  { id: 'blue',   label: 'Blue',   color: '#007AFF' },
  { id: 'purple', label: 'Purple', color: '#AF52DE' },
  { id: 'gray',   label: 'Gray',   color: '#8E8E93' },
]

// Sidebar categories — labels only, ids must match the folder names above
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
