/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#bae0ff',
          300: '#7cc2ff',
          400: '#369eff',
          500: '#097eff',
          600: '#0062e6',
          700: '#004ec2',
          800: '#03409e',
          900: '#09377d',
          950: '#072352',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
