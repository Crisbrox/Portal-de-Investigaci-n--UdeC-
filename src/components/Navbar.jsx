/**
 * components/Navbar.jsx
 * Barra pública: Inicio | Vitrina | Repositorio | Estadísticas
 * + botón "Acceso Institucional (@ucundinamarca)".
 * Se compacta al hacer scroll y publica su alto en la variable CSS --alto-header.
 */
import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { LogIn, LogOut, Menu, ShoppingBag, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import Logo from './Logo';
import { EASE, Magnetico } from './motion';

const ENLACES = [
  { to: '/', texto: 'Inicio', fin: true },
  { to: '/tienda', texto: 'Tienda' },
  { to: '/vitrina', texto: 'Emprendimientos' },
  { to: '/repositorio', texto: 'Repositorio' },
  { to: '/isu', texto: 'ISU' },
  { to: '/estadisticas', texto: 'Estadísticas' },
];

/** Botón del carrito con contador animado. */
function BotonCarrito() {
  const { unidades, setAbierto } = useCarrito();
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => setAbierto(true)}
      className="relative rounded p-2 text-udec-900 transition-colors hover:bg-udec-50"
      aria-label={`Abrir carrito (${unidades} productos)`}
    >
      <ShoppingBag size={20} />
      <AnimatePresence>
        {unidades > 0 && (
          <motion.span
            key={unidades}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-oro-500 px-1 text-[11px] font-bold text-udec-950"
          >
            {unidades}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default function Navbar() {
  const { autenticado, esAdmin, cerrarSesion, usuario } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [compacto, setCompacto] = useState(false);
  const [hover, setHover] = useState(null);
  const navigate = useNavigate();
  const ref = useRef(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => setCompacto(y > 48));

  // Publica el alto real del header para los elementos sticky de las páginas
  useEffect(() => {
    const el = ref.current;
    const obs = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--alto-header', `${el.offsetHeight}px`);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const salir = () => {
    cerrarSesion();
    navigate('/');
  };

  return (
    <header
      ref={ref}
      className={`sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md transition-[border-color,box-shadow] duration-300 ${
        compacto ? 'border-borde shadow-[0_6px_24px_-12px_rgba(0,46,27,0.25)]' : 'border-transparent'
      }`}
    >
      {/* Franja institucional: se recoge al hacer scroll */}
      <motion.div
        initial={false}
        animate={{ height: compacto ? 0 : 32, opacity: compacto ? 0 : 1 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="overflow-hidden bg-udec-900 text-white/85"
      >
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-xs lg:px-6">
          <span>Universidad de Cundinamarca · Sistema de Investigación</span>
          <span className="hidden truncate sm:block" title={usuario?.correo_institucional}>
            {autenticado ? usuario?.correo_institucional : 'Acceso con correo @ucundinamarca.edu.co'}
          </span>
        </div>
      </motion.div>

      <motion.nav
        initial={false}
        animate={{ paddingTop: compacto ? 8 : 14, paddingBottom: compacto ? 8 : 14 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 lg:px-6"
      >
        <Link to="/" className="shrink-0" onClick={() => setAbierto(false)}>
          <motion.div
            initial={false}
            animate={{ scale: compacto ? 0.88 : 1 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="origin-left"
          >
            <Logo tamano={38} />
          </motion.div>
        </Link>

        {/* Escritorio: fondo que sigue al cursor + subrayado que se desliza */}
        <div className="hidden items-center gap-1 lg:flex" onMouseLeave={() => setHover(null)}>
          {ENLACES.map((e) => (
            <NavLink
              key={e.to}
              to={e.to}
              end={e.fin}
              onMouseEnter={() => setHover(e.to)}
              className={({ isActive }) =>
                `relative whitespace-nowrap px-2.5 py-2 text-[15px] xl:px-3.5 font-semibold transition-colors ${
                  isActive ? 'text-udec-900' : 'text-slate-600 hover:text-udec-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {hover === e.to && (
                    <motion.span
                      layoutId="nav-hover"
                      className="absolute inset-0 rounded bg-udec-50"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  {isActive && (
                    <motion.span
                      layoutId="nav-activo"
                      className="absolute inset-x-3.5 -bottom-[3px] h-[3px] rounded-full bg-oro-500"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{e.texto}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <BotonCarrito />
          {autenticado ? (
            <>
              <Magnetico>
                <Link to="/panel" className="btn-primary whitespace-nowrap !py-2">
                  <span className="hidden xl:inline">{esAdmin ? 'Panel de administración' : 'Mi panel'}</span>
                  <span className="xl:hidden">Mi panel</span>
                </Link>
              </Magnetico>
              <motion.button
                whileHover={{ rotate: -8 }}
                whileTap={{ scale: 0.9 }}
                onClick={salir}
                className="rounded p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-udec-900"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut size={18} />
              </motion.button>
            </>
          ) : (
            <Magnetico>
              <Link to="/acceso" className="btn-primary group whitespace-nowrap !py-2">
                <LogIn size={16} className="transition-transform group-hover:translate-x-0.5" />
                <span className="hidden xl:inline">Acceso institucional</span>
                <span className="xl:hidden">Ingresar</span>
              </Link>
            </Magnetico>
          )}
        </div>

        {/* Menú móvil */}
        <div className="flex items-center gap-1 lg:hidden">
          <BotonCarrito />
          <button
            className="rounded p-2 text-udec-900 lg:hidden"
            onClick={() => setAbierto((v) => !v)}
            aria-label="Abrir menú"
            aria-expanded={abierto}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={abierto ? 'x' : 'm'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="block"
              >
                {abierto ? <X size={24} /> : <Menu size={24} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </motion.nav>

      {/* Panel móvil */}
      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            key="movil"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden border-t border-borde bg-white lg:hidden"
          >
            <motion.div
              className="flex flex-col px-4 py-3"
              initial="oculto"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }}
            >
              {ENLACES.map((e) => (
                <motion.div
                  key={e.to}
                  variants={{ oculto: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
                >
                  <NavLink
                    to={e.to}
                    end={e.fin}
                    onClick={() => setAbierto(false)}
                    className={({ isActive }) =>
                      `block border-l-[3px] px-3 py-2.5 text-[15px] font-semibold ${
                        isActive ? 'border-oro-500 text-udec-900' : 'border-transparent text-slate-600'
                      }`
                    }
                  >
                    {e.texto}
                  </NavLink>
                </motion.div>
              ))}
              <div className="mt-3 border-t border-borde pt-3">
                {autenticado ? (
                  <div className="flex flex-col gap-2">
                    <Link to="/panel" onClick={() => setAbierto(false)} className="btn-primary">
                      {esAdmin ? 'Panel de administración' : 'Mi panel'}
                    </Link>
                    <button
                      onClick={() => {
                        setAbierto(false);
                        salir();
                      }}
                      className="btn-secundario"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                ) : (
                  <Link to="/acceso" onClick={() => setAbierto(false)} className="btn-primary w-full">
                    Acceso institucional
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
