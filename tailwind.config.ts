import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f7fde8',
          100: '#edfbc5',
          200: '#daf78e',
          300: '#c9f05d',
          400: '#BFF549',
          500: '#a0d620',
          600: '#7aaa12',
          700: '#5c820d',
          800: '#476509',
          900: '#3a5108',
        },
        surface: {
          DEFAULT: '#0A0A0A',
          card:    '#141414',
          raised:  '#1E1E1E',
          border:  '#2A2A2A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter Display', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
