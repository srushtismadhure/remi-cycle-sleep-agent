import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#24233A",
        plum: "#695B89",
        lilac: "#A793C8",
        blush: "#EFCACF",
        sage: "#9DB8A5",
        cream: "#FDF8F8",
      },
      boxShadow: {
        soft: "0 24px 70px rgba(79, 64, 105, 0.11)",
        card: "0 14px 40px rgba(62, 48, 82, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
