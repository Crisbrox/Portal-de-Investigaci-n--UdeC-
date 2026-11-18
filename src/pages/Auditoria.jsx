/**
 * pages/Auditoria.jsx (Solo Admin)
 * Auditoría y validación: revisa soportes, cambia estado_evidencia
 * y registra observaciones_validacion.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, MessageSquareText, Paperclip, Sheet, TriangleAlert } from 'lucide-react';
import api, { msgError } from '../services/api';
import EstadoBadge from '../components/EstadoBadge';
import Toast from '../components/Toast';
import FiltroAutor from '../components/FiltroAutor';
import { TIPOLOGIAS, SEDES } from '../constants/catalogos';

const ESTADOS = ['Parcial', 'Con evidencia', 'Sin evidencia', 'No verificado'];

export default function Auditoria() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState(null);
  const [q, setQ] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Parcial');
  const [filtroTipologia, setFiltroTipologia] = useState('');
  const [filtroAnio, setFiltroAnio] = useState('');
  const [filtroSede, setFiltroSede] = useState('');
  const [filtroAutor, setFiltroAutor] = useState('');
  const [autores, setAutores] = useState([]);
  const [total, setTotal] = useState(0);

  // Modal de validación
  const [seleccion, setSeleccion] = useState(null);
  const [form, setForm] = useState({ estado_evidencia: 'Con evidencia', observaciones_validacion: '' });
  const [guardando, setGuardando] = useState(false);

  const cargar = () => {
    setCargando(true);
    const params = {};
    if (q.trim()) params.q = q.trim();
    if (filtroEstado) params.estado = filtroEstado;
    if (filtroTipologia) params.tipologia = filtroTipologia;
    if (filtroAnio) params.anio = filtroAnio;
    if (filtroSede) params.sede = filtroSede;
    if (filtroAutor.trim()) params.autor = filtroAutor.trim();

    api
      .get('/investigacion/admin/todos', { params })
      .then(({ data }) => {
        setProductos(data.productos || []);
        setTotal(data.total || 0);
      })
      .catch((e) => setToast({ tipo: 'error', mensaje: msgError(e) }))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    const t = setTimeout(cargar, 300); // debounce
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filtroEstado, filtroTipologia, filtroAnio, filtroSede, filtroAutor]);

  // Autores de toda la matriz (todos los estados) para el autocompletado
  useEffect(() => {
    api
      .get('/investigacion/autores', { params: { todos: 1 } })
      .then(({ data }) => setAutores(data.autores || []))
      .catch(() => setAutores([]));
  }, []);

  const anios = useMemo(
    () => [...new Set(productos.map((p) => p.anio).filter(Boolean))].sort((a, b) => b - a),
    [productos]
  );

  const abrirModal = (p) => {
    setSeleccion(p);
    setForm({
      estado_evidencia: p.estado_evidencia || 'Parcial',
      observaciones_validacion: p.observaciones_validacion || '',
    });
  };

  const guardar = async () => {
    if (!seleccion) return;
    setGuardando(true);
    try {
      const { data } = await api.put(`/investigacion/${seleccion.id}/validar`, form);
      setToast({ tipo: 'success', mensaje: data.mensaje });
      setSeleccion(null);
      cargar();
    } catch (e) {
      setToast({ tipo: 'error', mensaje: msgError(e) });
    } finally {
      setGuardando(false);
    }
  };

  const conteoParcial = productos.filter((p) => p.estado_evidencia === 'Parcial').length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="antetitulo">
            Administración
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-udec-900 md:text-3xl">
            Auditoría y Validación
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Revisa los soportes adjuntos y actualiza el estado de evidencia:{' '}
            <b>Con evidencia</b> (verificado), <b>Sin evidencia</b> o <b>No verificado</b>,
            registrando tus observaciones de validación.
          </p>
        </div>
        <Link to="/panel/matriz-excel" className="btn-secundario">
          <Sheet size={16} /> Matriz Excel
        </Link>
      </div>

      {/* Resumen rápido */}
      <div className="escalonado mt-5 grid gap-3 sm:grid-cols-4">
        {[
          { label: 'Parcial (pendientes)', valor: conteoParcial, color: 'border-t-amber-500' },
          {
            label: 'Con evidencia',
            valor: productos.filter((p) => p.estado_evidencia === 'Con evidencia').length,
            color: 'border-t-udec-500',
          },
          {
            label: 'Sin evidencia',
            valor: productos.filter((p) => p.estado_evidencia === 'Sin evidencia').length,
            color: 'border-t-red-400',
          },
          {
            label: 'No verificados',
            valor: productos.filter((p) => p.estado_evidencia === 'No verificado').length,
            color: 'border-t-slate-400',
          },
        ].map((k) => (
          <div key={k.label} className={`tarjeta border-t-4 p-4 ${k.color}`}>
            <p className="text-2xl font-semibold text-udec-900">{k.valor}</p>
            <p className="text-[11px] font-semibold text-slate-500">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="mt-5 flex flex-wrap gap-3 rounded-xl border border-borde bg-white p-4 shadow-tarjeta">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar producto o proyecto…"
          className="campo !w-56"
        />
        <FiltroAutor valor={filtroAutor} onCambiar={setFiltroAutor} autores={autores} className="w-60" />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="campo !w-48"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
        <select
          value={filtroTipologia}
          onChange={(e) => setFiltroTipologia(e.target.value)}
          className="campo !w-56"
        >
          <option value="">Todas las tipologías</option>
          {TIPOLOGIAS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          value={filtroAnio}
          onChange={(e) => setFiltroAnio(e.target.value)}
          className="campo !w-32"
        >
          <option value="">Años</option>
          {anios.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <select
          value={filtroSede}
          onChange={(e) => setFiltroSede(e.target.value)}
          className="campo !w-44"
        >
          <option value="">Todas las sedes</option>
          {SEDES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <span className="ml-auto self-center text-xs text-slate-500">
          <b className="text-udec-900">{total}</b> registro(s)
        </span>
      </div>

      {/* Tabla */}
      <div className="mt-5 overflow-hidden rounded-xl border border-borde bg-white shadow-tarjeta">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="bg-udec-900 text-[11px] uppercase tracking-wider text-white">
                <th className="px-4 py-3 font-bold">Producto</th>
                <th className="px-4 py-3 font-bold">Investigador</th>
                <th className="px-4 py-3 font-bold">Año / Período</th>
                <th className="px-4 py-3 font-bold">Soporte</th>
                <th className="px-4 py-3 font-bold">Estado</th>
                <th className="px-4 py-3 text-right font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-udec-100 border-t-udec-700" />
                  </td>
                </tr>
              )}

              {!cargando && productos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
                    No hay productos que coincidan con los filtros.
                  </td>
                </tr>
              )}

              {!cargando &&
                productos.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-b border-borde/70 transition hover:bg-udec-50 ${
                      i % 2 ? 'bg-slate-50/60' : ''
                    }`}
                  >
                    <td className="max-w-[280px] px-4 py-3">
                      <p className="truncate font-semibold text-udec-900" title={p.nombre_producto}>
                        {p.nombre_producto}
                      </p>
                      <p className="truncate text-[11px] text-slate-400">
                        {p.tipologia}
                        {p.sub_tipologia ? ` · ${p.sub_tipologia}` : ''}
                      </p>
                      {p.observaciones_validacion && (
                        <p className="mt-1 flex items-center gap-1 truncate text-[11px] italic text-amber-700" title={p.observaciones_validacion}>
                          <MessageSquareText size={12} className="shrink-0" /> {p.observaciones_validacion}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <p className="font-medium">{p.autor_nombre || '—'}</p>
                      <p className="text-[11px] text-slate-400">{p.autor_sede || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <b className="text-udec-900">{p.anio || '—'}</b>
                      <p className="text-[11px] text-slate-400">{p.periodo_academico || 'NA'}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {p.evidencia ? (
                        <a
                          href={p.evidencia}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-udec-700 underline hover:text-udec-900"
                        >
                          <Paperclip size={12} /> Abrir soporte
                        </a>
                      ) : (
                        <span className="text-slate-300">Sin archivo</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={p.estado_evidencia} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link
                          to={`/panel/producto/${p.id}`}
                          className="rounded-lg border border-borde px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition hover:border-udec-500 hover:text-udec-900"
                        >
                          Ver
                        </Link>
                        <button
                          onClick={() => abrirModal(p)}
                          className="rounded-lg bg-udec-900 px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-udec-700"
                        >
                          Auditar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de auditoría */}
      {seleccion && (
        <div
          className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSeleccion(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            data-lenis-prevent
            className="max-h-[90vh] w-full max-w-2xl animate-scale-in overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-oro-600">
                  Auditoría institucional
                </p>
                <h2 className="mt-1 text-lg font-semibold leading-snug text-udec-900">
                  {seleccion.nombre_producto}
                </h2>
                <p className="text-xs text-slate-500">
                  {seleccion.tipologia} · {seleccion.anio || '—'} ·{' '}
                  {seleccion.autor_nombre || '—'}
                </p>
              </div>
              <button
                onClick={() => setSeleccion(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                aria-label="Cerrar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Soporte */}
            <div className="mt-4 rounded-xl border border-borde bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">
                Soporte / evidencia adjunta
              </p>
              {seleccion.evidencia ? (
                <a
                  href={seleccion.evidencia}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-udec-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-udec-700"
                >
                  <ExternalLink size={14} /> Abrir evidencia en nueva pestaña
                </a>
              ) : (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                  <TriangleAlert size={14} /> Este producto no tiene archivo de evidencia adjunto.
                </p>
              )}
            </div>

            {/* Formulario de validación */}
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="v-estado" className="campo-label">
                  Estado evidencia
                </label>
                <select
                  id="v-estado"
                  value={form.estado_evidencia}
                  onChange={(e) => setForm((f) => ({ ...f, estado_evidencia: e.target.value }))}
                  className="campo"
                >
                  {ESTADOS.map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  <b>Con evidencia</b> = verificado/aprobado · <b>Sin evidencia</b> = rechazado ·{' '}
                  <b>No verificado</b> = requiere nueva revisión · <b>Parcial</b> = sigue en cola.
                </p>
              </div>

              <div>
                <label htmlFor="v-obs" className="campo-label">
                  Observaciones de la validación
                </label>
                <textarea
                  id="v-obs"
                  rows={4}
                  value={form.observaciones_validacion}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, observaciones_validacion: e.target.value }))
                  }
                  placeholder="Ej. El DOI del artículo coincide con el registro. Soporte completo."
                  className="campo resize-y"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Link to={`/panel/producto/${seleccion.id}`} className="btn-secundario">
                Ver ficha completa
              </Link>
              <button onClick={() => setSeleccion(null)} className="btn-secundario">
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando} className="btn-primary">
                {guardando ? 'Guardando…' : 'Guardar validación'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onCerrar={() => setToast(null)} />
    </div>
  );
}
