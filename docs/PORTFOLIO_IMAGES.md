# Portfolio Images Guide

> How to add, replace, and manage portfolio images without touching any component.

---

## Folder structure

All portfolio images live in the `public/` folder so they are served directly by the browser — no imports needed.

```
new/public/portfolio/
├── branding-logo/          ← Logo, Arabic Logo, Brand identity work
│   ├── logo-1.png
│   ├── logo-2.jpg
│   ├── arabic-logo-1.svg
│   ├── brand-identity-1.svg
│   └── brand-identity-2.svg
└── ui-ux-design/           ← Landing pages, Dashboards, Mobile UI
    ├── landing-1.jpg
    ├── landing-2.png
    ├── dashboard-1.png
    ├── mobile-1.jpg
    └── mobile-2.jpg
```

**Supported formats:** `.jpg` `.jpeg` `.png` `.webp` `.svg`

**Naming convention:** `category-number.ext` — e.g. `logo-3.png`, `mobile-4.webp`

---

## The only file you ever edit

```
new/src/data/projects.js
```

Everything — categories, tags, image paths — is controlled from this one file.

---

## Add a new project

**Step 1** — Drop your image into the correct subfolder inside `public/portfolio/`.

**Step 2** — Open `new/src/data/projects.js` and append a new object to the `projects` array at the bottom:

```js
{
  id: 10,                                              // next unique number
  title: 'My New Project',                             // project name
  description: 'One-line summary of the work.',        // shown in list view
  image: '/portfolio/branding-logo/logo-2.png',        // path from public/
  category: 'logo',                                    // see category ids below
  tags: ['blue'],                                      // see tag ids below
},
```

**Step 3** — Save. The grid updates instantly in dev (`npm run dev`).

---

## Replace an existing image

Just overwrite the file in `public/portfolio/` with the same filename.
No code changes needed — the browser picks up the new file automatically.

---

## Category IDs

These are the valid values for the `category` field:

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

These are the valid values inside the `tags` array. A project can have multiple tags or an empty array `[]`.

| ID | Colour |
|---|---|
| `red` | 🔴 #FF3B30 |
| `orange` | 🟠 #FF9500 |
| `yellow` | 🟡 #FFCC00 |
| `green` | 🟢 #34C759 |
| `blue` | 🔵 #007AFF |
| `purple` | 🟣 #AF52DE |
| `gray` | ⚫ #8E8E93 |

---

## Add a new category

**Step 1** — Add a new item inside the relevant section in `CATEGORIES`:

```js
export const CATEGORIES = [
  {
    section: 'Branding & Logo',
    items: [
      { id: 'logo',           label: 'Logo' },
      { id: 'arabic-logo',    label: 'Arabic Logo' },
      { id: 'brand-identity', label: 'Brand identity', tag: 'red' },
      { id: 'packaging',      label: 'Packaging' },   // ← new item
    ],
  },
  ...
]
```

**Step 2** — Use the new id (`packaging`) in any project's `category` field.

To add a tag indicator dot next to the sidebar label, add `tag: 'colorId'` to the item (see `brand-identity` as an example).

---

## Add a new sidebar section

```js
export const CATEGORIES = [
  ...existing sections...
  {
    section: 'Motion & Video',       // section heading
    items: [
      { id: 'animation', label: 'Animation' },
      { id: 'reels',     label: 'Reels' },
    ],
  },
]
```

Then create a matching subfolder in `public/portfolio/` (e.g. `motion-video/`) and use the new category ids in your projects.

---

## Remove a project

Delete its object from the `projects` array in `projects.js`. You can also delete the image file from `public/portfolio/` if it is no longer used.

---

## Quick reference

```
Add image     →  public/portfolio/<folder>/<name>.<ext>
Edit data     →  src/data/projects.js  (projects array)
Add category  →  src/data/projects.js  (CATEGORIES array)
Add tag       →  src/data/projects.js  (TAGS array)
```
