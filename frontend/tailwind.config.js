/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        space: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        'space-dark': '#0a0c1a',
        'space-mid': '#1a1e3a',
        'space-light': '#2a2e5a',
        'astral-blue': '#00ccff',
        'astral-purple': '#cc00ff',
        'astral-gold': '#ffd700',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-cosmic': 'linear-gradient(to bottom, #0a0c1a, #1a1e3a, #2a2e5a)',
      },
      boxShadow: {
        'neon': '0 0 5px theme("colors.astral-blue"), 0 0 20px theme("colors.astral-purple")',
      },
    },
  },
  plugins: [],
}