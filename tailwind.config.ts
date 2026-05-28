import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dog-vision palette: dogs are red-green colourblind and see blue + yellow best.
        brand: {
          DEFAULT: '#2D6CDF',
          50: '#EFF4FE',
          100: '#D8E4FB',
          500: '#2D6CDF',
          600: '#1F58C0',
          700: '#17448F',
        },
        accent: {
          DEFAULT: '#F2B705',
          400: '#FFC83D',
          500: '#F2B705',
          600: '#D99E00',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
