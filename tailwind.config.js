/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        // Reserved for the one element that should feel physical: the claim document.
        paper: '0 1px 2px rgb(15 23 42 / 0.04), 0 12px 28px -16px rgb(15 23 42 / 0.18)',
        mic: '0 8px 24px -10px rgb(79 70 229 / 0.55)',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.92)', opacity: '0.6' },
          '70%': { transform: 'scale(1.45)', opacity: '0' },
          '100%': { transform: 'scale(1.45)', opacity: '0' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.9s cubic-bezier(0.24, 0, 0.38, 1) infinite',
      },
    },
  },
  plugins: [],
}
