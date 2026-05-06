# Language / i18n Tracking

Tracks which pages, windows, and components have been translated (EN ↔ AR)
and what still needs work.

---

## System Files

| File | Purpose | Status |
|------|---------|--------|
| `src/store/languageStore.js` | Zustand store — holds `lang`, `setLang`. Persists to localStorage, sets `document.documentElement.lang/dir` | ✅ Done |
| `src/i18n/translations.js`  | All EN + AR strings in one object | ✅ Done |
| `src/hooks/useT.js`         | `useT()` hook — returns `translations[lang]` | ✅ Done |
| `index.html`                | El Messiri font added via Google Fonts API (`family=El+Messiri:wght@400;500;600;700`) | ✅ Done |
| `src/styles/globals.css`    | `[lang="ar"]` applies El Messiri font; `[dir="rtl"]` RTL helpers | ✅ Done |

---

## Components — Translation Status

### Desktop / TopBar

| Component | Strings translated | Notes |
|-----------|--------------------|-------|
| `TopBar.jsx` | Nav items (Portfolio, Notes, Tools), Status panel, Search panel, Settings panel (Appearance / Sound), Language panel | ✅ Done |

### Dock

| Component | Strings translated | Notes |
|-----------|--------------------|-------|
| `MenuWindow.jsx` | All 6 nav items, shortcut hint | ✅ Done |
| `MinimizedTray.jsx` | "No minimized windows" | ✅ Done |
| `Dock.jsx` | No user-facing text (icons only) | — |
| `ToolsDock.jsx` | No user-facing text (icons only) | — |

### App Windows

| Window | Strings translated | Notes |
|--------|--------------------|-------|
| `ProfileCard.jsx` | Title "About me", bio, "Read more →" | ✅ Done |
| `AboutMeWindow.jsx` | "Hey!", "You" cursor tag, all 5 Q&A pairs | ✅ Done |
| `WorkWindow.jsx` | All / Recents, section headers, category labels, tag labels, Search placeholder, No results | ✅ Done |
| `NotesWindow.jsx` | Categories label, category list, "Open the canvas", entry/entries count, "Select a note to read", Back, Eraser, Clear, Export PNG | ✅ Done |
| `ToolsWindow.jsx` | "Coming Soon" fallback state | ✅ Done |
| `ComingSoonWindow.jsx` | Shop label, description, "Coming Soon" | ✅ Done |
| `PacmanWindow.jsx` | No user-facing text | — |
| `MikudaChat.jsx` | Chat UI strings | ⬜ Pending |
| `ProjectPreviewWindow.jsx` | Project preview overlay | ⬜ Pending |

### Mobile Components

| Component | Status |
|-----------|--------|
| `MobileHero.jsx` | ⬜ Pending |
| `MobileAbout.jsx` | ⬜ Pending |
| `MobileContact.jsx` | ⬜ Pending |

---

## Data Files — Translation Status

| File | Status | Notes |
|------|--------|-------|
| `src/data/notes.js` | ⬜ Pending | Titles/previews could use `titleAr` / `previewAr` fields; long body content left in EN |
| `src/data/projects.js` | ✅ Done via translations.js | Category/section labels mapped in `t.work.categories` and `t.work.sections` |
| `src/data/tools.js` | No user text | — |

---

## Translation Keys Reference

All strings live in `src/i18n/translations.js` under `en` and `ar` keys:

```
t.nav.portfolio / .notes / .tools
t.status.label / .available / .busy / .away
t.search.placeholder / .empty / .noResults(q)
t.settings.appearance / .lightMode / .darkMode / .sound / .soundOn / .soundOff
t.language.label
t.menu.shortcutHint / .home / .about / .portfolio / .shop / .notes / .tools
t.profile.title / .bio / .readMore
t.about.hey / .you / .qa[].q / .qa[].answer / .qa[].email
t.work.all / .recents / .noResults / .search / .sections{} / .categories{} / .tags{}
t.notes.categoriesLabel / .openCanvas / .selectNote / .back / .eraser / .clear / .exportPng / .entry / .entries / .categories{}
t.tools.comingSoon
t.shop.label / .desc
t.tray.empty
t.dock.tools
```

---

## Font

**El Messiri** (Google Fonts) — Used for Arabic mode.
Loaded in `index.html`:
```html
family=El+Messiri:wght@400;500;600;700
```
Applied via CSS:
```css
:root[lang="ar"] * { font-family: 'El Messiri', 'SF Pro Display', sans-serif; }
```

---

## RTL Notes

- `document.documentElement.dir` is set to `"rtl"` when `lang === "ar"`.
- TopBar, window titlebars, and kbd badges have RTL overrides in `globals.css`.
- Tailwind `rtl:` variants are available if you enable `experimentalFeatures.optimizeUniversalDefaults` but are not yet applied component-by-component.

---

## Next Steps (what to do when resuming)

1. **MikudaChat** — translate all prompt pills, bubble text, error states in `MikudaChat.jsx`
2. **ProjectPreviewWindow** — translate button labels and metadata display
3. **Notes data** — add `titleAr` / `previewAr` fields to each note in `notes.js` and read them in `NoteRow` + `ArticleView`
4. **Mobile components** — `MobileHero`, `MobileAbout`, `MobileContact`
5. **RTL layout polish** — audit flex-row layouts that need `flex-row-reverse` under `[dir="rtl"]`


Good, all changes look correct. Let me do one final check — the Window component receives props from its parent. When the parent re-renders due to a lang    
  change, Window will re-render too. But let me verify there's no stale closure in Window.jsx:  

  I was push code from this repo to github by myself. after that I did some mistake and added so many codes for translation. but I don't need them now. I need 
   the github code that is clean. what may I now