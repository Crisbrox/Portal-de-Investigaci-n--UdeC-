/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta institucional UdeC
        udec: {
          950: '#002E1B',
          900: '#00482B', // verde institucional oscuro (barras, headers, botones)
          800: '#005A35',
          700: '#007A3D', // verde institucional medio
          600: '#008F47',
          500: '#43A047', // esmeralda (hover, iconos, estados activos)
          400: '#66BB6A',
          100: '#E3F2E8',
          50: '#F0F9F3',
        },
        oro: {
          600: '#B8962E',
          500: '#D4AF37', // dorado institucional
          400: '#E5C558',
          100: '#FBF3DC',
        },
        ambar: {
          500: '#F59E0B', // ámbar (badge Parcial, acentos)
        },
        fondo: '#F5F7F6',
        borde: '#E2E8F0',
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'Segoe UI', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      boxShadow: {
        tarjeta: '0 1px 2px rgba(15,23,20,0.05)',
        'tarjeta-hover': '0 4px 12px rgba(15,23,20,0.08)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(.94) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'slide-drawer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        flotar: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(40px, -30px) scale(1.12)' },
          '66%': { transform: 'translate(-30px, 25px) scale(.92)' },
        },
        'gradiente-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        brillo: {
          '0%': { transform: 'translateX(-120%) skewX(-20deg)' },
          '100%': { transform: 'translateX(220%) skewX(-20deg)' },
        },
        marquesina: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'pulso-anillo': {
          '0%': { transform: 'scale(.8)', opacity: '.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in .35s ease-out',
        'slide-in': 'slide-in .3s ease-out',
        'fade-up': 'fade-up .45s cubic-bezier(.22,1,.36,1) both',
        'scale-in': 'scale-in .35s cubic-bezier(.22,1,.36,1) both',
        'slide-drawer': 'slide-drawer .32s cubic-bezier(.22,1,.36,1) both',
        flotar: 'flotar 6s ease-in-out infinite',
        blob: 'blob 14s ease-in-out infinite',
        'gradiente-x': 'gradiente-x 10s ease infinite',
        brillo: 'brillo 1.1s ease-in-out',
        marquesina: 'marquesina 28s linear infinite',
        shimmer: 'shimmer 1.4s linear infinite',
        'pulso-anillo': 'pulso-anillo 1.8s cubic-bezier(0,0,.2,1) infinite',
      },
    },
  },
  plugins: [],
};
