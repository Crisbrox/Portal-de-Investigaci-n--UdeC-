/**
 * pages/IsuProyectos.jsx — Proyectos ISU (Interacción Social Universitaria).
 * El líder ve sus proyectos y sube sus entregables (video + informes 1 a 4);
 * el administrador ve todos, los revisa (Aprobado / Devuelto) y asigna responsables.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarClock,
  ExternalLink,
  FileUp,
  Link2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users2,
  X,
} from 'lucide-react';
import api, { msgError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const ESTADOS = ['Pendiente', 'Entregado', 'Aprobado', 'Devuelto'];
const ESTILO_ESTADO = {
  Pendiente: 'bg-slate-100 text-slate-500 border-slate-200',
  Entregado: 'bg-amber-50 text-amber-800 border-amber-300',
  Aprobado: 'bg-udec-100 text-udec-900 border-udec-500',
  Devuelto: 'bg-red-50 text-red-700 border-red-300',
};
const ENTREGABLES = [
  { clave: 'video', etiqueta: 'Video', corta: 'V' },
  { clave: 'informe_1', etiqueta: 'Informe 1', corta: '1' },
  { clave: 'informe_2', etiqueta: 'Informe 2', corta: '2' },
  { clave: 'informe_3', etiqueta: 'Informe 3', corta: '3' },
  { clave: 'informe_4', etiqueta: 'Informe 4', corta: '4' },
];

const esEnlace = (v) => /^https?:\/\//i.test(String(v || ''));

/* ------------------------------------------------------------------ */

