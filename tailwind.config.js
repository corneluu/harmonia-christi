/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f172a", // slate-950 for dark mode feel or deep backing
        primary: "#1e293b", // slate-800
        secondary: "#334155", // slate-700
        accent: "#d97706", // amber-600 (gold-ish)
        paper: "#f8fafc", // slate-50
        "paper-dark": "#1e293b",
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
