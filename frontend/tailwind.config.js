/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saas: {
          50: '#f5f3ff',
          900: '#4c1d95',
          950: '#2e1065',
        }
      }
    },
  },
  plugins: [],
}