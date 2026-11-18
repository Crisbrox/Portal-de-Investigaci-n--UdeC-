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

/** Sellos del pie de página, cada uno con las personas del equipo que aparecen debajo. */
const SELLOS = [
  {
    src: '/img/acreditacion-alta-calidad.png',
    alt: 'Acreditación Institucional de Alta Calidad - Universidad de Cundinamarca',
    texto: 'Acreditación Institucional de Alta Calidad',
    equipo: ['Cristhian Mateo Ramirez'],
  },
  {
    src: '/img/centenario-roque.png',
    alt: 'Cien años Tecnológico de Roque 1926-2026',
    texto: '100 años Tecnológico de Roque · 1926-2026',
    equipo: ['Gabriela Sarai Garcia Serrano', 'Vanessa Yañez Mejia'],
  },
];

const EQUIPO = SELLOS.flatMap((s) => s.equipo);

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
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:grid-cols-2 lg:px-6">
          {SELLOS.map((s, i) => (
            <motion.figure
              key={s.src}
              initial={{ opacity: 0, x: i ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE }}
              className={`flex flex-col items-center text-center ${i ? 'sm:items-end sm:text-right' : 'sm:items-start sm:text-left'}`}
            >
              <div className={`flex items-center gap-4 ${i ? 'sm:flex-row-reverse' : ''}`}>
                <motion.img
                  src={s.src}
                  alt={s.alt}
                  loading="lazy"
                  whileHover={{ scale: 1.08, rotate: i ? 4 : -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="h-28 w-28 object-contain"
                />
                <figcaption className="max-w-[12rem] text-sm font-semibold leading-snug text-udec-900">{s.texto}</figcaption>
              </div>

              <p className="antetitulo mt-5">Desarrollado por</p>
              <ul className={`mt-3 flex flex-col gap-2.5 ${i ? 'sm:items-end' : 'sm:items-start'}`}>
                {s.equipo.map((n, k) => (
                  <motion.li
                    key={n}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.25 + k * 0.1, ease: EASE }}
                    className={`group flex items-center gap-2.5 ${i ? 'sm:flex-row-reverse' : ''}`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-udec-900 font-serif text-sm font-semibold text-white ring-2 ring-oro-400/60 transition-transform duration-300 group-hover:scale-110">
                      {iniciales(n)}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{n}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.figure>
          ))}
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
        </div>
      </div>

      {/* Sidebar móvil */}
      <AnimatePresence>
        {movilAbierto && (
          <motion.div key="cajon" className="fixed inset-0 z-50 lg:hidden" exit={{ opacity: 1 }}>
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMovilAbierto(false)}
              aria-hidden="true"
            />
            <motion.div
              className="absolute inset-y-0 left-0 w-80 max-w-[86vw] shadow-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            >
              <Sidebar movil onNavigate={() => setMovilAbierto(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior del workspace */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-borde bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
          <button
            className="rounded-lg border border-borde p-2 text-udec-900 lg:hidden"
            onClick={() => setMovilAbierto(true)}
            aria-label="Abrir menú del panel"
          >
            <Menu size={20} />
          </button>

          <nav className="flex items-center gap-1 overflow-x-auto text-sm">
            <NavLink
              to="/"
              className="group inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium text-slate-500 transition hover:bg-udec-50 hover:text-udec-900"
            >
              <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
              Ver sitio público
            </NavLink>
            <NavLink
              to="/vitrina"
              className="hidden rounded-md px-3 py-1.5 font-medium text-slate-500 transition hover:bg-udec-50 hover:text-udec-900 sm:block"
            >
              Vitrina
            </NavLink>
            <NavLink
              to="/estadisticas"
              className="hidden rounded-md px-3 py-1.5 font-medium text-slate-500 transition hover:bg-udec-50 hover:text-udec-900 sm:block"
            >
              Indicadores
            </NavLink>
          </nav>

          <Link to={accion.to} className="btn-primary group !py-2 text-xs">
            <Plus size={15} className="transition-transform duration-300 group-hover:rotate-90" />
            {accion.texto}
          </Link>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">
          <SalidaAnimada />
        </main>
      </div>
    </div>
  );
}
