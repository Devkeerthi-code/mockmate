/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', '"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        hand: ['Caveat', 'cursive'],
      },
      colors: {
        obsidian: {
          950: '#070A0F',
          900: '#0B0E14',
          850: '#10151E',
          800: '#121721',
          750: '#161C27',
          700: '#1E293B',
          600: '#263143',
          500: '#334155',
          400: '#475569',
          300: '#64748B',
          200: '#94A3B8',
          100: '#CBD5E1',
          50: '#F8FAFC',
        },
        brand: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
      },
      boxShadow: {
        'glow-brand': '0 0 25px -5px rgba(245, 158, 11, 0.25)',
        'glow-sky': '0 0 25px -5px rgba(56, 189, 248, 0.25)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'tactile': '0 5px 0 #92400E',
        'tactile-pressed': '0 1px 0 #92400E',
        'tactile-dark': '0 5px 0 #1E293B',
      },
      animation: {
        'ticker': 'ticker 28s linear infinite',
        'ticker-reverse': 'tickerReverse 32s linear infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        tickerReverse: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
      },
    },
  },
  plugins: [],
}
