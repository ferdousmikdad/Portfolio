/* ── Clipio ────────────────────────────────────────────────────────────────
   Ferdous's own macOS screen recorder, shown off as a menu-bar extra the way
   it lives on a real Mac. Everything here is lifted from the app itself
   (clipio-macOS): the glyphs are its resources/menu template images, the
   rows are MenuBarMenu.swift's in its order, and the chords are
   CaptureSettings.defaultHotkeys (⌥⇧ + digit).                              */

import trayUrl             from '@/assets/icons/clipio/tray.png?url'
import appIconUrl          from '@/assets/icons/clipio/app-icon.png?url'
import captureAreaUrl      from '@/assets/icons/clipio/capture-area.png?url'
import captureFullUrl      from '@/assets/icons/clipio/capture-fullscreen.png?url'
import captureWindowUrl    from '@/assets/icons/clipio/capture-window.png?url'
import captureScrollUrl    from '@/assets/icons/clipio/capture-scrolling.png?url'
import captureOcrUrl       from '@/assets/icons/clipio/capture-ocr.png?url'
import recordAreaUrl       from '@/assets/icons/clipio/record-area.png?url'
import recordFullUrl       from '@/assets/icons/clipio/record-fullscreen.png?url'
import recordWindowUrl     from '@/assets/icons/clipio/record-window.png?url'

export const CLIPIO_TRAY = trayUrl
export const CLIPIO_ICON = appIconUrl
export const CLIPIO_VERSION = '0.1.0 (Beta)'
export const CLIPIO_SITE = 'https://clipio.pro'

/* Clipio's site, in a new tab — the portfolio stays where it was. */
export const openClipioSite = () => window.open(CLIPIO_SITE, '_blank', 'noopener,noreferrer')

export const CLIPIO_CAPTURES = [
  { label: 'Capture Area',       glyph: captureAreaUrl,   key: '⌥⇧1' },
  { label: 'Capture Fullscreen', glyph: captureFullUrl,   key: '⌥⇧2' },
  { label: 'Capture Window',     glyph: captureWindowUrl, key: '⌥⇧3' },
  { label: 'Scrolling Capture',  glyph: captureScrollUrl, key: '⌥⇧4' },
  { label: 'Capture Text (OCR)', glyph: captureOcrUrl,    key: '⌥⇧5' },
]

export const CLIPIO_RECORDS = [
  { label: 'Record Area',       glyph: recordAreaUrl,   key: '⌥⇧6' },
  { label: 'Record Fullscreen', glyph: recordFullUrl,   key: '⌥⇧7' },
  { label: 'Record Window',     glyph: recordWindowUrl, key: '⌥⇧8' },
]

/* The menu under the tray glyph. On the portfolio every row opens the
   Clipio window rather than capturing — the browser is not the Mac. The
   real menu's Settings…, Launch at Login and Quit have nothing to act on
   here, so they are left out; Download goes to clipio.pro. */
export function clipioMenu(open) {
  const row = ({ label, glyph, key }) => ({ label, template: glyph, shortcut: key, onClick: open })
  return [
    { label: 'All in One', onClick: open },
    { sep: true },
    ...CLIPIO_CAPTURES.map(row),
    { sep: true },
    ...CLIPIO_RECORDS.map(row),
    { sep: true },
    { label: 'Open Clipio', onClick: open },
    { label: 'Download for Mac…', onClick: openClipioSite },
  ]
}

/* The window's feature list — the README's one-paragraph pitch, split into
   what each part of the app does. */
export const CLIPIO_FEATURES = [
  { title: 'Capture', detail: 'An area, the full screen, a window, a scrolling page — or just the text in it, with OCR.' },
  { title: 'Record',  detail: 'The screen, a window or an area, with auto-zoom, a styled cursor and your camera.' },
  { title: 'Edit',    detail: 'A timeline with annotations, captions and backgrounds.' },
  { title: 'Export',  detail: 'Video or GIF.' },
]

export const CLIPIO_SPECS = [
  ['Version',    CLIPIO_VERSION],
  ['Requires',   'macOS 15 or later'],
  ['Runs on',    'Apple silicon and Intel'],
  ['Built with', 'Swift, SwiftUI + AppKit, Metal, ScreenCaptureKit'],
]
