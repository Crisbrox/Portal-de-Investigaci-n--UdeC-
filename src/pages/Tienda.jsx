/**
 * pages/Tienda.jsx — Tienda UdeC: catálogo de productos de los emprendimientos.
 * Los pedidos se arman en el carrito y se envían por WhatsApp a cada emprendimiento.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, MapPin, Minus, Plus, Search, ShoppingBag, Store, Tag, X } from 'lucide-react';
import api, { msgError } from '../services/api';
import EncabezadoPagina from '../components/EncabezadoPagina';
import { TarjetaLuz } from '../components/motion';
import { SEDES, SECTORES } from '../constants/catalogos';
import { pesos, precioFinal, useCarrito } from '../context/CarritoContext';

const RANGOS = [
  ['', 'Cualquier precio'],
  ['0-10000', 'Hasta $10.000'],
  ['10000-30000', '$10.000 a $30.000'],
  ['30000-80000', '$30.000 a $80.000'],
  ['80000-', 'Más de $80.000'],
];

const descuento = (p) => (p.precio_oferta ? Math.round((1 - p.precio_oferta / p.precio) * 100) : 0);

function Precio({ p, grande = false }) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span className={`font-serif font-semibold text-udec-900 ${grande ? 'text-3xl' : 'text-xl'}`}>{pesos(precioFinal(p))}</span>
      {p.precio_oferta && <span className="text-sm text-slate-400 line-through">{pesos(p.precio)}</span>}
      <span className="text-xs text-slate-500">/ {p.unidad || 'unidad'}</span>
    </span>
  );
}

function BotonAgregar({ producto, cantidad = 1, className = '' }) {
  const { agregar, setAbierto } = useCarrito();
  const [agregado, setAgregado] = useState(false);
  const agotado = producto.stock === 0;

  const click = (e) => {
    e.stopPropagation();
    agregar(producto, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1400);
  };

  if (agotado) {
    return <span className={`inline-flex items-center justify-center rounded bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500 ${className}`}>Agotado</span>;
  }
  return (
    <span className={`inline-flex gap-2 ${className}`}>
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={click}
        className={`btn-primary flex-1 overflow-hidden ${agregado ? '!bg-udec-700' : ''}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={agregado ? 'ok' : 'add'}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="inline-flex items-center gap-2"
          >
            {agregado ? <Check size={16} /> : <ShoppingBag size={16} />}
            {agregado ? 'Agregado' : 'Agregar'}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      {agregado && (
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            setAbierto(true);
          }}
          className="btn-secundario !px-3"
        >
          Ver carrito
        </motion.button>
      )}
    </span>
  );
}

function TarjetaProducto({ p, onAbrir }) {
  return (
    <TarjetaLuz
      as="article"
      layout
      inclinacion={3}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-borde bg-white transition-shadow hover:shadow-tarjeta-hover"
      onClick={() => onAbrir(p)}
      data-cursor="Ver"
    >
      <div className="relative z-10 aspect-[4/3] overflow-hidden bg-udec-50">
        {p.imagen_url ? (
          <img src={p.imagen_url} alt={p.nombre} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-udec-900 font-serif text-5xl font-semibold text-white/90">
            {p.nombre.charAt(0)}
          </span>
        )}
        {p.precio_oferta && (
          <span className="absolute left-3 top-3 rounded bg-oro-500 px-2 py-1 text-xs font-bold text-udec-950">-{descuento(p)}%</span>
        )}
        {p.stock !== null && p.stock > 0 && p.stock <= 5 && (
          <span className="absolute right-3 top-3 rounded bg-white/90 px-2 py-1 text-xs font-semibold text-amber-800">
            Quedan {p.stock}
          </span>
        )}
      </div>
      <div className="relative z-10 flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold text-udec-700">{p.nombre_emprendimiento}</p>
        <h3 className="mt-1 line-clamp-2 font-serif text-lg font-semibold leading-snug text-slate-900">{p.nombre}</h3>
        <div className="mt-auto pt-3">
          <Precio p={p} />
          <BotonAgregar producto={p} className="mt-3 w-full" />
        </div>
      </div>
    </TarjetaLuz>
  );
}

function Detalle({ p, onCerrar }) {
  const [cantidad, setCantidad] = useState(1);
  const tope = p.stock ?? 99;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        data-lenis-prevent
        className="grid max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-xl md:grid-cols-2"
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-square bg-udec-50 md:aspect-auto">
          {p.imagen_url ? (
            <img src={p.imagen_url} alt={p.nombre} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full min-h-64 w-full items-center justify-center bg-udec-900 font-serif text-8xl text-white/90">
              {p.nombre.charAt(0)}
            </span>
          )}
          {p.precio_oferta && (
            <span className="absolute left-4 top-4 rounded bg-oro-500 px-3 py-1.5 text-sm font-bold text-udec-950">
              -{descuento(p)}%
            </span>
          )}
        </div>
        <div className="flex flex-col p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-semibold text-udec-700">{p.nombre_emprendimiento}</p>
            <button onClick={onCerrar} className="-mr-2 -mt-2 rounded p-2 text-slate-400 hover:bg-slate-100" aria-label="Cerrar">
              <X size={20} />
            </button>
          </div>
          <h2 className="mt-1 text-3xl font-semibold leading-tight text-udec-900">{p.nombre}</h2>
          <div className="mt-4">
            <Precio p={p} grande />
          </div>
          {p.descripcion && <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-slate-600">{p.descripcion}</p>}

          <dl className="mt-5 space-y-1.5 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <MapPin size={14} /> Sede {p.sede_udec} · {p.sector_categoria}
            </div>
            {p.stock !== null && (
              <div className="flex items-center gap-2">
                <Tag size={14} /> {p.stock > 0 ? `${p.stock} disponibles` : 'Agotado'}
              </div>
            )}
          </dl>

          <div className="mt-auto pt-6">
            {p.stock !== 0 && (
              <div className="mb-3 flex items-center gap-3">
                <span className="text-sm text-slate-600">Cantidad</span>
                <div className="flex items-center rounded border border-borde">
                  <button onClick={() => setCantidad((c) => Math.max(1, c - 1))} className="p-2 hover:bg-slate-100" aria-label="Menos">
                    <Minus size={15} />
                  </button>
                  <span className="w-10 text-center font-semibold tabular-nums">{cantidad}</span>
                  <button onClick={() => setCantidad((c) => Math.min(tope, c + 1))} className="p-2 hover:bg-slate-100" aria-label="Más">
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            )}
            <BotonAgregar producto={p} cantidad={cantidad} className="w-full" />
            <Link to={`/tienda?emprendimiento=${p.emprendimiento_id}`} onClick={onCerrar} className="enlace mt-4 text-sm">
              <Store size={15} /> Ver más de {p.nombre_emprendimiento}
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Tienda() {
  const [params, setParams] = useSearchParams();
  const emprendimiento = params.get('emprendimiento') || '';
  const { unidades, setAbierto } = useCarrito();

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({ q: '', sector: '', sede: '', rango: '', ofertas: false, orden: 'recientes' });
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    const [min, max] = filtros.rango.split('-');
    const t = setTimeout(() => {
      setCargando(true);
      api
        .get('/tienda/productos', {
          params: {
            q: filtros.q || undefined,
            sector: filtros.sector || undefined,
            sede: filtros.sede || undefined,
            min: min || undefined,
            max: max || undefined,
            ofertas: filtros.ofertas ? 1 : undefined,
            orden: filtros.orden,
            emprendimiento: emprendimiento || undefined,
          },
        })
        .then(({ data }) => {
          setProductos(data.productos);
          setError('');
        })
        .catch((e) => setError(msgError(e)))
        .finally(() => setCargando(false));
    }, 250);
    return () => clearTimeout(t);
  }, [filtros, emprendimiento]);

  const set = (campo) => (e) =>
    setFiltros((f) => ({ ...f, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const nombreEmprendimiento = useMemo(
    () => (emprendimiento && productos[0] ? productos[0].nombre_emprendimiento : ''),
    [emprendimiento, productos]
  );

  return (
    <div>
      <EncabezadoPagina
        titulo="Tienda UdeC"
        miga="Tienda"
        descripcion="Productos hechos por los emprendimientos de la comunidad universitaria. Arma tu pedido y envíalo por WhatsApp a cada emprendimiento: el pago y la entrega se acuerdan directamente con ellos."
      >
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setAbierto(true)} className="btn-secundario relative">
          <ShoppingBag size={16} />
          Mi pedido
          {unidades > 0 && (
            <motion.span
              key={unidades}
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-oro-500 px-1.5 text-xs font-bold text-udec-950"
            >
              {unidades}
            </motion.span>
          )}
        </motion.button>
      </EncabezadoPagina>

      <section className="sticky top-[var(--alto-header,105px)] z-20 border-b border-borde bg-fondo/95 py-4 backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] lg:px-6">
          <label className="relative block">
            <span className="sr-only">Buscar</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filtros.q} onChange={set('q')} placeholder="¿Qué estás buscando?" className="campo !pl-9" />
          </label>
          <select value={filtros.sector} onChange={set('sector')} className="campo" aria-label="Sector">
            <option value="">Todos los sectores</option>
            {SECTORES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select value={filtros.sede} onChange={set('sede')} className="campo" aria-label="Sede">
            <option value="">Todas las sedes</option>
            {SEDES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select value={filtros.rango} onChange={set('rango')} className="campo" aria-label="Precio">
            {RANGOS.map(([v, t]) => (
              <option key={v} value={v}>
                {t}
              </option>
            ))}
          </select>
          <select value={filtros.orden} onChange={set('orden')} className="campo" aria-label="Ordenar">
            <option value="recientes">Destacados</option>
            <option value="precio_asc">Menor precio</option>
            <option value="precio_desc">Mayor precio</option>
            <option value="nombre">Nombre (A-Z)</option>
          </select>
        </div>
        <div className="mx-auto mt-3 flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-4 text-sm text-slate-500 lg:px-6">
          <span>
            <b className="text-udec-900">{productos.length}</b> producto{productos.length !== 1 ? 's' : ''}
          </span>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={filtros.ofertas} onChange={set('ofertas')} className="h-4 w-4 accent-udec-800" />
            Solo ofertas
          </label>
          {emprendimiento && (
            <button onClick={() => setParams({})} className="inline-flex items-center gap-1 rounded-full bg-udec-100 px-3 py-1 text-xs font-semibold text-udec-900">
              {nombreEmprendimiento || 'Emprendimiento'} <X size={12} />
            </button>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        {error && <div className="rounded border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

        {cargando && productos.length === 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="esqueleto h-80 rounded-xl" />
            ))}
          </div>
        )}

        {!cargando && !error && productos.length === 0 && (
          <div className="py-20 text-center">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-udec-50 text-udec-700">
              <Store size={36} strokeWidth={1.5} />
            </span>
            <p className="mt-4 font-serif text-xl font-semibold text-udec-900">No hay productos con esos filtros</p>
            <p className="mt-1 text-sm text-slate-500">
              Prueba con otra búsqueda o recorre la{' '}
              <Link to="/vitrina" className="enlace">
                vitrina de emprendimientos
              </Link>
              .
            </p>
          </div>
        )}

        {productos.length > 0 && (
          <motion.div layout className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-4 ${cargando ? 'opacity-60' : ''}`}>
            <AnimatePresence>
              {productos.map((p) => (
                <TarjetaProducto key={p.id} p={p} onAbrir={setSeleccion} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      <AnimatePresence>{seleccion && <Detalle key={seleccion.id} p={seleccion} onCerrar={() => setSeleccion(null)} />}</AnimatePresence>
    </div>
  );
}
