/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.html",           // <--- ESTO ES CLAVE: Mira todos los html en la carpeta raíz
    "./src/**/*.{js,ts}", // Mira dentro de src si hubiera algo
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Nunito Sans"', 'sans-serif'],
      },
      colors: {
        // Aquí definimos tus colores de marca
        brand: {
          red: '#BE1825',
          dark: '#050505',
          gray: '#1A1A1A',
          light: '#F5F5F7'
        }
      },
      animation: {
        'blob': 'blob 10s infinite',
        'scroll-left': 'scrollLeft 30s linear infinite',
        'scroll-right': 'scrollRight 30s linear infinite',
        'scroll-up': 'scrollUp 40s linear infinite',
        'scroll-down': 'scrollDown 40s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        scrollLeft: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        scrollRight: { '0%': { transform: 'translateX(-50%)' }, '100%': { transform: 'translateX(0)' } },
        scrollUp: { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(-50%)' } },
        scrollDown: { '0%': { transform: 'translateY(-50%)' }, '100%': { transform: 'translateY(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-20px)' } },
      }
    },
  },
  plugins: [],
}