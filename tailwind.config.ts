import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B0B",
        graphite: "#272727",
        ivory: "#F5F1E9",
        paper: "#FBF9F4",
        line: "#D9D3C9",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica Neue", "sans-serif"],
        serif: ["Georgia", "Times New Roman", "serif"],
      },
      letterSpacing: {
        brand: "0.22em",
      },
      maxWidth: {
        page: "90rem",
      },
      transitionTimingFunction: {
        quiet: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
