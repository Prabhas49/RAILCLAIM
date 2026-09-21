/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111113',
        muted: '#6B6B7A',
        tertiary: '#9A9AA6',
        line: '#EDEDF0',
        canvas: '#FFFDF8',
        subtle: '#F7F5F0',
        block: '#EFEDE8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Instrument Serif', 'Georgia', 'serif'],
      },
      borderRadius: { card: '20px', pill: '9999px', modal: '24px' },
      boxShadow: {
        soft: '0 1px 3px rgba(17,17,19,0.06), 0 12px 32px -12px rgba(17,17,19,0.12)',
        float: '0 8px 40px -12px rgba(17,17,19,0.18)',
        glow: '0 0 40px rgba(249,115,22,0.15)',
      },
      keyframes: {
        'pulse-ring': { '0%': { transform: 'scale(0.9)', opacity: '0.5' }, '100%': { transform: 'scale(1.5)', opacity: '0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
        shimmer: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite',
        float: 'float 4s ease-in-out infinite',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
