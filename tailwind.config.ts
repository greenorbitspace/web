import plugin from 'tailwindcss/plugin';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f3f4', 100: '#c0dcde', 200: '#94c1c4', 300: '#679ea0',
          400: '#3e7a7c', 500: '#0c4d53', 600: '#0a4249', 700: '#08353a',
          800: '#06292f', 900: '#041f25', 950: '#021116',
        },
        secondary: {
          50: '#e3f2f4', 100: '#b9dde3', 200: '#8dc4d0', 300: '#5ea9bb',
          400: '#358ea4', 500: '#127780', 600: '#106b6f', 700: '#0c575a',
          800: '#094646', 900: '#073836', 950: '#031d1b',
        },
        accent: {
          50: '#e5faf1', 100: '#bdf3db', 200: '#8aeebf', 300: '#54e5a0',
          400: '#2bdc88', 500: '#0fc083', 600: '#0ca973', 700: '#088454',
          800: '#066b3e', 900: '#044f2e', 950: '#022816',
        },
        warning: {
          50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047',
          400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207',
          800: '#854d0e', 900: '#713f12', 950: '#422006',
        },
        gray: { 200: '#e5e7eb' },
      },
      borderRadius: { lg: '0.75rem' },
      boxShadow: { primary: '0 4px 6px rgba(15, 192, 131, 0.35)' },
      fontFamily: {
        sans: [
          'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont',
          '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif',
          '"Apple Color Emoji"', '"Segoe UI Emoji"',
        ],
        display: ['Lexend', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        pulseSlow: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out forwards',
        'slide-up': 'slideUp 0.5s ease-in-out forwards',
        'slide-down': 'slideDown 0.5s ease-in-out forwards',
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 2s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
        'marquee-pause': 'marquee 30s linear infinite paused',
      },
      transitionTimingFunction: { standard: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      rotate: { 'y-180': 'rotateY(180deg)' },
      transformOrigin: { center: '50% 50%' },
      perspective: { 1000: '1000px', 1500: '1500px' },
      transformStyle: { 'preserve-3d': 'preserve-3d' },
      backfaceVisibility: { hidden: 'hidden', visible: 'visible' },
    },
  },
  variants: {
    extend: {
      rotate: ['group-hover', 'group-focus', 'hover', 'focus'],
      transform: ['group-hover', 'group-focus', 'hover', 'focus'],
      perspective: ['responsive'],
      transformStyle: ['responsive'],
      backfaceVisibility: ['responsive'],
      opacity: ['disabled'],
      animation: ['hover'], // enable hover variant for pausing marquee
    },
  },
  plugins: [
    plugin(({ addUtilities, e, theme }) => {
      const perspectiveUtilities = Object.entries(theme('perspective')).map(([key, value]) => ({
        [`.perspective-${e(key)}`]: { perspective: value },
      }));
      const transformStyleUtilities = Object.entries(theme('transformStyle')).map(([key, value]) => ({
        [`.transform-style-${e(key)}`]: { 'transform-style': value },
      }));
      const backfaceVisibilityUtilities = Object.entries(theme('backfaceVisibility')).map(([key, value]) => ({
        [`.backface-${e(key)}`]: { 'backface-visibility': value },
      }));
      addUtilities([...perspectiveUtilities, ...transformStyleUtilities, ...backfaceVisibilityUtilities]);

      // Pause marquee on hover utility
      addUtilities({
        '.hover\\:pause-marquee:hover': { 'animation-play-state': 'paused' },
      });
    }),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animate'),
  ],
};