import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        onair: {
          bg: "var(--bg)",
          surface: "var(--surface)",
          card: "var(--card)",
          border: "var(--border)",
          red: "var(--red)",
          cyan: "var(--cyan)",
          green: "var(--green)",
          amber: "var(--amber)",
          purple: "var(--purple)",
          pink: "var(--pink)",
          text: "var(--text)",
          muted: "var(--muted)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.5s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px color-mix(in srgb, var(--red) 30%, transparent), 0 0 20px color-mix(in srgb, var(--red) 10%, transparent)" },
          "100%": { boxShadow: "0 0 10px color-mix(in srgb, var(--red) 50%, transparent), 0 0 40px color-mix(in srgb, var(--red) 20%, transparent)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "onair-gradient": "linear-gradient(135deg, var(--red), var(--purple), var(--cyan))",
      },
    },
  },
  plugins: [],
} satisfies Config;
