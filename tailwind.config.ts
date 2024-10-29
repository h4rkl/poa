import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#14F195', // Solana's signature green
          50: '#E6FEF7',
          100: '#CCFDEF',
          200: '#99FBDF',
          300: '#66F9CF',
          400: '#33F7BF',
          500: '#14F195', // Main brand color
          600: '#03D67D',
          700: '#02A05E',
          800: '#016B3F',
          900: '#01351F',
        },
        secondary: {
          DEFAULT: '#00C2FF', // A vibrant blue
          50: '#E6F8FF',
          100: '#CCF1FF',
          200: '#99E3FF',
          300: '#66D5FF',
          400: '#33C7FF',
          500: '#00C2FF', // Secondary brand color
          600: '#009AD4',
          700: '#0073A0',
          800: '#004D6B',
          900: '#002635',
        },
        accent: {
          DEFAULT: '#9945FF', // A purple accent
          50: '#F5EBFF',
          100: '#EAD6FF',
          200: '#D5ADFF',
          300: '#C085FF',
          400: '#AB5CFF',
          500: '#9945FF', // Accent color
          600: '#7C00FF',
          700: '#6000C2',
          800: '#400082',
          900: '#200041',
        },
        neutral: {
          DEFAULT: '#1E1E1E', // Dark background
          50: '#F2F2F2',
          100: '#E6E6E6',
          200: '#CCCCCC',
          300: '#B3B3B3',
          400: '#999999',
          500: '#808080',
          600: '#666666',
          700: '#4D4D4D',
          800: '#333333',
          900: '#1E1E1E', // Main dark color
        },
      },
    },
  },
  plugins: [require('daisyui')],
};
export default config;
