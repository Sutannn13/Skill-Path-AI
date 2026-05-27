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
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        brutal: '4px 4px 0px 0px #111111',
        'brutal-sm': '2px 2px 0px 0px #111111',
        'brutal-lg': '6px 6px 0px 0px #111111',
      },
      borderWidth: {
        brutal: '3px',
      },
      borderRadius: {
        brutal: '12px',
      },
    },
  },
  plugins: [],
}

export default config