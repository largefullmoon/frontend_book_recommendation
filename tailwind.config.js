/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // JustBookify brand colors (assumed for the example)
        'brand': {
          'primary': '#4F46E5', // indigo-600
          'secondary': '#EC4899', // pink-500
          'accent': '#FB923C', // orange-400
          'light': '#EEF2FF', // indigo-50
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};