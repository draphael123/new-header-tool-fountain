import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        fountain: {
          teal: {
            50: '#E6F7F7',
            100: '#CCF0F0',
            200: '#99E0E1',
            300: '#66D1D2',
            400: '#33C2C3',
            500: '#00B5B8',
            600: '#009193',
            700: '#006D6E',
            800: '#00494A',
            900: '#002425',
          },
          pink: {
            50: '#FDE7F3',
            100: '#FBCFE7',
            200: '#F79FCF',
            300: '#F36FB7',
            400: '#EF3F9F',
            500: '#E91E8C',
            600: '#BA1870',
            700: '#8C1254',
            800: '#5D0C38',
            900: '#2F061C',
          },
          navy: '#0A1628',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
