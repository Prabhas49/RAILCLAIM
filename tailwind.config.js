/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        muted: '#737373',
        subtle: '#A3A3A3',
        line: '#E5E5E5',
        canvas: '#FFFFFF',
        surface: '#FAFAFA',
        panel: '#F5F5F5',
        accent: {
          blue: '#2563EB',
          emerald: '#16A34A',
          amber: '#D97706',
          rose: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        hover: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        elevation: '0 20px 40px -15px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
