import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070b19',
          900: '#0b132b',
          850: '#111b38',
          800: '#1c2541',
          700: '#2a385b',
          600: '#3a4b7c',
        },
        slate: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          100: '#f1f5f9',
          50: '#f8fafc',
        },
        verified: {
          DEFAULT: '#10b981',
          bg: '#064e3b',
          border: '#059669',
        },
        denied: {
          DEFAULT: '#ef4444',
          bg: '#7f1d1d',
          border: '#dc2626',
        },
        forensic: {
          DEFAULT: '#a855f7',
          bg: '#581c87',
          border: '#9333ea',
        },
        warning: {
          DEFAULT: '#f59e0b',
          bg: '#78350f',
          border: '#d97706',
        }
      },
    },
  },
  plugins: [],
};
export default config;
