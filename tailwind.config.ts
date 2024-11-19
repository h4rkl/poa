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
        exo: ['Exo 2', 'sans-serif'],
      },
      colors: {
        'dolos': {
          500: '#9FB4A2',
          900: '#3F5743',
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      "synthwave"
    ],
  },
};
export default config;
