/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./js/**/*.js",
  ],
  theme: {
    extend: {
      screens: {
        'sm': { 'max': '500px' },
        'md': { 'max': '768px' },
        'lg': { 'max': '1024px' },
      },
    },
  },
  plugins: [],
}