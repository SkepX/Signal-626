import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        signal: {
          cyan: '#00E5FF',
          blue: '#0099FF',
          green: '#00ff9c',
          red: '#FF3355',
          amber: '#FFB300',
          darker: '#060B14',
          panel: '#0D1424',
          muted: '#4a6a8a',
          bright: '#E2E8F0',
        },
      },
      fontFamily: {
        display: ['var(--font-exo2)', 'var(--font-space-grotesk)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
        body: ['var(--font-inter)', 'var(--font-space-grotesk)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
