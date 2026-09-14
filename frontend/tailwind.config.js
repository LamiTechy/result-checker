/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#1e3a5f', 600: '#162d4a', 700: '#0f1f36', 800: '#081221', 900: '#040a15' },
        academic: { 50: '#f0f5f0', 100: '#d9e6d9', 200: '#b3ccb3', 300: '#80b380', 400: '#4d994d', 500: '#1a5c1a', 600: '#134913', 700: '#0d360d', 800: '#082408', 900: '#041204' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
