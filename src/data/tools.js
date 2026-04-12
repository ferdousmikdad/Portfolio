import colorContrastUrl   from '@/assets/icons/color-contrast.svg?url'
import colorPaletteUrl    from '@/assets/icons/color-palette.svg?url'
import retroDotUrl        from '@/assets/icons/retro-dot.svg?url'
import asciiArtUrl        from '@/assets/icons/ascii-art.svg?url'
import imageTraceUrl      from '@/assets/icons/image-trace.svg?url'
import qrCodeUrl          from '@/assets/icons/qrcode.svg?url'
import imageConverterUrl  from '@/assets/icons/image-converter.svg?url'
import printSetupUrl      from '@/assets/icons/print-setup.svg?url'
import imageTextUrl       from '@/assets/icons/image-text.svg?url'
import typingToolUrl      from '@/assets/icons/typing-tool.svg?url'

const TOOLS = [
  {
    id:   'color-contrast',
    name: 'Color Contrast',
    icon: colorContrastUrl,
    url:  '/tools/color-contrast-checker.html',
  },
  {
    id:   'color-palette',
    name: 'Color Palette',
    icon: colorPaletteUrl,
    url:  '/tools/color-palette-generator.html',
  },
  {
    id:   'retro-dot',
    name: 'Retro Dot Effect',
    icon: retroDotUrl,
    url:  '/tools/retro-dot-effect.html',
  },
  {
    id:   'ascii-art',
    name: 'ASCII Art',
    icon: asciiArtUrl,
    url:  '/tools/ascii-art.html',
  },
  {
    id:   'image-trace',
    name: 'Trace Image',
    icon: imageTraceUrl,
    url:  '/tools/svg-converter.html',
  },
  {
    id:   'qr-code',
    name: 'QR Code',
    icon: qrCodeUrl,
    url:  '/tools/qr-code.html',
  },
  {
    id:   'image-converter',
    name: 'Image Converter',
    icon: imageConverterUrl,
    url:  '/tools/image-converter.html',
  },
  {
    id:   'print-setup',
    name: 'Print Setup',
    icon: printSetupUrl,
    url:  '/tools/print-setup.html',
  },
  {
    id:   'image-text',
    name: 'Image to Text',
    icon: imageTextUrl,
    url:  '/tools/image-to-text.html',
  },
  {
    id:   'typing-tool',
    name: 'Typing Practice',
    icon: typingToolUrl,
    url:  '/tools/typing-practice.html',
  },
]

export default TOOLS
