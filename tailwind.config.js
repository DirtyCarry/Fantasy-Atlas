/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cinzel"', 'serif', 'system-ui'],
        sans: ['"Inter"', 'sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}