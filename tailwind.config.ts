import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/frontend/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F3F1FF',
          100: '#E8E4FF',
          200: '#D4CCFF',
          300: '#B4A7FF',
          400: '#9081E8',
          500: '#6C5FC7',
          600: '#5B4EBA',
          700: '#4A3E9E',
          800: '#3D3483',
          900: '#362D59',
        },
        surface: {
          DEFAULT: '#1B1127',
          50: '#3B2D4F',
          100: '#2B1D38',
          200: '#231530',
          300: '#1B1127',
          400: '#130D1E',
          500: '#0B0915',
        },
        accent: {
          pink: '#E1567C',
          'pink-light': '#F58CA3',
          'pink-dark': '#C2405F',
        },
        sentry: {
          text: '#EBE6EF',
          muted: '#9386A0',
          border: '#3B2D4F',
        },
      },
    },
  },
  plugins: [],
}
export default config
