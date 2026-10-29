/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#202B3C',
          light: '#2C3A50',
          dark: '#161D29',
          900: '#111722',
        },
        sand: {
          DEFAULT: '#F3EBDD',
          light: '#FAF6EE',
          dark: '#E5D8C3',
          border: '#DDD0BA',
        },
        terracotta: {
          DEFAULT: '#C77962',
          light: '#D9917D',
          dark: '#A85C47',
          bg: '#FBF0EC',
        },
        dusty: {
          DEFAULT: '#8196AB',
          light: '#A1B2C3',
          dark: '#62768B',
          bg: '#EEF3F8',
        },
        charcoal: {
          DEFAULT: '#42464D',
          light: '#5B6069',
          dark: '#2E3136',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(32, 43, 60, 0.08), 0 2px 6px -1px rgba(32, 43, 60, 0.04)',
        'elevated': '0 12px 30px -4px rgba(32, 43, 60, 0.12), 0 4px 12px -2px rgba(32, 43, 60, 0.06)',
      }
    },
  },
  plugins: [],
}
