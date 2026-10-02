/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          bg: '#081522',
          brand: '#0D1E30',
          surface: '#0D1E30',
          elevated: '#12283D',
          hover: '#18344D',
          active: '#21435F',
          border: '#21435F',
          'border-subtle': '#18344D',
          'border-hover': '#2D526F',
        },
        brand: {
          DEFAULT: '#4DA3FF',
          light: '#70B7FF',
          dark: '#2688E8',
          glow: 'rgba(77, 163, 255, 0.15)',
        },
        txt: {
          primary: '#F4F6F8',
          secondary: '#CACFD5',
          muted: '#8C98A5',
          disabled: '#566473',
        },
        pos: {
          DEFAULT: '#22C55E',
          dark: '#16A34A',
          light: '#86EFAC',
          bg: '#0B2A20',
          glow: 'rgba(34, 197, 94, 0.12)',
        },
        neg: {
          DEFAULT: '#EF4444',
          dark: '#DC2626',
          light: '#FCA5A5',
          bg: '#301619',
          glow: 'rgba(239, 68, 68, 0.12)',
        },
        neutral: {
          400: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'JetBrains Mono', 'monospace'],
        num: ['"JetBrains Mono"', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'brand-glow': '0 0 20px -2px rgba(77, 163, 255, 0.20)',
        'pos-glow': '0 0 16px -2px rgba(34, 197, 94, 0.16)',
        'card-subtle': '0 4px 20px 0 rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
}
