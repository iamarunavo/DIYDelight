/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0F1117",
        surface: "rgba(255,255,255,0.05)",
        primary: "#6C63FF",
        accent: "#00E0FF",
        success: "#00FFAA",
        error: "#FF4F6D",
        textMain: "#E5E7EB",
        textDim: "#9CA3AF",
      },
      boxShadow: {
        neon: "0 0 8px #00E0FF",
      },
      backdropBlur: {
        md: "10px",
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
}