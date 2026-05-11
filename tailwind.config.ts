import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        costaatt: {
          navy: "#102A43",
          blue: "#1B6CA8",
          teal: "#0B7285",
          gold: "#F2B705"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(16, 42, 67, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
