/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#070707',
        'red-custom': '#CF0506',
        'title-color': '#F3F0E5',
        'text-color': '#B0AA95',
        'border-color': '#2D2C28',
      },
      backgroundColor: {
        'dark': '#070707',
      },
      textColor: {
        'red-custom': '#CF0506',
        'title-custom': '#F3F0E5',
        'text-custom': '#B0AA95',
      },
      borderColor: {
        'custom': '#2D2C28',
      }
    },
  },
  plugins: [],
}