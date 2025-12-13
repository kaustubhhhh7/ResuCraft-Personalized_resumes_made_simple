/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        accent: '#f97316',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      letterSpacing: {
        'extra-wide': '0.15em',
      },
    },
  },
  plugins: [],
}

