/* ── SF Symbols ──────────────────────────────────────────────────────────────
   The glyphs in src/assets/icons/sf/ were rendered off macOS itself
   (NSImage(systemSymbolName:) at 48pt regular, black on transparent), so they
   are the system's own drawings rather than a lookalike icon set. Each one is
   used as a mask and filled with `currentColor`, which lets a glyph take the
   accent, a secondary label grey, or white on a selected row exactly the way
   a template image does in AppKit.                                         */

const FILES = import.meta.glob('@/assets/icons/sf/*.png', { eager: true, query: '?url', import: 'default' })

const SYMBOLS = Object.fromEntries(
  Object.entries(FILES).map(([path, url]) => [path.split('/').pop().replace(/\.png$/, ''), url]),
)

export default function SFSymbol({ name, size = 14, style, className }) {
  const url = SYMBOLS[name]
  if (!url) return null
  return (
    <span
      aria-hidden
      className={className}
      style={{
        display: 'inline-block',
        flexShrink: 0,
        width: size,
        height: size,
        backgroundColor: 'currentColor',
        WebkitMask: `url("${url}") center / contain no-repeat`,
        mask: `url("${url}") center / contain no-repeat`,
        ...style,
      }}
    />
  )
}
