/**
 * components/Layouts.jsx
 * - PublicLayout: navbar pública + footer institucional
 * - PanelLayout: sidebar + workspace autenticado
 */
import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Menu, Plus } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { BarraProgreso, EASE } from './motion';
import { irArriba } from './efectos';

const SEDES = ['Fusagasugá', 'Chía', 'Facatativá', 'Girardot', 'Soacha', 'Ubaté', 'Zipaquirá'];

const SELLOS = [
  { src: '/img/acreditacion-alta-calidad.png', alt: 'Acreditación Institucional de Alta Calidad - Universidad de Cundinamarca', texto: 'Acreditación Institucional de Alta Calidad' },
  { src: '/img/centenario-roque.png', alt: 'Cien años Tecnológico de Roque 1926-2026', texto: '100 años Tecnológico de Roque · 1926-2026' },
];

const EQUIPO = ['Cristhian Mateo Ramirez', 'Vanessa Yañez Mejia', 'Gabriela Sarai Garcia Serrano'];

const iniciales = (nombre) =>
  nombre
    .split(' ')
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0])
    .join('');

function Footer() {
  return (
    <footer className="mt-auto">
      {/* Sellos institucionales y equipo de desarrollo (franja clara: las imágenes tienen fondo blanco) */}
      <div className="border-t-4 border-oro-500 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-4 py-8 lg:px-6">
          <div className="flex flex-wrap items-center gap-8">
            {SELLOS.map((s, i) => (
              <motion.figure
                key={s.src}
                initial={{ opacity: 0, y: 16, rotate: -6 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: EASE }}
                whileHover={{ scale: 1.06, rotate: i ? 3 : -3 }}
                className="flex items-center gap-3"
              >
                <img src={s.src} alt={s.alt} loading="lazy" className="h-24 w-24 object-contain" />
                <figcaption className="max-w-[11rem] text-sm font-semibold leading-snug text-udec-900">{s.texto}</figcaption>
              </motion.figure>
            ))}
          </div>

          <div>
            <p className="antetitulo">Desarrollado por</p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
              {EQUIPO.map((n, i) => (
                <motion.li
                  key={n}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: EASE }}
                  className="group flex items-center gap-2.5"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-udec-900 font-serif text-sm font-semibold text-white ring-2 ring-oro-400/60 transition-transform duration-300 group-hover:scale-110">
                    {iniciales(n)}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{n}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-udec-950 text-white/70">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr] lg:px-6">
          <div>
            <Logo tamano={40} claro />
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              Plataforma de la Universidad de Cundinamarca para registrar y auditar la producción
              científica y dar visibilidad a los emprendimientos de su comunidad.
            </p>
          </div>
          <div>
            <p className="font-serif text-base font-semibold text-white">Portal</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/vitrina" className="hover:text-white hover:underline">Vitrina de emprendimientos</Link></li>
              <li><Link to="/repositorio" className="hover:text-white hover:underline">Repositorio de investigación</Link></li>
              <li><Link to="/isu" className="hover:text-white hover:underline">Interacción Social (ISU)</Link></li>
              <li><Link to="/tienda" className="hover:text-white hover:underline">Tienda UdeC</Link></li>
              <li><Link to="/estadisticas" className="hover:text-white hover:underline">Estadísticas</Link></li>
              <li><Link to="/acceso" className="hover:text-white hover:underline">Acceso institucional</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-serif text-base font-semibold text-white">Sedes y seccionales</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {SEDES.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-4 py-4 text-xs text-white/45 lg:px-6">
            <span>© {new Date().getFullYear()} Universidad de Cundinamarca</span>
            <span>Desarrollado por {EQUIPO.join(', ')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Conserva la página que sale mientras termina su animación de salida. */
/**
 * Outlet con transición de entrada entre rutas.
 * La página nueva se monta de inmediato (sin esperar la salida de la anterior),
 * así la navegación nunca queda bloqueada por una animación.
 */
function SalidaAnimada() {
  const { pathname } = useLocation();
  const outlet = useOutlet();

  useEffect(() => {
    irArriba();
  }, [pathname]);

  return (
    <motion.div
      key={pathname}
      // Al terminar se quita el transform: si queda, rompe los position: fixed (modales)
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0, transitionEnd: { transform: 'none' } }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      {outlet}
    </motion.div>
  );
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <BarraProgreso />
      <Navbar />
      <main className="flex-1">
        <SalidaAnimada />
      </main>
      <Footer />
    </div>
  );
}

export function PanelLayout() {
  const [movilAbierto, setMovilAbierto] = useState(false);
  const { pathname } = useLocation();

  // El cajón móvil se cierra al cambiar de página o con la tecla Escape
  useEffect(() => setMovilAbierto(false), [pathname]);
  useEffect(() => {
    if (!movilAbierto) return undefined;
    const cerrar = (e) => e.key === 'Escape' && setMovilAbierto(false);
    window.addEventListener('keydown', cerrar);
    return () => window.removeEventListener('keydown', cerrar);
  }, [movilAbierto]);
  const { usuario } = useAuth();
  // Acción rápida según el rol: el emprendedor vende, el investigador registra producción
  const accion = {
    EMPRENDEDOR: { to: '/panel/mi-tienda', texto: 'Vender producto' },
    ISU: { to: '/panel/isu?nuevo=1', texto: 'Nuevo proyecto ISU' },
  }[usuario?.rol] || { to: '/panel/registrar-producto', texto: 'Nuevo producto' };

  return (
    <div className="flex min-h-screen bg-fondo">
      {/* Sidebar escritorio */}
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar />
  