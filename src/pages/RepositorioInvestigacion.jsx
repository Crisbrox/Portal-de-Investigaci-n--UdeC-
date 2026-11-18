/**
 * pages/RepositorioInvestigacion.jsx
 * Repositorio de la producción científica: todos los productos de la matriz con su estado,
 * buscador por nombre y filtros por autor, año, tipología, tipo de publicación y estado.
 */
import { useEffect, useMemo, useState } from 'react';
import { Search, SearchX, X } from 'lucide-react';
import api, { msgError } from '../services/api';
import EncabezadoPagina from '../components/EncabezadoPagina';
import FiltroAutor, { autoresDe, coincideAutor, normalizar } from '../components/FiltroAutor';
import { TIPOLOGIAS } from '../constants/catalogos';
import EstadoBadge from '../components/EstadoBadge';

function ModalProducto({ prod, onCerrar }) {
  if (!prod) return null;

  const campos = [
    ['Sub-tipología', prod.sub_tipologia],
    ['Clasificación', prod.clasificacion],
    ['Título del libro / evento', prod.titulo_libro_evento],
    ['Medio de verificación', prod.medio_verificacion],
    ['Período académico', prod.periodo_academico],
    ['Fecha publicación', prod.fecha_publicacion],
    ['Editorial', prod.editorial],
    ['ISSN / ISBN', prod.revista_libro_issn_isbn],
    ['Volumen', prod.volumen],
    ['Ciudad / Municipio', prod.ciudad_municipio],
    ['Proyecto de investigación', prod.proyecto_investigacion],
    ['Instituciones participantes', prod.instituciones_participantes],
    ['Sitio web / DOI', prod.sitio_web_doi],
    ['Autor / Asesor 1', prod.autor_asesor_1],
    ['Autor / Asesor 2', prod.autor_asesor_2],
    ['Autor / Asesor 3', prod.autor_asesor_3],
    ['Otros autores', prod.otros_autores],
    ['Reconocimientos', prod.reconocimientos],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
    >
      <div
        data-lenis-prevent
        className="max-h-[90vh] w-full max-w-3xl animate-scale-in overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-borde bg-udec-900 px-6 py-4 text-white">
          <div>
            <p className="text-xs font-semibold text-white/50">
              {prod.tipologia} · {prod.anio}
            </p>
            <h2 className="mt-1 text-lg font-bold leading-snug">{prod.nombre_producto}</h2>
          </div>
          <button
            onClick={onCerrar}
            className="rounded-full bg-white/15 p-2 transition hover:bg-white/30"
            aria-label="Cerrar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <EstadoBadge estado={prod.estado_evidencia} />
            <span className="rounded-full bg-udec-50 px-3 py-1 text-xs font-semibold text-udec-900">
              {prod.sub_tipologia || '—'}
            </span>
            {prod.autor_sede && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Sede {prod.autor_sede}
              </span>
            )}
          </div>

          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {campos
              .filter(([, v]) => v)
              .map(([label, valor]) => (
                <div key={label} className="border-b border-borde/60 pb-2">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {label}
                  </dt>
                  <dd className="text-sm text-slate-700">{valor}</dd>
                </div>
              ))}
          </dl>

          {(prod.autor_nombre || prod.autor_programa) && (
            <div className="mt-5 rounded-xl bg-udec-50 p-4">
              <p className="text-xs font-semibold text-udec-700">
                Registrado por
              </p>
              <p className="mt-1 text-sm font-semibold text-udec-900">
                {prod.autor_nombre || 'Comunidad UdeC'}
              </p>
              <p className="text-xs text-slate-500">
                {[prod.autor_programa, prod.autor_semillero].filter(Boolean).join(' · ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const POR_PAGINA = 25;
const FILTROS_VACIOS = { nombre: '', autor: '', anio: '', tipologia: '', tipo: '', estado: '' };
const ESTADOS = ['Con evidencia', 'Parcial', 'Sin evidencia', 'No verificado'];

export default function RepositorioInvestigacion() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [orden, setOrden] = useState('recientes');
  const [pagina, setPagina] = useState(1);
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    setCargando(true);
    api
      .get('/investigacion/publicos', { params: { todas: 1 } })
      .then(({ data }) => {
        setProductos(data.productos);
        setError('');
      })
      .catch((e) => setError(msgError(e)))
      .finally(() => setCargando(false));
  }, []);

  const set = (campo) => (valor) =>
    setFiltros((f) => ({
      ...f,
      [campo]: valor,
      // Al cambiar de tipología, el tipo de publicación anterior puede no aplicar
      ...(campo === 'tipologia' ? { tipo: '' } : {}),
    }));
  const setEvento = (campo) => (e) => set(campo)(e.target.value);

  // Cualquier cambio de filtro u orden vuelve a la primera página
  useEffect(() => setPagina(1), [filtros, orden]);

  const anios = useMemo(
    () => [...new Set(productos.map((p) => p.anio).filter(Boolean))].sort((a, b) => b - a),
    [productos]
  );
  const autores = useMemo(() => autoresDe(productos), [productos]);

  /** Tipos de publicación (sub-tipologías) presentes en los datos, según la tipología elegida. */
  const tipos = useMemo(() => {
    const conteo = new Map();
    productos
      .filter((p) => !filtros.tipologia || p.tipologia === filtros.tipologia)
      .forEach((p) => p.sub_tipologia && conteo.set(p.sub_tipologia, (conteo.get(p.sub_tipologia) || 0) + 1));
    return [...conteo.entries()].sort((a, b) => b[1] - a[1]);
  }, [productos, filtros.tipologia]);

  const filtrados = useMemo(() => {
    const nombre = normalizar(filtros.nombre);
    const lista = productos.filter((p) => {
      if (filtros.tipologia && p.tipologia !== filtros.tipologia) return false;
      if (filtros.tipo && p.sub_tipologia !== filtros.tipo) return false;
      if (filtros.anio && String(p.anio) !== String(filtros.anio)) return false;
      if (filtros.estado && p.estado_evidencia !== filtros.estado) return false;
      if (!coincideAutor(p, filtros.autor)) return false;
      if (!nombre) return true;
      return [p.nombre_producto, p.titulo_libro_evento, p.proyecto_investigacion].some((t) =>
        normalizar(t).includes(nombre)
      );
    });
    const comparar = {
      recientes: (a, b) => (b.anio || 0) - (a.anio || 0) || String(a.nombre_producto).localeCompare(b.nombre_producto),
      antiguos: (a, b) => (a.anio || 0) - (b.anio || 0) || String(a.nombre_producto).localeCompare(b.nombre_producto),
      titulo: (a, b) => String(a.nombre_producto).localeCompare(b.nombre_producto, 'es'),
    }[orden];
    return [...lista].sort(comparar);
  }, [productos, filtros, orden]);

  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const visibles = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const hayFiltros = Object.values(filtros).some(Boolean);

  const irAPagina = (n) => {
    setPagina(n);
    document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      <EncabezadoPagina
        titulo="Repositorio de investigación"
        descripcion="Toda la producción científica registrada en la matriz institucional. Busca por nombre, autor, año o tipo de publicación y abre la ficha completa de cada producto."
      />

      {/* Buscador */}
      <section className="border-b border-borde bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 lg:px-6">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1.6fr_1.3fr_0.8fr]">
            <label className="relative block">
              <span className="sr-only">Nombre del producto</span>
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={filtros.nombre}
                onChange={setEvento('nombre')}
                placeholder="Nombre del producto, libro, evento o proyecto"
                className="campo !pl-9"
              />
            </label>
            <FiltroAutor valor={filtros.autor} onCambiar={set('autor')} autores={autores} />
            <select value={filtros.anio} onChange={setEvento('anio')} className="campo" aria-label="Año">
              <option value="">Todos los años</option>
              {anios.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1.3fr_0.9fr_0.9fr]">
            <select value={filtros.tipologia} onChange={setEvento('tipologia')} className="campo" aria-label="Tipología">
              <option value="">Todas las tipologías</option>
              {TIPOLOGIAS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <select value={filtros.tipo} onChange={setEvento('tipo')} className="campo" aria-label="Tipo de publicación">
              <option value="">Todos los tipos de publicación</option>
              {tipos.map(([t, n]) => (
                <option key={t} value={t}>
                  {t} ({n})
                </option>
              ))}
            </select>
            <select value={filtros.estado} onChange={setEvento('estado')} className="campo" aria-label="Estado de evidencia">
              <option value="">Cualquier estado</option>
              {ESTADOS.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
            <select value={orden} onChange={(e) => setOrden(e.target.value)} className="campo" aria-label="Ordenar">
              <option value="recientes">Más recientes primero</option>
              <option value="antiguos">Más antiguos primero</option>
              <option value="titulo">Título (A-Z)</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <p>
              <b className="text-udec-900">{filtrados.length}</b> de {productos.length} productos
            </p>
            {hayFiltros && (
              <button onClick={() => setFiltros(FILTROS_VACIOS)} className="enlace text-sm">
                <X size={14} /> Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section id="resultados" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-8 lg:px-6">
        {cargando && (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="esqueleto h-16" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>
        )}

        {!cargando && !error && filtrados.length === 0 && (
          <div className="py-20 text-center">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-lg bg-udec-50 text-udec-700">
              <SearchX size={40} strokeWidth={1.5} />
            </span>
            <p className="mt-4 font-serif text-xl font-semibold text-udec-900">Sin resultados</p>
            <p className="mt-1 text-sm text-slate-500">
              {productos.length === 0
                ? 'Todavía no hay productos registrados en la matriz.'
                : 'Ningún producto coincide con esos filtros. Prueba quitando alguno.'}
            </p>
          </div>
        )}

        {!cargando && !error && filtrados.length > 0 && (
          <>
            <ul key={`${pagina}-${orden}`} className="escalonado divide-y divide-borde rounded-md border border-borde bg-white">
              {visibles.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => setSeleccion(p)}
                    data-cursor="Ver"
                    className="group grid w-full gap-x-6 gap-y-1 px-5 py-4 text-left transition-colors hover:bg-udec-50/60 md:grid-cols-[4.5rem_1fr_auto]"
                  >
                    <span className="font-serif text-2xl font-semibold text-oro-600">{p.anio || '—'}</span>
                    <span className="min-w-0">
                      <span className="block font-semibold leading-snug text-slate-800 group-hover:text-udec-800">
                        {p.nombre_producto}
                      </span>
                      <span className="mt-1 block text-sm text-slate-500">
                        {[p.autor_asesor_1, p.autor_asesor_2, p.autor_asesor_3].filter(Boolean).join(' · ') ||
                          p.otros_autores ||
                          'Autor no registrado'}
                      </span>
                      <span className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                        <span className="rounded bg-udec-50 px-2 py-0.5 font-semibold text-udec-800">{p.tipologia}</span>
                        {p.sub_tipologia && (
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">{p.sub_tipologia}</span>
                        )}
                      </span>
                    </span>
                    <span className="flex items-start md:justify-end">
                      <EstadoBadge estado={p.estado_evidencia} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {paginas > 1 && (
              <nav className="mt-6 flex flex-wrap items-center justify-center gap-1" aria-label="Paginación">
                <button
                  onClick={() => irAPagina(pagina - 1)}
                  disabled={pagina === 1}
                  className="rounded px-3 py-2 text-sm font-semibold text-udec-800 hover:bg-udec-50 disabled:opacity-30"
                >
                  Anterior
                </button>
                {Array.from({ length: paginas }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === paginas || Math.abs(n - pagina) <= 2)
                  .map((n, i, arr) => (
                    <span key={n} className="flex items-center">
                      {i > 0 && n - arr[i - 1] > 1 && <span className="px-1 text-slate-400">…</span>}
                      <button
                        onClick={() => irAPagina(n)}
                        aria-current={n === pagina ? 'page' : undefined}
                        className={`h-9 min-w-9 rounded px-2 text-sm font-semibold transition-colors ${
                          n === pagina ? 'bg-udec-900 text-white' : 'text-slate-600 hover:bg-udec-50'
                        }`}
                      >
                        {n}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => irAPagina(pagina + 1)}
                  disabled={pagina === paginas}
                  className="rounded px-3 py-2 text-sm font-semibold text-udec-800 hover:bg-udec-50 disabled:opacity-30"
                >
                  Siguiente
                </button>
              </nav>
            )}
          </>
        )}
      </section>

      <ModalProducto prod={seleccion} onCerrar={() => setSeleccion(null)} />
    </div>
  );
}
