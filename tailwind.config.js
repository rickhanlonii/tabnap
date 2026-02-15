/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.js"],
  theme: {
    extend: {
      colors: {
        chrome: {
          50: "#F8F9FA",
          100: "#F1F3F4",
          200: "#E8EAED",
          300: "#DADCE0",
          400: "#BDC1C6",
          500: "#9AA0A6",
          600: "#80868B",
          700: "#5F6368",
          800: "#3C4043",
          900: "#202124",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          dark: "var(--accent-dark)",
          light: "var(--accent-light)",
          focus: "var(--accent-focus)",
          darkbg: "var(--accent-darkbg)",
        },
      },
    },
  },
  plugins: [],
};
