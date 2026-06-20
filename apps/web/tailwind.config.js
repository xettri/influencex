/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f0ff",
          100: "#e4e4ff",
          200: "#cdcbff",
          300: "#aba8ff",
          400: "#867bff",
          500: "#6b4dff",
          600: "#5c2df7",
          700: "#4e1de3",
          800: "#4118bf",
          900: "#36169c",
          950: "#1e0b6b",
        },
        violet: {
          950: "#1a0533",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Cal Sans", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(107,77,255,0.3), transparent)",
      },
      animation: {
        "float-slow": "float 8s ease-in-out infinite",
        "float-medium": "float 6s ease-in-out infinite 1s",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "gradient-x": "gradient-x 8s ease infinite",
        "spin-slow": "spin 20s linear infinite",
        "border-beam": "border-beam 6s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        "gradient-x": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        "border-beam": {
          "0%": { "offset-distance": "0%" },
          "100%": { "offset-distance": "100%" },
        },
      },
    },
  },
  plugins: [],
};
