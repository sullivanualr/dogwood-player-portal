import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        dogwood: {
          green: "#1D392B",
          leaf: "#567A45",
          cream: "#EAE5D0",
          ink: "#18231D",
          linen: "#F8F5EA",
          brass: "#B08A43"
        }
      },
      opacity: {
        8: "0.08",
        12: "0.12",
        45: "0.45",
        55: "0.55",
        58: "0.58",
        62: "0.62",
        65: "0.65",
        72: "0.72",
        78: "0.78",
        92: "0.92"
      }
    }
  },
  plugins: []
};

export default config;
