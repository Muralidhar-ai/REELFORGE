/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-elevated": "var(--surface-elevated)",
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
        },
        line: {
          DEFAULT: "var(--line)",
          subtle: "var(--line-subtle)",
          bright: "var(--line-bright)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          2: "var(--accent-2)",
        },
        ok: {
          DEFAULT: "var(--ok)",
          text: "var(--ok-text)",
        },
        warn: {
          DEFAULT: "var(--warn)",
          text: "var(--warn-text)",
        },
        bad: {
          DEFAULT: "var(--bad)",
          text: "var(--bad-text)",
        },
        info: {
          DEFAULT: "var(--info)",
          text: "var(--info-text)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      backgroundImage: {
        "grad-hero": "var(--grad-hero)",
        "grad-btn": "var(--grad-btn)",
        "grad-card": "var(--grad-card)",
      },
      animation: {
        "fade-up": "fadeInUp 0.5s ease both",
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
