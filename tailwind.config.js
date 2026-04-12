/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: '#CF0506',
        headline: '#F3F0E5',
        body: '#ABA795',
        'bg-primary': '#080808',
        'window-bg': '#111111',
        'window-bg-2': '#161616',
        'window-border': 'rgba(255,255,255,0.08)',
        'dock-bg': 'rgba(28,28,28,0.9)',
      },
      fontFamily: {
        display: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['SF Pro Text', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['SF Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        window: '12px',
        dock: '28px',
      },
      boxShadow: {
        window: 'none',
        dock: 'none',
      },
      backdropBlur: {
        dock: '20px',
      },
    },
  },
  plugins: [],
}
