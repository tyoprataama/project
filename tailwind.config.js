/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Tema admin (hijau) — dipertahankan
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        // Tema client (biru Tulus) — putih, biru dalam, sedikit hijau
        tulus: {
          50: "#eef3fb",
          100: "#d6e3f4",
          200: "#aec6e8",
          300: "#7ea4d6",
          400: "#5181c0",
          500: "#3263a6",
          600: "#214e8a",
          700: "#1a3d6e",
          800: "#142f54",
          900: "#102342",
          950: "#0a1830",
        },
        ink: {
          DEFAULT: "#0c111b",
          soft: "#1b2433",
          muted: "#5b6675",
        },
        leaf: {
          50: "#edfaf3",
          100: "#d1f2e0",
          400: "#34b27b",
          500: "#1aa46a",
          600: "#138a58",
          700: "#0f6f47",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "Cambria", "serif"],
      },
      maxWidth: {
        content: "72rem",
      },
      keyframes: {
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(14px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};
