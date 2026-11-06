/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "380px",
        xss: "430px",
        smx: "500px",
      },
      colors: {
        cln: {
          red: '#EE3A23',
          'red-dark': '#D43320',
          green: '#4FB748',
          'green-dark': '#3d7d38',
          charcoal: '#151719',
          navy: '#101B2A',
          mist: '#F4F5F6',
          gray: '#6B7280',
        },
      },
      fontFamily: {
        'playwrite-nz': ['"Playwrite NZ"', 'sans-serif'],
        display: ['Manrope', 'Inter', '"Noto Sans Khmer"', 'system-ui', 'sans-serif'],
        body: ['Inter', '"Noto Sans Khmer"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['clamp(3rem, 9vw, 9rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display': ['clamp(2.25rem, 6vw, 6rem)', { lineHeight: '1', letterSpacing: '-0.025em' }],
        'headline': ['clamp(1.75rem, 3.6vw, 3.5rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'lead': ['clamp(1.05rem, 1.4vw, 1.375rem)', { lineHeight: '1.6' }],
      },
      spacing: {
        'section': 'clamp(4rem, 9vw, 9rem)',
        'gutter': 'clamp(1rem, 4vw, 3rem)',
      },
      maxWidth: { 'shell': '1440px' },
      transitionTimingFunction: { 'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)' },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        transit: {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        marquee: 'marquee 60s linear infinite',
        transit: 'transit 1.1s linear infinite',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["light", "dark", "cupcake"],
    darkTheme: "dark",
  },
}