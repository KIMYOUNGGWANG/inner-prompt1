/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          light: '#E0F7FF',
          DEFAULT: '#00A3E0',
          dark: '#0077B6',
        },
        sand: {
          light: '#F5F5F5',
          DEFAULT: '#E6E6E6',
          dark: '#D4D4D4',
        },
        sunset: {
          light: '#FFB7B2',
          DEFAULT: '#FF6B6B',
          dark: '#FF4B4B',
        },
        wave: {
          light: '#A2D2B5',
          DEFAULT: '#2A9D8F',
          dark: '#1A7D6F',
        },
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'dm-sans': ['DM Sans', 'sans-serif'],
      },
      backgroundImage: {
        'wave-pattern': "url('/images/wave-pattern.svg')",
        'ocean-gradient': 'linear-gradient(135deg, #E0F7FF 0%, #00A3E0 100%)',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
} 