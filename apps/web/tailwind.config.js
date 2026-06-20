/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        zinc: {
          950: "#09090b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      backgroundOpacity: {
        4: "0.04",
        7: "0.07",
        14: "0.14",
      },
      animation: {
        "fade-up": "fade-up 0.5s ease both",
        "fade-in": "fade-in 0.4s ease both",
        "float-a": "float 7s ease-in-out infinite",
        "float-b": "float 9s ease-in-out infinite 1.5s",
        "float-c": "float 8s ease-in-out infinite 3s",
        shimmer: "shimmer 2.5s linear infinite",
        "spin-slow": "spin 18s linear infinite",
        pulse: "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: 0, transform: "translateY(16px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
