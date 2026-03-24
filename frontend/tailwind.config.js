/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Instrument Serif', 'serif'],
        body: ['Barlow', 'sans-serif'],
      },
      colors: {
        emerald: {
          500: '#10b981',
          400: '#34d399',
          50: '#ecfdf5',
        },
      },
    },
  },
  plugins: [],
}
