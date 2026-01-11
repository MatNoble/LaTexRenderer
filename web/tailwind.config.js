/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          blue: '#007AFF',
          gray: {
            50: '#F5F5F7',
            100: '#E8E8ED',
            200: '#D2D2D7',
            300: '#86868B',
            900: '#1D1D1F',
          },
          system: {
            background: '#FFFFFF',
            grouped: '#F5F5F7',
          }
        }
      },
      borderRadius: {
        'apple': '12px',
        'apple-lg': '20px',
      },
      boxShadow: {
        'apple-sm': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'apple-md': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'apple-lg': '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
      fontFamily: {
        sans: [
          'SF Pro Display', 
          'SF Pro Icons', 
          'Helvetica Neue', 
          'Helvetica', 
          'Arial', 
          'sans-serif'
        ],
      }
    },
  },
  plugins: [],
}