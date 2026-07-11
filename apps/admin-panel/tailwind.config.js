/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#004E89',
          light: '#2A6497',
          dark: '#003A66',
        },
        secondary: {
          DEFAULT: '#FF6B35',
          light: '#FF8A5B',
          dark: '#E55A2B',
        },
        accent: '#2EC4B6',
      },
    },
  },
  plugins: [],
};
