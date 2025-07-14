/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hdi-bg-primary': '#0f0f1e',
        'hdi-bg-secondary': '#1a1a2e',
        'hdi-grid-lines': '#2a2a3e',
        'hdi-accent-cyan': '#00d4ff',
        'hdi-accent-teal': '#00ff88',
        'hdi-text-primary': '#ffffff',
        'hdi-text-secondary': '#a0a0b0',
      },
      fontFamily: {
        'hdi': ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}