/**
 * components/Sidebar.jsx
 * Menú lateral del panel: grupos plegables por rol, modo compacto (solo iconos),
 * indicador animado de la opción activa y scroll propio (fuera del scroll suave de la página).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronsLeft,
  ClipboardCheck,
  ExternalLink,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Rocket,
  Sheet,
  Store,
  Users,
  Users2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const ROLES = {
  ADMINISTRADOR: { nombre: 'Administrador', clase: 'bg-oro-500 text-udec-950' },
  INVESTIGADOR: { nombre: 'Investigador', clase: 'bg-emerald-300/90 text-udec-950' },
  EMPRENDEDOR: { nombre: 'Emprendedor', clase: 'bg-sky-300/90 text-udec-950' },
  ISU: { nombre: 'Líder ISU', clase: 'bg-violet-300/90 text-udec-950' },
};

/** Grupos del menú. roles: quién los ve (el administrador ve todo); soloAdmin: solo administradores. */
const grupos = (esAdmin) => [
  {
    id: 'inicio',
    items: [{ to: '/panel', texto: 'Inicio del panel', Icono: LayoutDashboard, fin: true }],
  },
  {
    id: 'investigacion',
    titulo: 'Investigación',
    roles: ['INVESTIGADOR'],
    items: [
      { to: '/panel/mis-productos', texto: esAdmin ? 'Productos de investigación' : 'Mis productos', Icono: FileText },
      { to: '/panel/registrar-producto', texto: 'Registrar producto', Icono: FilePlus2 },
      { to: '/panel/matriz-excel', texto: esAdmin ? 'Matriz de investigación (Excel)' : 'Subir mi Excel', Icono: FileSpreadsheet },
    ],
  },
  {
    id: 'emprendimiento',
    titulo: 'Emprendimiento',
    roles: ['EMPRENDEDOR'],
    items: [
      { to: '/panel/mi-tienda', texto: 'Mi tienda', Icono: Store },
      { to: '/panel/publicar-emprendimiento', texto: 'Publicar emprendimiento', Icono: Rocket },
    ],
  },
  {
    id: 'isu',
    titulo: 'Interacción Social',
    roles: ['ISU'],
    items: [
      { to: '/panel/isu', texto: esAdmin ? 'Seguimiento ISU' : 'Mis proyectos ISU', Icono: Users2, fin: true },
      { to: '/panel/isu/matriz', texto: esAdmin ? 'Matriz ISU (Excel)' : 'Subir mi Excel ISU', Icono: Sheet },
    ],
  },
  {
    id: 'admin',
    titulo: 'Administración',
    soloAdmin: true,
    items: [
      { to: '/panel/auditoria', texto: 'Auditoría y validación', Icono: ClipboardCheck },
      { to: '/panel/usuarios', texto: 'Usuarios', Icono: Users },
    ],
  },
  {
    id: 'cuenta',
    titulo: 'Cuenta',
    items: [{ to: '/panel/cambiar-password', texto: 'Cambiar contraseña', Icono: KeyRound }],
  },
];

const CLAVE_COMPACTO = 'udec_menu_compacto';
const CLAVE_GRUPOS = 'udec_menu_grupos';

function leer(clave, defecto) {
  try {
    const v = localStorage.getItem(clave);
    return v === null ? defecto : JSON.parse(v);
  } catch {
    return defecto;
  }
}
function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // sin almacenamiento: la preferencia solo dura la sesión
  }
}

