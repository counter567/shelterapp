const {
  scopedPreflightStyles,
  isolateInsideOfContainer,
} = require("tailwindcss-scoped-preflight");

const SCC_BASE = "#root";

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  purge: ["./public/**/*.html", "./src/**/*.{js,jsx,ts,tsx,vue}"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  important: SCC_BASE,
  theme: {
    extend: {
      screens: {
        ml: "1000px",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: isolateInsideOfContainer(SCC_BASE),
    }),
  ],
};
