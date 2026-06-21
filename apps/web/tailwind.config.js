/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#0D0720",
          soft: "#1E1535",
          muted: "#6B7280",
          faint: "#9CA3AF",
        },
        brand: {
          DEFAULT: "#7C3AED",
          light: "#8B5CF6",
          lighter: "#A78BFA",
          dark: "#6D28D9",
          faint: "#F5F3FF",
        },
        blush: "#EC4899",
        canvas: "#F8F7FF",
      },
      screens: {
        xs: "390px",
      },
      animation: {
        "marquee-left": "marquee-left 28s linear infinite",
        "float-a": "float 6s ease-in-out infinite",
        "float-b": "float 8s ease-in-out infinite 1s",
        "float-c": "float 7s ease-in-out infinite 2.5s",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "spin-slow": "spin 22s linear infinite",
        shimmer: "shimmer 2.2s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
      },
      keyframes: {
        "marquee-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "gradient-shift": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-soft": {
          "0%,100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
      },
      boxShadow: {
        card: "0 2px 16px -2px rgba(13,7,32,0.08), 0 1px 4px -1px rgba(13,7,32,0.04)",
        "card-hover": "0 8px 40px -4px rgba(124,58,237,0.18), 0 2px 8px -2px rgba(13,7,32,0.08)",
        "brand-glow": "0 4px 24px rgba(124,58,237,0.35)",
        "brand-glow-lg": "0 8px 48px rgba(124,58,237,0.3), 0 2px 12px rgba(124,58,237,0.2)",
        float: "0 20px 60px -10px rgba(13,7,32,0.2), 0 4px 16px -4px rgba(13,7,32,0.1)",
        "float-brand": "0 20px 60px -10px rgba(124,58,237,0.25), 0 4px 16px -4px rgba(124,58,237,0.15)",
      },
    },
  },
  plugins: [],
};
