import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          base: 'rgba(255,255,255,0.6)',
          dark: 'rgba(0,0,0,0.2)'
        },
        hb: {
          blue: '#0EA5E9',
          navy: '#0B1220',
          sky: '#38BDF8',
          slate: '#94A3B8',
          primary: '#0d9488'
        },
        /* Override Tailwind's teal palette to steer the app toward a light-green theme */
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e54',
          900: '#134339'
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 10px 30px -10px rgba(0,0,0,0.25)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem'
      }
    },
  },
  plugins: [],
}

export default config
