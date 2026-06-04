/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        app: '#050816',
        panel: '#0F172A',
        panel2: '#111827',
        blue1: '#2563EB',
        blue2: '#0D6EFD',
      }
    },
  },
  plugins: [],
}