# Portfolio Images Guide

> How to add, replace, and manage portfolio images without touching any component.

---

## Folder structure

Each project lives in its own subfolder inside `public/portfolio/`. Every project folder contains two images:

- **`-thumbnail`** — shown in the grid (optimised, 4:3 ratio, e.g. 1024×768)
- **full image** — shown in the lightbox/preview overlay (full resolution)

```
public/portfolio/
├── branding-logo/
│   ├── brand-identity-1.svg
│   ├── brand-identity-2.svg
│   ├── logo-1.png
│   └── arabic-logo-1.svg
└── ui-ux-design/
    ├── landing-page-1/
    │   ├── landing-page-1-thumbnail.jpg   ← grid thumbnail
    │   └── landing-page-1.jpg             ← lightbox preview
    ├── dashboard-1.png
    ├── mobile-1.jpg
    └── mobile-2.jpg
```

**Supported formats:** `.jpg` `.jpeg` `.png` `.webp` `.svg`

**Naming convention (for new projects):**
```
public/portfolio/<category-folder>/<project-slug>/
  <project-slug>-thumbnail.jpg    ← 4:3 ratio, ~1024×768
  <project-slug>.jpg              ← full resolution
```

---

## The only file you ever edit

```
src/data/projects.js
```

Everything — categories, tags, image paths — is controlled from this one file.

---

## Add a new project

**Step 1** — Create a subfolder for your project inside the correct category folder:

```
public/portfolio/ui-ux-design/my-new-project/
  my-new-project-thumbnail.jpg
  my-new-project.jpg
```

**Step 2** — Open `src/data/projects.js` and append a new entry to the `projects` array:

```js
{
  id: 10,                                                                          // next unique number
  title: 'My New Project',                                                         // shown in header
  description: 'One-line summary of the work.',                                    // shown in list view
  thumbnail: '/portfolio/ui-ux-design/my-new-project/my-new-project-thumbnail.jpg', // grid image
  preview:   '/portfolio/ui-ux-design/my-new-project/my-new-project.jpg',           // lightbox image
  category: 'landing-pages',                                                        // see category ids below
  tags: ['blue'],                                                                    // see tag ids below
},
```

> **Single-image projects:** If you only have one image, set both `thumbnail` and `preview` to the same path.

**Step 3** — Save. The grid updates instantly in dev (`npm run dev`).

---

## Replace an existing image

Overwrite the file in `public/portfolio/` with the same filename.
No code changes needed — the browser picks up the new file automatically.

---

## How the lightbox works

Clicking any thumbnail in the portfolio grid opens a full-screen preview overlay:

- **Title** is shown in the top-left of the overlay header
- **Share** button copies/shares the current URL
- **Get in Touch** button opens `mailto:ferdousmikdad@gmail.com`
- **ESC key** or clicking the backdrop closes the overlay
- The overlay is rendered at `z-index: 9001`, above all windows

---

## Category IDs

| ID | Sidebar label | Folder |
|---|---|---|
| `logo` | Logo | `branding-logo/` |
| `arabic-logo` | Arabic Logo | `branding-logo/` |
| `brand-identity` | Brand identity | `branding-logo/` |
| `landing-pages` | Landing pages | `ui-ux-design/` |
| `dashboards` | Dashboards | `ui-ux-design/` |
| `mobile-ui` | Mobile UI | `ui-ux-design/` |

---

## Tag IDs

| ID | Colour |
|---|---|
| `red` | #FF3B30 |
| `orange` | #FF9500 |
| `yellow` | #FFCC00 |
| `green` | #34C759 |
| `blue` | #007AFF |
| `purple` | #AF52DE |
| `gray` | #8E8E93 |

---

## Quick reference

```
Add image     →  public/portfolio/<category>/<project-slug>/<project-slug>-thumbnail.jpg
                 public/portfolio/<category>/<project-slug>/<project-slug>.jpg
Edit data     →  src/data/projects.js  (projects array)
Add category  →  src/data/projects.js  (CATEGORIES array)
Add tag color →  src/data/projects.js  (TAGS array)
```
