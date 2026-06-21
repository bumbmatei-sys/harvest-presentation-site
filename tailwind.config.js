/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F5',
        'warm-dark': '#1A1612',
        earth: '#2D2519',
        gold: {
          DEFAULT: '#C9963A',
          light: '#D4A94F',
          dark: '#B5862F',
        },
        'warm-brown': '#8B7355',
        'light-gold': '#F5EDE0',
        stone: '#E8E2D9',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'stat': ['clamp(4rem, 12vw, 8rem)', { lineHeight: '0.9', letterSpacing: '-0.04em' }],
      },
    },
  },
  plugins: [],
};
