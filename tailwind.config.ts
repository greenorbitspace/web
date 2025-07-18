/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Use 'dark' class strategy for toggling dark mode
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}',
    './public/**/*.html',
    './pages/**/*.astro', // Fixed extra comma here
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f3f4',
          100: '#c0dcde',
          200: '#94c1c4',
          300: '#679ea0',
          400: '#3e7a7c',
          500: '#0c4d53',
          600: '#0a4249',
          700: '#08353a',
          800: '#06292f',
          900: '#041f25',
          950: '#021116',
        },
        secondary: {
          50: '#e3f2f4',
          100: '#b9dde3',
          200: '#8dc4d0',
          300: '#5ea9bb',
          400: '#358ea4',
          500: '#127780',
          600: '#106b6f',
          700: '#0c575a',
          800: '#094646',
          900: '#073836',
          950: '#031d1b',
        },
        accent: {
          50: '#e5faf1',
          100: '#bdf3db',
          200: '#8aeebf',
          300: '#54e5a0',
          400: '#2bdc88',
          500: '#0fc083',
          600: '#0ca973',
          700: '#088454',
          800: '#066b3e',
          900: '#044f2e',
          950: '#022816',
        },
        warning: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Lexend', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
        'slide-down': 'slideDown 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};