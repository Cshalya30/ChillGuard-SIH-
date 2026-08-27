/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shell: '#F0F2F5',
        surface: '#FFFFFF',
        navy: {
          900: '#0D1B2A',
          800: '#14253B',
          700: '#1C314C'
        },
        steel: {
          500: '#1D6FA4',
          600: '#155883'
        },
        status: {
          safe: '#16A34A',
          risk: '#D97706',
          breach: '#DC2626',
          offline: '#6B7280'
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace']
      },
      borderRadius: {
        card: '8px',
        badge: '4px',
        btn: '6px',
        input: '6px',
        map: '8px'
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        elevated: '0 4px 12px rgba(0,0,0,0.10)',
        sidebar: '2px 0 8px rgba(0,0,0,0.12)'
      }
    },
  },
  plugins: [],
};
