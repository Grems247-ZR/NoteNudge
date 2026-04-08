/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#0f0f0f',
        surface: '#1a1a1a',
        'surface-raised': '#222222',
        'surface-hover': '#252525',
        accent: '#f5a623',
        'accent-muted': 'rgba(245,166,35,0.12)',
        'text-primary': '#e5e5e5',
        'text-muted': '#888888',
        'text-faint': '#555555',
        border: 'rgba(255,255,255,0.07)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'PingFang SC', 'Hiragino Sans GB', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