const iniciales = (nombre) =>
  String(nombre || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

/** Etiqueta flotante para el modo compacto (posición fija: no la recorta el scroll del menú). */
function Tooltip({ info }) {
  return (
    <AnimatePresence>
      {info && (
        <motion.span
          key={info.texto}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{ top: info.top, left: info.left }}
          className="pointer-events-none fixed z-[80] -translate-y-1/2 whitespace-nowrap rounded bg-udec-950 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg ring-1 ring-white/10"
        >
          {info.texto}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

function Item({ item, compacto, onNavigate, hover, setHover, setTooltip }) {
  const { to, texto, Icono, fin } = item;
  const mostrarTooltip = (e) => {
    setHover(to);
    if (!compacto) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTooltip({ texto, top: r.top + r.height / 2, left: r.right + 10 });
  };
  return (
    <NavLink
      to={to}
      end={fin}
      onClick={onNavigate}
      onMouseEnter={mostrarTooltip}
      onMouseLeave={() => setTooltip(null)}
      aria-label={compacto ? texto : undefined}
      className={({ isActive }) =>
        `relative flex items-center gap-3 rounded-lg py-2.5 text-[14.5px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-oro-400 ${
          compacto ? 'justify-center px-0' : 'px-3'
        } ${isActive ? 'font-semibold text-white' : 'text-white/70 hover:text-white'}`
      }
    >
      {({ isActive }) => (
        <>
          {hover === to && !isActive && (
            <motion.span
              layoutId="menu-hover"
              className="absolute inset-0 rounded-lg bg-white/[0.06]"
              transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            />
          )}
          {isActive && (
            <motion.span
              layoutId="menu-activo"
              className="absolute inset-0 rounded-lg bg-white/[0.12] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            >
              <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-oro-400" />
            </motion.span>
          )}
          <motion.span
            className="relative flex shrink-0"
            whileHover={{ scale: 1.12, rotate: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <Icono size={19} strokeWidth={isActive ? 2.2 : 1.8} className={isActive ? 'text-oro-400' : ''} />
          </motion.span>
          {!compacto && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: 0.08 }}
              className="relative truncate whitespace-nowrap"
            >
              {texto}
            </motion.span>
          )}
        </>
      )}
    </NavLink>
  );
}

function Grupo({ grupo, compacto, abierto, onAlternar, ...resto }) {
  // Sin título (Inicio) o en modo compacto: los ítems siempre visibles
  if (!grupo.titulo || compacto) {
    return (
      <div className={grupo.titulo && compacto ? 'mt-3 border-t border-white/10 pt-3' : ''}>
        <div className="space-y-0.5">
          {grupo.items.map((it) => (
            <Item key={it.to} item={it} compacto={compacto} {...resto} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="mt-4">
      <button
        onClick={onAlternar}
        aria-expanded={abierto}
        className="group flex w-full items-center justify-between whitespace-nowrap rounded px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40 transition-colors hover:text-white/70"
      >
        {grupo.titulo}
        <motion.span animate={{ rotate: abierto ? 0 : -90 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={14} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            key="items"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <motion.div
              className="space-y-0.5 pt-1"
              initial="oculto"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            >
              {grupo.items.map((it) => (
                <motion.div key={it.to} variants={{ oculto: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
                  <Item item={it} compacto={false} {...resto} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * movil: versión del cajón móvil (siempre expandida, sin botón de compactar).
 * onNavigate: se llama al elegir una opción (para cerrar el cajón).
 */
export default function Sidebar({ onNavigate, movil = false }) {
  const { usuario, esAdmin, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [compactoGuardado, setCompactoGuardado] = useState(() => leer(CLAVE_COMPACTO, false));
  const [plegados, setPlegados] = useState(() => leer(CLAVE_GRUPOS, {}));
  const [hover, setHover] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [sombras, setSombras] = useState({ arriba: false, abajo: false });
  const navRef = useRef(null);
  const compacto = !movil && compactoGuardado;

  const visibles = useMemo(
    () =>
      grupos(esAdmin).filter((g) => {
        if (g.soloAdmin) return esAdmin;
        return !g.roles || esAdmin || g.roles.includes(usuario?.rol);
      }),
    [esAdmin, usuario?.rol]
  );

  // El grupo de la página actual siempre se abre
  const grupoActivo = visibles.find((g) =>
    g.items.some((it) => (it.fin ? pathname === it.to : pathname.startsWith(it.to)))
  )?.id;
  const estaAbierto = (id) => id === grupoActivo || !plegados[id];

  const alternarGrupo = (id) =>
    setPlegados((p) => {
      const nuevo = { ...p, [id]: estaAbierto(id) };
      guardar(CLAVE_GRUPOS, nuevo);
      return nuevo;
    });

  const alternarCompacto = () =>
    setCompactoGuardado((c) => {
      guardar(CLAVE_COMPACTO, !c);
      return !c;
    });

  // Desvanecido arriba/abajo cuando hay más opciones por ver
  const medirSombras = () => {
    const el = navRef.current;
    if (!el) return;
    setSombras({ arriba: el.scrollTop > 4, abajo: el.scrollTop + el.clientHeight < el.scrollHeight - 4 });
  };
  useEffect(() => {
    medirSombras();
    const el = navRef.current;
    const obs = new ResizeObserver(medirSombras);
    if (el) {
      obs.observe(el);
      if (el.firstElementChild) obs.observe(el.firstElementChild);
    }
    return () => obs.disconnect();
  }, [compacto, plegados, visibles.length]);

  const salir = () => {
    cerrarSesion();
    navigate('/');
  };

  const rol = ROLES[usuario?.rol] || { nombre: 'Usuario', clase: 'bg-white/20 text-white' };

  return (
    <LayoutGroup id={movil ? 'menu-movil' : 'menu-escritorio'}>
      <motion.aside
        data-lenis-prevent
        initial={false}
        animate={{ width: movil ? '100%' : compacto ? 84 : 296 }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="grano relative flex h-full flex-col overflow-hidden bg-udec-950 text-white"
      >
        {/* Brillo decorativo superior */}
        <span className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-udec-700/40 blur-3xl" aria-hidden="true" />

        {/* Encabezado */}
        <div className={`relative flex items-center border-b border-white/10 py-4 ${compacto ? 'justify-center px-2' : 'px-5'}`}>
          <NavLink to="/" className="min-w-0 whitespace-nowrap" onClick={onNavigate}>
            <Logo tamano={compacto ? 30 : 34} claro texto={!compacto} />
          </NavLink>
        </div>

        {/* Usuario */}
        <div className={`relative border-b border-white/10 ${compacto ? 'px-2 py-4' : 'px-5 py-4'}`}>
          <div className={`flex items-center gap-3 ${compacto ? 'justify-center' : ''}`}>
            <motion.span
              whileHover={{ scale: 1.06 }}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-udec-700 font-serif text-base font-semibold ring-2 ring-oro-400/70"
              title={compacto ? `${usuario?.nombre_completo} · ${rol.nombre}` : undefined}
            >
              {iniciales(usuario?.nombre_completo)}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-udec-950" />
            </motion.span>
            {!compacto && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="min-w-0 whitespace-nowrap"
              >
                <p className="truncate text-sm font-semibold" title={usuario?.nombre_completo}>
                  {usuario?.nombre_completo}
                </p>
                <p className="truncate text-xs text-white/50" title={usuario?.correo_institucional}>
                  {usuario?.correo_institucional}
                </p>
                <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10.5px] font-bold ${rol.clase}`}>
                  {rol.nombre}
                  {usuario?.sede ? ` · ${usuario.sede}` : ''}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navegación con scroll propio */}
        <div className="relative min-h-0 flex-1">
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-udec-950 to-transparent transition-opacity ${sombras.arriba ? 'opacity-100' : 'opacity-0'}`}
          />
          <nav
            ref={navRef}
            onScroll={medirSombras}
            onMouseLeave={() => {
              setHover(null);
              setTooltip(null);
            }}
            className="menu-scroll h-full overflow-y-auto overscroll-contain px-3 py-3"
            aria-label="Menú del panel"
          >
            <div>
              {visibles.map((g) => (
                <Grupo
                  key={g.id}
                  grupo={g}
                  compacto={compacto}
                  abierto={estaAbierto(g.id)}
                  onAlternar={() => alternarGrupo(g.id)}
                  onNavigate={onNavigate}
                  hover={hover}
                  setHover={setHover}
                  setTooltip={setTooltip}
                />
              ))}
            </div>
          </nav>
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-udec-950 to-transparent transition-opacity ${sombras.abajo ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>

        {/* Pie */}
        <div className="relative space-y-0.5 border-t border-white/10 px-3 py-3">
          <NavLink
            to="/"
            onClick={onNavigate}
            className={`group flex items-center gap-3 whitespace-nowrap rounded-lg py-2 text-sm text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white ${compacto ? 'justify-center' : 'px-3'}`}
            title={compacto ? 'Ver sitio público' : undefined}
          >
            <ExternalLink size={17} className="transition-transform group-hover:-rotate-12" />
            {!compacto && 'Ver sitio público'}
          </NavLink>
          <button
            onClick={salir}
            className={`group flex w-full items-center gap-3 whitespace-nowrap rounded-lg py-2 text-sm text-white/60 transition-colors hover:bg-red-500/15 hover:text-red-200 ${compacto ? 'justify-center' : 'px-3'}`}
            title={compacto ? 'Cerrar sesión' : undefined}
          >
            <LogOut size={17} className="transition-transform group-hover:translate-x-0.5" />
            {!compacto && 'Cerrar sesión'}
          </button>
          {!movil && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={alternarCompacto}
              className={`group flex w-full items-center gap-3 whitespace-nowrap rounded-lg py-2 text-sm text-white/50 transition-colors hover:bg-white/10 hover:text-white ${compacto ? 'justify-center' : 'px-3'}`}
              aria-label={compacto ? 'Expandir menú' : 'Compactar menú'}
              title={compacto ? 'Expandir menú' : undefined}
            >
              <motion.span animate={{ rotate: compacto ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="flex">
                <ChevronsLeft size={17} />
              </motion.span>
              {!compacto && 'Compactar menú'}
            </motion.button>
          )}
        </div>

        <Tooltip info={compacto ? tooltip : null} />
      </motion.aside>
    </LayoutGroup>
  );
}
