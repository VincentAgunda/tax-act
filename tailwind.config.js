/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dodger: "#3E82F1",
        white: "#FFFFFF",
        gainsboro: "#DDDDDD",
        "dark-gray": "#AAAAAA",
      },
    },
  },
  plugins: [],
};
