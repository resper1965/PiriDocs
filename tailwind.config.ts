import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#FAFAF9',
        foreground: '#171717',
        muted: '#A3A3A3',
        accent: '#4C6A4F',
        border: '#E5E5E5',
      },
    },
  },
  plugins: [],
}
export default config
