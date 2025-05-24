/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          dark: '#0a0c1a',
          mid: '#1a1e3a',
          light: '#2a2e5a',
        },
        astral: {
          blue: '#00ccff',
          purple: '#cc00ff',
          gold: '#ffd700',
        }
      },
      fontFamily: {
        space: ['"Space Grotesk"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { filter: 'drop-shadow(0 0 2px #00ccff)' },
          '100%': { filter: 'drop-shadow(0 0 10px #00ccff) drop-shadow(0 0 15px #cc00ff)' },
        },
      },
      backgroundImage: {
        'stars': "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTAwIDI1MDAiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxjaXJjbGUgcj0iMSIgY3g9IjM2NSIgY3k9IjIwMyIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iMC40Ii8+PGNpcmNsZSByPSIxLjUiIGN4PSI1NjUiIGN5PSI1MDMiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuNSIvPjxjaXJjbGUgcj0iMSIgY3g9IjM2NSIgY3k9IjgwMyIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iMC41Ii8+PGNpcmNsZSByPSIxLjUiIGN4PSIxNTAwIiBjeT0iMzAzIiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjYiLz48Y2lyY2xlIHI9IjIiIGN4PSIyMTAwIiBjeT0iODUzIiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjYiLz48Y2lyY2xlIHI9IjEuMiIgY3g9IjEyMDAiIGN5PSIxMjAzIiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjQiLz48Y2lyY2xlIHI9IjEiIGN4PSI5NjUiIGN5PSIxNTAzIiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjQiLz48Y2lyY2xlIHI9IjEuNSIgY3g9IjE1NjUiIGN5PSIxODAzIiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjUiLz48Y2lyY2xlIHI9IjIiIGN4PSIyMTAwIiBjeT0iMTQwMyIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iMC42Ii8+PGNpcmNsZSByPSIxIiBjeD0iNjY1IiBjeT0iMTgwMyIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iMC40Ii8+PGNpcmNsZSByPSIxLjUiIGN4PSIyMTY1IiBjeT0iMjAwMyIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iMC41Ii8+PGNpcmNsZSByPSIxIiBjeD0iMzY1IiBjeT0iMjMwMyIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iMC40Ii8+PC9zdmc+Ig==')",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};