function Fondo({ onCerrar, children, lado = false }) {
  return (
    <motion.div
      className={`fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm ${lado ? 'justify-end' : 'items-center justify-center p-4'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </motion.div>
  );
}

function FormProyecto({ inicial, periodos, responsables, esAdmin, onGuardar, onCerrar }) {
  const editando = Boolean(inicial.id);
  const [form, setForm] = useState({
    periodo: '',
    codigo: '',
    nombre: '',
    objetivos: '',
    poblacion: '',
    lider: '',
    asistencia_cdei: '',
    user_id: '',
    vigente: true,
    ...Object.fromEntries(Object.entries(inicial).map(([k, v]) => [k, v ?? ''])),
  });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const set = (c) => (e) => setForm((f) => ({ ...f, [c]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await onGuardar(form);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <Fondo onCerrar={onCerrar}>
      <motion.form
        data-lenis-prevent
        onSubmit={enviar}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold text-udec-900">{editando ? 'Editar proyecto ISU' : 'Nuevo proyecto ISU'}</h2>
          <button type="button" onClick={onCerrar} className="rounded p-1 text-slate-400 hover:bg-slate-100" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        {error && (
          <div role="alert" className="mt-4 rounded border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}
        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr]">
          <div>
            <label className="campo-label" htmlFor="i-periodo">Periodo</label>
            <input id="i-periodo" list="i-periodos" className="campo" value={form.periodo} onChange={set('periodo')} placeholder="2026-II" required />
            <datalist id="i-periodos">
              {periodos.map((p) => (
                <option key={p.periodo} value={p.periodo} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="campo-label" htmlFor="i-codigo">Código ISU PRO</label>
            <input id="i-codigo" className="campo" value={form.codigo} onChange={set('codigo')} placeholder="2026ISU-12" />
          </div>
        </div>
        <div className="mt-4">
          <label className="campo-label" htmlFor="i-nombre">Nombre del proyecto</label>
          <textarea id="i-nombre" rows={2} className="campo resize-y" value={form.nombre} onChange={set('nombre')} required />
        </div>
        <div className="mt-4">
          <label className="campo-label" htmlFor="i-obj">Objetivos</label>
          <textarea id="i-obj" rows={3} className="campo resize-y" value={form.objetivos} onChange={set('objetivos')} />
        </div>
        <div className="mt-4">
          <label className="campo-label" htmlFor="i-pob">Población</label>
          <textarea id="i-pob" rows={2} className="campo resize-y" value={form.poblacion} onChange={set('poblacion')} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="campo-label" htmlFor="i-lider">Líder del proyecto</label>
            <input id="i-lider" className="campo" value={form.lider} onChange={set('lider')} placeholder={esAdmin ? '' : 'Tu nombre'} />
          </div>
          <div>
            <label className="campo-label" htmlFor="i-cdei">Asistencia CDEI</label>
            <input id="i-cdei" className="campo" value={form.asistencia_cdei} onChange={set('asistencia_cdei')} placeholder="Fechas de asistencia" />
          </div>
        </div>
        {esAdmin && (
          <div className="mt-4 grid gap-4 rounded border border-borde bg-fondo p-4 sm:grid-cols-2">
            <div>
              <label className="campo-label" htmlFor="i-resp">Responsable en el portal</label>
              <select id="i-resp" className="campo" value={form.user_id || ''} onChange={set('user_id')}>
                <option value="">Sin asignar</option>
                {responsables.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre_completo}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">El líder ISU asignado podrá subir los entregables.</p>
            </div>
            <label className="flex items-center gap-2 self-center text-sm text-slate-700">
              <input type="checkbox" checked={Boolean(form.vigente)} onChange={set('vigente')} className="h-4 w-4 accent-udec-800" />
              Proyecto vigente (desmárcalo si "no va")
            </label>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCerrar} className="btn-secundario">Cancelar</button>
          <button type="submit" disabled={enviando} className="btn-primary">
            {enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Registrar proyecto'}
          </button>
        </div>
      </motion.form>
    </Fondo>
  );
}

/** Un entregable: estado, evidencia, carga (líder) y revisión (admin). */
function Entregable({ p, e, esAdmin, revision, setRevision, onSubir, onQuitar }) {
  const estado = p[`${e.clave}_estado`];
  const evidencia = p[`${e.clave}_evidencia`];
  const [modo, setModo] = useState(e.clave === 'video' ? 'enlace' : 'archivo');
  const [enlace, setEnlace] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const bloqueado = !esAdmin && estado === 'Aprobado';

  const subir = async (archivo) => {
    setSubiendo(true);
    try {
      await onSubir(e.clave, archivo ? { archivo } : { enlace });
      setEnlace('');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <li className="rounded-md border border-borde bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-slate-800">{e.etiqueta}</p>
        {esAdmin ? (
          <select
            value={revision[`${e.clave}_estado`] ?? estado}
            onChange={(ev) => setRevision((r) => ({ ...r, [`${e.clave}_estado`]: ev.target.value }))}
            className={`rounded border px-2 py-1 text-xs font-semibold ${ESTILO_ESTADO[revision[`${e.clave}_estado`] ?? estado]}`}
            aria-label={`Estado de ${e.etiqueta}`}
          >
            {ESTADOS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        ) : (
          <span className={`badge border ${ESTILO_ESTADO[estado]}`}>{estado}</span>
        )}
      </div>

      {evidencia && (
        <a
          href={evidencia}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex max-w-full items-center gap-1.5 text-sm text-udec-800 underline"
        >
          {esEnlace(evidencia) ? <Link2 size={14} /> : <ExternalLink size={14} />}
          <span className="truncate">{esEnlace(evidencia) ? evidencia : evidencia.split('/').pop()}</span>
        </a>
      )}
      {evidencia && (
        <button
          type="button"
          onClick={() => onQuitar(e)}
          className="mt-1 flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-red-700"
        >
          <Trash2 size={12} /> Quitar entregable
        </button>
      )}

      {!bloqueado && (
        <div className="mt-3 border-t border-borde pt-3">
          <div className="mb-2 flex gap-3 text-xs">
            {['archivo', 'enlace'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModo(m)}
                className={`font-semibold ${modo === m ? 'text-udec-900 underline decoration-oro-500 decoration-2 underline-offset-4' : 'text-slate-500'}`}
              >
                {m === 'archivo' ? 'Subir archivo' : 'Pegar enlace'}
              </button>
            ))}
          </div>
          {modo === 'archivo' ? (
            <label className={`btn-secundario w-full cursor-pointer !py-2 text-xs ${subiendo ? 'pointer-events-none opacity-60' : ''}`}>
              <FileUp size={15} />
              {subiendo ? 'Subiendo…' : evidencia ? 'Reemplazar archivo' : 'Elegir archivo'}
              <input
                type="file"
                className="sr-only"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.jpg,.jpeg,.png,.webp,.mp4,.mov,.webm"
                onChange={(ev) => ev.target.files?.[0] && subir(ev.target.files[0])}
              />
            </label>
          ) : (
            <div className="flex gap-2">
              <input
                value={enlace}
                onChange={(ev) => setEnlace(ev.target.value)}
                placeholder="https://drive.google.com/…"
                className="campo !py-2 text-xs"
              />
              <button type="button" disabled={!enlace || subiendo} onClick={() => subir(null)} className="btn-primary !px-3 !py-2 text-xs">
                Entregar
              </button>
            </div>
          )}
        </div>
      )}
      {bloqueado && <p className="mt-2 text-xs text-udec-700">Aprobado por la administración.</p>}
    </li>
  );
}

function Detalle({ id, esAdmin, onCerrar, onEditar, onCambio, onEliminar, setToast }) {
  const [p, setP] = useState(null);
  const [revision, setRevision] = useState({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    api
      .get(`/isu/proyectos/${id}`)
      .then(({ data }) => {
        setP(data.proyecto);
        setRevision({ observaciones: data.proyecto.observaciones || '' });
      })
      .catch((err) => setToast({ tipo: 'error', mensaje: msgError(err) }));
  }, [id, setToast]);

  const subir = async (tipo, { archivo, enlace }) => {
    const fd = new FormData();
    if (archivo) fd.append('archivo', archivo);
    if (enlace) fd.append('enlace', enlace);
    try {
      const { data } = await api.post(`/isu/proyectos/${id}/entregas/${tipo}`, fd, { timeout: 300000 });
      setP(data.proyecto);
      setToast({ tipo: 'success', mensaje: data.mensaje });
      onCambio(data.proyecto);
    } catch (err) {
      setToast({ tipo: 'error', mensaje: msgError(err) });
    }
  };

  const quitar = async (e) => {
    if (!window.confirm(`¿Quitar el ${e.etiqueta.toLowerCase()} entregado? Volverá a quedar pendiente.`)) return;
    try {
      const { data } = await api.delete(`/isu/proyectos/${id}/entregas/${e.clave}`);
      setP(data.proyecto);
      setToast({ tipo: 'success', mensaje: data.mensaje });
      onCambio(data.proyecto);
    } catch (err) {
      setToast({ tipo: 'error', mensaje: msgError(err) });
    }
  };

  const guardarRevision = async () => {
    setGuardando(true);
    try {
      const { data } = await api.put(`/isu/proyectos/${id}/revision`, revision);
      setP(data.proyecto);
      setToast({ tipo: 'success', mensaje: data.mensaje });
      onCambio(data.proyecto);
    } catch (err) {
      setToast({ tipo: 'error', mensaje: msgError(err) });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Fondo onCerrar={onCerrar} lado>
      <motion.aside
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-fondo shadow-xl"
      >
        {!p ? (
          <div className="space-y-3 p-6">
            <div className="esqueleto h-8 w-40" />
            <div className="esqueleto h-24" />
          </div>
        ) : (
          <>
            <div className="sticky top-0 z-10 border-b border-borde bg-white px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-udec-700">
                    {p.codigo || 'Sin código'} · {p.periodo}
                    {!p.vigente && <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-slate-600">No va</span>}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold leading-snug text-udec-900">{p.nombre}</h2>
                </div>
                <button onClick={onCerrar} className="rounded p-2 text-slate-400 hover:bg-slate-100" aria-label="Cerrar">
                  <X size={20} />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1">
                <button onClick={() => onEditar(p)} className="enlace text-sm">
                  <Pencil size={14} /> Editar datos
                </button>
                <button
                  onClick={() => onEliminar(p)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-800"
                >
                  <Trash2 size={14} /> Eliminar proyecto
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-slate-500">Líder del proyecto</dt>
                  <dd className="font-semibold text-slate-800">{p.lider || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Responsable en el portal</dt>
                  <dd className="text-slate-800">{p.responsable_nombre || 'Sin asignar'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-slate-500">Objetivos</dt>
                  <dd className="whitespace-pre-line text-slate-700">{p.objetivos || '—'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-slate-500">Población</dt>
                  <dd className="whitespace-pre-line text-slate-700">{p.poblacion || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Asistencia CDEI</dt>
                  <dd className="text-slate-700">{p.asistencia_cdei || '—'}</dd>
                </div>
              </dl>

              <section>
                <h3 className="font-serif text-lg font-semibold text-udec-900">Entregables</h3>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {ENTREGABLES.map((e) => (
                    <Entregable key={e.clave} p={p} e={e} esAdmin={esAdmin} revision={revision} setRevision={setRevision} onSubir={subir} onQuitar={quitar} />
                  ))}
                </ul>
              </section>

              {esAdmin ? (
                <section className="rounded-md border border-borde bg-white p-4">
                  <label className="campo-label" htmlFor="i-obs">Observaciones de la revisión</label>
                  <textarea
                    id="i-obs"
                    rows={3}
                    className="campo resize-y"
                    value={revision.observaciones ?? ''}
                    onChange={(e) => setRevision((r) => ({ ...r, observaciones: e.target.value }))}
                    placeholder="Ej. El informe 2 no tiene la lista de asistencia; por favor súbelo de nuevo."
                  />
                  <button onClick={guardarRevision} disabled={guardando} className="btn-primary mt-3">
                    {guardando ? 'Guardando…' : 'Guardar revisión'}
                  </button>
                </section>
              ) : (
                p.observaciones && (
                  <section className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-semibold">Observaciones de la administración</p>
                    <p className="mt-1 whitespace-pre-line">{p.observaciones}</p>
                  </section>
                )
              )}
            </div>
          </>
        )}
      </motion.aside>
    </Fondo>
  );
}

/* ------------------------------------------------------------------ */

export default function IsuProyectos() {
  const { usuario, esAdmin } = useAuth();
  const [params, setParams] = useSearchParams();
  const [periodos, setPeriodos] = useState([]);
  const [periodo, setPeriodo] = useState('');
  const [proyectos, setProyectos] = useState(null);
  const [responsables, setResponsables] = useState([]);
  const [filtros, setFiltros] = useState({ q: '', vigente: '1', estado: '' });
  const [detalle, setDetalle] = useState(null);
  const [formulario, setFormulario] = useState(null);
  const [toast, setToast] = useState(null);

  const cargarPeriodos = useCallback(async () => {
    const { data } = await api.get('/isu/periodos');
    setPeriodos(data.periodos);
    // Por defecto el periodo en curso (enero-junio = I, julio-diciembre = II); si no existe, el más reciente con proyectos
    const hoy = new Date();
    const enCurso = `${hoy.getFullYear()}-${hoy.getMonth() < 6 ? 'I' : 'II'}`;
    setPeriodo(
      (actual) =>
        actual ||
        data.periodos.find((p) => p.periodo === enCurso && p.proyectos > 0)?.periodo ||
        data.periodos.find((p) => p.proyectos > 0)?.periodo ||
        data.periodos[0]?.periodo ||
        ''
    );
  }, []);

  const cargar = useCallback(async () => {
    try {
      const { data } = await api.get('/isu/proyectos', {
        params: {
          periodo: periodo || undefined,
          q: filtros.q || undefined,
          vigente: filtros.vigente || undefined,
          estado: filtros.estado || undefined,
        },
      });
      setProyectos(data.proyectos);
    } catch (err) {
      setToast({ tipo: 'error', mensaje: msgError(err) });
      setProyectos([]);
    }
  }, [periodo, filtros]);

  useEffect(() => {
    cargarPeriodos().catch((err) => setToast({ tipo: 'error', mensaje: msgError(err) }));
    if (esAdmin) {
      api
        .get('/usuarios', { params: { rol: 'ISU', activo: 1 } })
        .then(({ data }) => setResponsables(data.usuarios))
        .catch(() => setResponsables([]));
    }
  }, [cargarPeriodos, esAdmin]);

  useEffect(() => {
    const t = setTimeout(cargar, 250);
    return () => clearTimeout(t);
  }, [cargar]);

  // ?nuevo=1 (desde el botón del encabezado del panel) abre el formulario
  useEffect(() => {
    if (params.get('nuevo') === '1') {
      setFormulario({ periodo, lider: esAdmin ? '' : usuario?.nombre_completo });
      setParams({}, { replace: true });
    }
  }, [params, setParams, periodo, esAdmin, usuario]);

  const datosPeriodo = periodos.find((p) => p.periodo === periodo);
  const setFiltro = (c) => (e) => setFiltros((f) => ({ ...f, [c]: e.target.value }));

  const resumen = useMemo(() => {
    const lista = proyectos || [];
    const contar = (estado) =>
      lista.reduce((s, p) => s + ENTREGABLES.filter((e) => p[`${e.clave}_estado`] === estado).length, 0);
    return { proyectos: lista.length, entregados: contar('Entregado'), aprobados: contar('Aprobado'), devueltos: contar('Devuelto') };
  }, [proyectos]);

  const guardarProyecto = async (form) => {
    const { data } = formulario.id
      ? await api.put(`/isu/proyectos/${formulario.id}`, form)
      : await api.post('/isu/proyectos', form);
    setToast({ tipo: 'success', mensaje: data.mensaje });
    setFormulario(null);
    await cargarPeriodos();
    cargar();
  };

  /** Devuelve true si se eliminó (para cerrar el detalle). */
  const eliminar = async (p) => {
    if (!window.confirm(`¿Eliminar el proyecto "${p.nombre}" con todos sus entregables? Esta acción no se puede deshacer.`)) {
      return false;
    }
    try {
      const { data } = await api.delete(`/isu/proyectos/${p.id}`);
      setToast({ tipo: 'success', mensaje: data.mensaje });
      cargar();
      cargarPeriodos().catch(() => {});
      return true;
    } catch (err) {
      setToast({ tipo: 'error', mensaje: msgError(err) });
      return false;
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="antetitulo">Interacción Social Universitaria</p>
          <h1 className="mt-3 text-2xl font-semibold text-udec-900 md:text-3xl">
            {esAdmin ? 'Seguimiento de proyectos ISU' : 'Mis proyectos ISU'}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            {esAdmin
              ? 'Revisa los entregables de cada proyecto (video e informes 1 a 4) y márcalos como aprobados o devueltos.'
              : 'Sube el video y los informes de tus proyectos. La administración los revisa y te deja observaciones.'}
          </p>
        </div>
        <button
          onClick={() => setFormulario({ periodo, lider: esAdmin ? '' : usuario?.nombre_completo })}
          className="btn-primary group"
        >
          <Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" /> Nuevo proyecto
        </button>
      </div>

      {/* Periodos */}
      {periodos.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-1 border-b border-borde">
          {periodos.map((p) => (
            <button
              key={p.periodo}
              onClick={() => setPeriodo(p.periodo)}
              className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
                periodo === p.periodo ? 'text-udec-900' : 'text-slate-500 hover:text-udec-800'
              }`}
            >
              {p.periodo}
              <span className="ml-1.5 text-xs font-normal text-slate-400">{p.proyectos}</span>
              {periodo === p.periodo && <motion.span layoutId="pestana-isu" className="absolute inset-x-0 -bottom-px h-[3px] bg-oro-500" />}
            </button>
          ))}
        </div>
      )}

      {/* Fechas límite del periodo */}
      {datosPeriodo && [1, 2, 3, 4].some((n) => datosPeriodo[`fecha_informe_${n}`]) && (
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md border border-borde bg-white px-4 py-3 text-sm">
          <span className="flex items-center gap-2 font-semibold text-udec-900">
            <CalendarClock size={16} /> Fechas de entrega
          </span>
          {[1, 2, 3, 4].map((n) => (
            <span key={n} className="text-slate-600">
              Informe {n}: <b className="text-slate-800">{datosPeriodo[`fecha_informe_${n}`] || '—'}</b>
            </span>
          ))}
        </div>
      )}

      {/* Resumen */}
      <div className="mt-4 grid grid-cols-2 divide-borde rounded-md border border-borde bg-white sm:grid-cols-4 sm:divide-x">
        {[
          ['Proyectos', resumen.proyectos, 'text-udec-900'],
          ['Por revisar', resumen.entregados, 'text-amber-700'],
          ['Aprobados', resumen.aprobados, 'text-udec-700'],
          ['Devueltos', resumen.devueltos, 'text-red-700'],
        ].map(([t, v, c]) => (
          <div key={t} className="p-4">
            <p className={`font-serif text-2xl font-semibold ${c}`}>{v}</p>
            <p className="text-xs text-slate-500">{t}{t !== 'Proyectos' ? ' (entregables)' : ''}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="mt-4 grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
        <label className="relative block">
          <span className="sr-only">Buscar</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={filtros.q} onChange={setFiltro('q')} placeholder="Proyecto, código, líder o población" className="campo !pl-9" />
        </label>
        <select value={filtros.vigente} onChange={setFiltro('vigente')} className="campo" aria-label="Vigencia">
          <option value="1">Vigentes</option>
          <option value="0">No van</option>
          <option value="">Todos</option>
        </select>
        <select value={filtros.estado} onChange={setFiltro('estado')} className="campo" aria-label="Estado de entregables">
          <option value="">Cualquier estado</option>
          <option value="Entregado">Con entregables por revisar</option>
          <option value="Devuelto">Con entregables devueltos</option>
          <option value="Pendiente">Con entregables pendientes</option>
          <option value="Aprobado">Con entregables aprobados</option>
        </select>
      </div>

      {/* Lista */}
      {proyectos === null ? (
        <div className="mt-5 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="esqueleto h-24" />
          ))}
        </div>
      ) : proyectos.length === 0 ? (
        <div className="mt-6 rounded-lg border-2 border-dashed border-slate-300 py-14 text-center">
          <Users2 size={36} className="mx-auto text-udec-700" strokeWidth={1.5} />
          <p className="mt-3 font-serif text-xl font-semibold text-udec-900">No hay proyectos con esos filtros</p>
          <p className="mt-1 text-sm text-slate-500">
            {esAdmin
              ? 'Importa la Matriz ISU desde "Matriz ISU (Excel)" o registra un proyecto.'
              : 'Si eres líder de un proyecto de la matriz y no lo ves, pide a la administración que te lo asigne.'}
          </p>
        </div>
      ) : (
        <motion.ul layout className="mt-5 space-y-3">
          <AnimatePresence initial={false}>
            {proyectos.map((p) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`group rounded-md border border-borde bg-white transition-shadow hover:shadow-tarjeta-hover ${p.vigente ? '' : 'opacity-70'}`}
              >
                <div className="flex flex-wrap items-start gap-4 p-4">
                  <button onClick={() => setDetalle(p.id)} className="min-w-0 flex-1 text-left" data-cursor="Abrir">
                    <p className="text-xs font-semibold text-udec-700">
                      {p.codigo || 'Sin código'}
                      {!p.vigente && <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 text-slate-600">No va</span>}
                    </p>
                    <p className="mt-1 line-clamp-2 font-semibold leading-snug text-slate-800 group-hover:text-udec-800">{p.nombre}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {p.lider || 'Sin líder'}
                      {esAdmin && !p.user_id && <span className="ml-2 text-xs text-amber-700">· sin responsable en el portal</span>}
                    </p>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {ENTREGABLES.map((e) => (
                      <span
                        key={e.clave}
                        title={`${e.etiqueta}: ${p[`${e.clave}_estado`]}`}
                        className={`flex h-8 w-8 items-center justify-center rounded border text-xs font-bold ${ESTILO_ESTADO[p[`${e.clave}_estado`]]}`}
                      >
                        {e.corta}
                      </span>
                    ))}
                    {(esAdmin || p.user_id === usuario?.id) && (
                      <button onClick={() => eliminar(p)} className="ml-1 rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-700" aria-label={`Eliminar ${p.nombre}`}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="h-1 overflow-hidden rounded-b-md bg-slate-100">
                  <motion.div
                    className="h-full origin-left bg-udec-700"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: p.avance.entregados / p.avance.total }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        {ESTADOS.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded border ${ESTILO_ESTADO[s]}`} /> {s}
          </span>
        ))}
        <span>· V = Video, 1-4 = Informes</span>
      </p>

      <AnimatePresence>
        {detalle && (
          <Detalle
            key="detalle"
            id={detalle}
            esAdmin={esAdmin}
            setToast={setToast}
            onCerrar={() => setDetalle(null)}
            onEditar={(p) => {
              setDetalle(null);
              setFormulario(p);
            }}
            onCambio={(p) => setProyectos((lista) => lista?.map((x) => (x.id === p.id ? p : x)))}
            onEliminar={async (p) => {
              if (await eliminar(p)) setDetalle(null);
            }}
          />
        )}
        {formulario && (
          <FormProyecto
            key="form"
            inicial={formulario}
            periodos={periodos}
            responsables={responsables}
            esAdmin={esAdmin}
            onGuardar={guardarProyecto}
            onCerrar={() => setFormulario(null)}
          />
        )}
      </AnimatePresence>

      <Toast toast={toast} onCerrar={() => setToast(null)} />
    </div>
  );
}
