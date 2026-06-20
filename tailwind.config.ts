import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFF7E6',
        black: '#111111',
        yellow: '#FFD447',
        blue: '#7CC9FF',
        pink: '#FF8FAB',
        green: '#9BE564',
        orange: '#FFB86B',
        purple: '#B39DDB',
        red: '#FF6B6B',
        'yellow-dark': '#E5B82A',
        'blue-dark': '#5BB8F0',
        'pink-dark': '#F07098',
        'green-dark': '#7BC445',
        'orange-dark': '#F09A4A',
        'purple-dark': '#9A7FCC',
        'red-dark': '#C2261B',
        'cream-light': '#FFFDF5',
        'cream-dark': '#F5EDD8',
        // Arcade Quest cabinet / HUD surfaces
        cabinet: '#1A1726',
        'cabinet-soft': '#241F35',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        hud: ['var(--font-hud)', 'var(--font-display)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Bound typography ladder (base 16, ratio ~1.25)
        display: ['3rem', { lineHeight: '1.05', fontWeight: '800' }],
        'display-sm': ['2.25rem', { lineHeight: '1.1', fontWeight: '800' }],
        heading: ['1.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.25', fontWeight: '700' }],
        'body-lg': ['1.125rem', { lineHeight: '1.5' }],
        body: ['1rem', { lineHeight: '1.5' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        caption: ['0.75rem', { lineHeight: '1.4' }],
      },
      boxShadow: {
        brutal: '4px 4px 0px 0px #111111',
        'brutal-sm': '2px 2px 0px 0px #111111',
        'brutal-lg': '6px 6px 0px 0px #111111',
        'brutal-xl': '8px 8px 0px 0px #111111',
        'brutal-2xl': '10px 10px 0px 0px #111111',
        'brutal-inset': 'inset 3px 3px 0px 0px #111111',
        'brutal-hover': '6px 6px 0px 0px #111111',
      },
      borderWidth: {
        // `3` makes the widely-used `border-3` / `border-b-3` / `border-l-3`
        // utilities resolve to 3px. Tailwind 3.4's default scale is 0/2/4/8,
        // so without this key those classes were silent no-ops and the
        // intended neobrutalist 3px outlines did not render.
        '3': '3px',
        brutal: '3px',
        'brutal-thick': '4px',
      },
      borderRadius: {
        brutal: '12px',
        'brutal-lg': '16px',
        'brutal-xl': '20px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 12s ease-in-out infinite',
        'float-slower': 'float 18s ease-in-out infinite',
        'wiggle': 'wiggle 2s ease-in-out infinite',
        'wiggle-soft': 'wiggle-soft 3s ease-in-out infinite',
        'bounce-sm': 'bounce-sm 1s ease-in-out infinite',
        'pop': 'pop 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'wiggle-soft': {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        'bounce-sm': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '70%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 212, 71, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 212, 71, 0.8)' },
        },
      },
      backgroundImage: {
        'dot-pattern': 'radial-gradient(circle, #111111 1px, transparent 1px)',
        'grid-pattern': 'linear-gradient(#111111 1px, transparent 1px), linear-gradient(90deg, #111111 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

export default config