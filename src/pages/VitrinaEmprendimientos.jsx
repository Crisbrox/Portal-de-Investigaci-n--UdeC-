/**
 * pages/VitrinaEmprendimientos.jsx
 * Vitrina pública: buscador instantáneo + filtros combinables
 * (Sede, Sector, Etapa) + tarjetas con modal de detalle y botones directos.
 */
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, ShoppingBag, Sprout, X } from 'lucide-react';
import api, { msgError } from '../services/api';
import EncabezadoPagina from '../components/EncabezadoPagina';
import { EASE, TarjetaLuz } from '../components/motion';
import { SEDES, SECTORES, ETAPAS } from '../constants/catalogos';

function TarjetaEmprendimiento({ emp, onAbrir }) {
  const colorEtapa = {
    Idea: 'bg-amber-100 text-amber-800 border-amber-300',
    Prototipo: 'bg-sky-100 text-sky-800 border-sky-300',
    'En marcha': 'bg-udec-100 text-udec-900 border-udec-500',
  };

  return (
    <TarjetaLuz
      as="article"
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, ease: EASE }}
      className="tarjeta group flex flex-col overflow-hidden hover:border-udec-700/40 hover:shadow-tarjeta-hover"
    >
      {emp.logo_url && (
        <div className="h-36 overflow-hidden bg-udec-900">
          <img
            src={emp.logo_url}
            alt={emp.nombre_emprendimiento}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="relative z-10 flex flex-1 flex-col p-5">
        <p className="text-[13px] font-semibold text-udec-700">{emp.sector_categoria}</p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold leading-snug text-udec-900">
            {emp.nombre_emprendimiento}
          </h3>
          <span
            className={`badge shrink-0 border ${colorEtapa[emp.etapa] || 'bg-slate-100 text-slate-600 border-slate-300'}`}
          >
            {emp.etapa}
          </span>
        </div>

        <p className="mt-3 flex-1 text-[15px] leading-relaxed text-slate-600">
          {emp.descripcion_corta?.length > 140
            ? `${emp.descripcion_corta.slice(0, 140)}…`
            : emp.descripcion_corta}
        </p>

        <dl className="mt-4 space-y-1 border-t border-borde pt-3 text-[13px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="shrink-0" />
            <dd>
              Sede {emp.sede_udec}
              {emp.programa_academico ? ` · ${emp.programa_academico}` : ''}
            </dd>
          </div>
          {emp.emprendedores && (
            <dd className="line-clamp-1" title={emp.emprendedores}>
              {emp.emprendedores}
            </dd>
          )}
        </dl>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => onAbrir(emp)} className="enlace text-sm">
            Ver emprendimiento
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </button>
          {emp.productos_en_venta > 0 && (
            <Link
              to={`/tienda?emprendimiento=${emp.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-oro-100 px-3 py-1 text-xs font-semibold text-amber-900 transition-colors hover:bg-oro-500"
            >
              <ShoppingBag size={13} /> {emp.productos_en_venta} a la venta
            </Link>
          )}
        </div>
      </div>
    </TarjetaLuz>
  );
}

function Modal({ emp, onCerrar }) {
  const galeria = Array.isArray(emp.imagenes_galeria) ? emp.imagenes_galeria : [];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        data-lenis-prevent
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"
        initial={{ opacity: 0, y: 60, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="relative flex min-h-36 items-center justify-center bg-udec-900 p-6">
          {emp.logo_url ? (
            <img src={emp.logo_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
          ) : null}
          <div className="relative text-center">
            <span className="inline-block rounded bg-oro-500 px-2 py-0.5 text-xs font-semibold text-udec-950">
              {emp.sector_categoria} · {emp.etapa}
            </span>
            <h2 className="mt-2 text-2xl font-semibold text-white drop-shadow">
              {emp.nombre_emprendimiento}
            </h2>
            <p className="mt-1 flex items-center gap-1 text-sm font-medium text-white/85">
              <MapPin size={14} className="shrink-0" /> {emp.sede_udec}
              {emp.programa_academico ? ` · ${emp.programa_academico}` : ''}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
            aria-label="Cerrar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {emp.descripcion_detallada && (
            <section>
              <h3 className="mb-2 font-serif text-base font-semibold text-udec-900">
                Descripción
              </h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {emp.descripcion_detallada}
              </p>
            </section>
          )}

          {emp.emprendedores && (
            <section className="mt-5">
              <h3 className="mb-2 font-serif text-base font-semibold text-udec-900">
                Emprendedores
              </h3>
              <p className="text-sm text-slate-600">{emp.emprendedores}</p>
            </section>
          )}

          {/* Galería */}
          {galeria.length > 0 && (
            <section className="mt-5">
              <h3 className="mb-2 font-serif text-base font-semibold text-udec-900">
                Galería ({galeria.length})
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {galeria.map((img, i) => (
                  <a key={i} href={img} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-lg border border-borde">
                    <img
                      src={img}
                      alt={`${emp.nombre_emprendimiento} ${i + 1}`}
                      className="h-24 w-full object-cover transition group-hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}

          {emp.productos_en_venta > 0 && (
            <Link
              to={`/tienda?emprendimiento=${emp.id}`}
              onClick={onCerrar}
              className="mt-6 flex items-center justify-between gap-4 rounded-lg bg-udec-900 px-5 py-4 text-white transition-colors hover:bg-udec-800"
            >
              <span className="flex items-center gap-3">
                <ShoppingBag size={22} className="text-oro-400" />
                <span>
                  <span className="block font-semibold">Comprar en la Tienda UdeC</span>
                  <span className="block text-sm text-white/70">{emp.productos_en_venta} productos a la venta</span>
                </span>
              </span>
              <ArrowRight size={18} />
            </Link>
          )}

          {/* Contacto directo */}
          <section className="mt-6">
            <h3 className="mb-3 font-serif text-base font-semibold text-udec-900">
              Contacto directo
            </h3>
            <div className="flex flex-wrap gap-2">
              {emp.whatsapp && (
                <a
                  href={`https://wa.me/${String(emp.whatsapp).replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-1.7-.9-2.9-1.6-4-3.6-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.5.8.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2z" />
                  </svg>
                  WhatsApp
                </a>
              )}
              {emp.instagram && (
                <a
                  href={`https://instagram.com/${String(emp.instagram).replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#C13584] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  Instagram
                </a>
              )}
              {emp.sitio_web && (
                <a
                  href={emp.sitio_web.startsWith('http') ? emp.sitio_web : `https://${emp.sitio_web}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-udec-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-udec-700"
                >
                  Sitio web
                </a>
              )}
              {emp.correo_contacto && (
                <a
                  href={`mailto:${emp.correo_contacto}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-borde bg-white px-4 py-2.5 text-sm font-semibold text-udec-900 transition hover:border-udec-500"
                >
                  Correo
                </a>
              )}
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function VitrinaEmprendimientos() {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [sede, setSede] = useState('');
  const [sector, setSector] = useState('');
  const [etapa, setEtapa] = useState('');
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    setCargando(true);
    api
      .get('/emprendimientos')
      .then(({ data }) => {
        setLista(data.emprendimientos);
        setError('');
      })
      .catch((e) => setError(msgError(e)))
      .finally(() => setCargando(false));
  }, []);

  // Búsqueda instantánea (cliente) + filtros combinables
  const filtrados = useMemo(() => {
    const texto = q.trim().toLowerCase();
    return lista.filter((e) => {
      if (sede && e.sede_udec !== sede) return false;
      if (sector && e.sector_categoria !== sector) return false;
      if (etapa && e.etapa !== etapa) return false;
      if (!texto) return true;
      return (
        (e.nombre_emprendimiento || '').toLowerCase().includes(texto) ||
        (e.descripcion_corta || '').toLowerCase().includes(texto) ||
        (e.descripcion_detallada || '').toLowerCase().includes(texto) ||
        (e.emprendedores || '').toLowerCase().includes(texto)
      );
    });
  }, [lista, q, sede, sector, etapa]);

  const limpiar = () => {
    setQ('');
    setSede('');
    setSector('');
    setEtapa('');
  };

  return (
    <div>
      {/* Cabecera */}
      <EncabezadoPagina
        titulo="Vitrina de emprendimientos"
        descripcion="Proyectos de estudiantes, egresados y docentes de las siete sedes de la Universidad de Cundinamarca. Cada emprendimiento lo publica directamente su equipo."
      />

      {/* Buscador y filtros */}
      <section className="sticky top-[var(--alto-header,105px)] z-20 border-b border-borde bg-fondo/95 py-4 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <label htmlFor="q" className="sr-only">
                Buscar emprendimiento
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                <input
                  id="q"
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por nombre o descripción…"
                  className="campo !pl-9"
                />
              </div>
            </div>
            <select value={sede} onChange={(e) => setSede(e.target.value)} className="campo">
              <option value="">Todas las sedes</option>
              {SEDES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select value={sector} onChange={(e) => setSector(e.target.value)} className="campo">
              <option value="">Todos los sectores</option>
              {SECTORES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select value={etapa} onChange={(e) => setEtapa(e.target.value)} className="campo">
              <option value="">Todas las etapas</option>
              {ETAPAS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>
              <b className="text-udec-900">{filtrados.length}</b> emprendimiento
              {filtrados.length !== 1 ? 's' : ''} encontrado
              {filtrados.length !== 1 ? 's' : ''}
            </span>
            {(q || sede || sector || etapa) && (
              <button onClick={limpiar} className="inline-flex animate-scale-in items-center gap-1 font-semibold text-udec-700 hover:text-udec-900">
                <X size={14} /> Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {cargando && (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-udec-100 border-t-udec-700" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {!cargando && !error && filtrados.length === 0 && (
          <div className="py-20 text-center">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-lg bg-udec-50 text-udec-700">
              <Sprout size={40} strokeWidth={1.5} />
            </span>
            <p className="mt-4 text-lg font-bold text-udec-900">
              No hay emprendimientos con esos filtros
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Ajusta la búsqueda o sé el primero en publicar desde tu panel.
            </p>
            <button onClick={limpiar} className="btn-secundario mt-5">
              Limpiar filtros
            </button>
          </div>
        )}

        {!cargando && !error && filtrados.length > 0 && (
          <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filtrados.map((emp) => (
                <TarjetaEmprendimiento key={emp.id} emp={emp} onAbrir={setSeleccion} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      <AnimatePresence>
        {seleccion && <Modal key={seleccion.id} emp={seleccion} onCerrar={() => setSeleccion(null)} />}
      </AnimatePresence>
    </div>
  );
}
