# Architecture

## Tech Stack Decisions

### Framework: React + Vite
- Pure SPA — no server-side rendering needed
- Vite gives instant dev server and fast HMR
- React's component model maps perfectly to the window/app concept

### Styling: Tailwind CSS
- Utility-first, fast to iterate
- Easy dark/light mode with `class` strategy
- Custom design tokens configured in `tailwind.config.js`

### Animation: Framer Motion
- macOS-quality spring physics
- `AnimatePresence` for mount/unmount transitions
- `useDragControls` for draggable windows
- `layout` prop for smooth window resize

### State Management: Zustand
- Lightweight, no boilerplate
- Manages: open windows, minimized windows, focused window (z-index), theme, sound

### Drag: @dnd-kit
- Modern, accessible, touch-friendly
- Used for dragging windows around the desktop

### Sound: Howler.js
- Preloaded audio sprites
- UI sounds: click, minimize, maximize, close, notification

### Keyboard Shortcuts: tinykeys
- Tiny (< 1kb), handles `Shift+H`, `Ctrl+F` etc.
- Registered globally on the desktop component

---

## Folder Structure

```
src/
├── components/
│   ├── desktop/
│   │   ├── Desktop.jsx          # Root canvas, wallpaper, window renderer
│   │   ├── Wallpaper.jsx        # Dot grid + noise texture background
│   │   └── RightControls.jsx    # Notification, stats, theme toggle
│   ├── window/
│   │   ├── Window.jsx           # Reusable macOS window shell
│   │   ├── WindowControls.jsx   # Traffic light buttons (close/min/max)
│   │   └── WindowManager.jsx    # Renders all open windows with z-ordering
│   ├── dock/
│   │   ├── Dock.jsx             # Bottom bar: avatar + title + menu trigger
│   │   ├── DockMinimized.jsx    # Minimized window previews on hover
│   │   └── MenuWindow.jsx       # Expanded nav menu (Shift+H etc.)
│   ├── apps/
│   │   ├── ProfileCard.jsx      # About Me window (308×482)
│   │   ├── PacmanGame.jsx       # Pac-Man game window (620×482)
│   │   ├── AboutApp.jsx         # About Me page (full)
│   │   ├── PortfolioApp.jsx     # Portfolio page
│   │   ├── ShopApp.jsx          # Shop page
│   │   ├── NotesApp.jsx         # Notes page
│   │   └── ToolsApp.jsx         # Tools page
│   ├── notifications/
│   │   ├── NotificationPanel.jsx
│   │   └── NotificationCard.jsx
│   └── ui/
│       ├── SoundToggle.jsx
│       ├── ThemeToggle.jsx
│       └── KeyboardShortcuts.jsx
├── store/
│   ├── windowStore.js           # Open/minimized/focused window state
│   ├── themeStore.js            # Dark/light mode
│   └── soundStore.js            # Sound on/off + Howler instance
├── hooks/
│   ├── useKeyboardShortcuts.js  # tinykeys bindings
│   ├── useWindowManager.js      # Open, close, minimize, focus window
│   └── useSound.js              # Play sound effects
├── assets/
│   ├── images/
│   ├── sounds/
│   └── textures/
├── styles/
│   └── globals.css              # Tailwind base + CSS variables
├── App.jsx
└── main.jsx
```

---

## Window State Model

Each window in Zustand has this shape:

```js
{
  id: 'profile',           // unique ID
  title: 'About Me',       // shown in dock center
  component: ProfileCard,  // component to render
  isOpen: true,
  isMinimized: false,
  isFocused: true,
  position: { x: 100, y: 80 },
  size: { width: 308, height: 482 },
  zIndex: 10,
}
```

### Z-Index Logic
- Clicking a window brings it to the top (highest zIndex)
- Managed in `windowStore.js` via `focusWindow(id)`

---

## Theme System

Tailwind configured with `darkMode: 'class'`.

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: '#CF0506',
      headline: '#F3F0E5',
      body: '#ABA795',
      'window-bg': '#111111',
    }
  }
}
```

Toggle adds/removes `dark` class on `<html>`.

---

## Routing

No traditional routing — this is a desktop OS model.

- "Pages" are **window components** opened on the desktop
- Navigation = open/close/focus windows
- Deep linking (optional later): URL hash maps to open window (`#portfolio`)

---

## Performance Notes

- Windows are lazy-loaded (React `lazy` + `Suspense`)
- Pac-Man game canvas isolated in its own component
- Framer Motion's `LayoutGroup` used for coordinated animations
- Sounds preloaded on first user interaction (browser autoplay policy)
