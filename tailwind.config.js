/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          light: '#60a5fa',
        },
        accent: {
          DEFAULT: '#f43f5e',
          light: '#fb7185',
        },
      },
    },
  },
  plugins: [],
};
