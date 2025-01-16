// const { iconsPlugin, getIconCollections } = require("@egoist/tailwindcss-icons")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          '50': '#ecf9ff',
          '100': '#d4f1ff',
          '200': '#b2e7ff',
          '300': '#7ddbff',
          '400': '#40c3ff',
          '500': '#14a2ff',
          '600': '#0081ff',
          '700': '#0069ff',
          '800': '#0056d2',
          '900': '#084aa0',
          '950': '#0a2d61',
        }
      }
    }
  },
  plugins: [
  ],
}

