# Background System

Controls how the desktop background renders — either the animated canvas or a static image wallpaper.

---

## How to Switch

Edit `public/bg-config.md`. Set the mode you want to `true` and the other to `false`.

**Use animated background:**
```
animatedbg: true
wallpaper: false
image: wallpaper.jpg
```

**Use static wallpaper:**
```
animatedbg: false
wallpaper: true
image: wallpaper.jpg
```

---

## Config File Reference

| Key | Value | Description |
|---|---|---|
| `animatedbg` | `true` / `false` | Enables the animated dot canvas background |
| `wallpaper` | `true` / `false` | Enables a static image wallpaper |
| `image` | filename | The wallpaper image file to use (from `public/wallpaper/`) |

> Only one mode should be `true` at a time. If both are `true`, `animatedbg` takes priority.

---

## Adding a Wallpaper Image

1. Place your image directly inside `public/`
2. Update the `image:` value in `public/bg-config.md` to match the filename

```
image: my-photo.jpg
```

Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`

---

## Files

| File | Purpose |
|---|---|
| `public/bg-config.md` | Config file — edit this to switch modes |
| `public/` | Drop wallpaper images here |
| `src/components/desktop/Background.jsx` | Component that reads the config and renders |
