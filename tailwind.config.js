/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "380px",  // ≥380px
        xss: "430px", // ≥430px
        smx: "500px", // ≥500px
      },
      fontFamily: {
        'playwrite-nz': ['"Playwrite NZ"', 'sans-serif'],
      },     
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        marquee: 'marquee 60s linear infinite',
      }, 
    },
  },
  plugins: [],
}
