/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--canvas)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        content: 'var(--content)',
        muted: 'var(--muted)',
        subtle: 'var(--subtle)',
        brand: {
          DEFAULT: 'var(--brand)',
          soft: 'var(--brand-soft)',
          contrast: 'var(--brand-contrast)',
        },
        positive: 'var(--positive)',
        negative: 'var(--negative)',
        warning: 'var(--warning)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)',
        pop: '0 12px 40px -12px rgba(16,24,40,0.28)',
        focus: '0 0 0 3px var(--brand-soft)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in .2s ease-out',
        'scale-in': 'scale-in .18s cubic-bezier(.16,1,.3,1)',
        'slide-up': 'slide-up .35s cubic-bezier(.16,1,.3,1) both',
      },
    },
  },
  plugins: [],
}
