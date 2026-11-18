/**
 * pages/RegistrarProducto.jsx
 * Formulario de producto de investigación dividido en 4 pasos (Stepper)
 * con barra de progreso, validación de obligatorios, borrador local
 * y envío directo (estado automático 'Parcial').
 *
 * Paso 1: Clasificación      (tipología, sub-tipología, clasificación, nombre…)
 * Paso 2: Fechas y publicación
 * Paso 3: Autoría y colaboradores
 * Paso 4: Evidencia y envío
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Paperclip, Save } from 'lucide-react';
import { Clock } from 'lucide-react';
import api, { msgError } from '../services/api';
import Stepper from '../components/Stepper';
import EstadoBadge from '../components/EstadoBadge';
import Toast from '../components/Toast';
import {
  TIPOLOGIAS,
  SUB_TIPOLOGIAS,
  CLASIFICACIONES_POR_SUBTIPOLOGIA,
  generarPeriodos,
  generarAnios,
} from '../constants/catalogos';

const PASOS = [
  { titulo: 'Clasificación' },
  { titulo: 'Fechas y publicación' },
  { titulo: 'Autoría y colaboradores' },
  { titulo: 'Evidencia y envío' },
];

const VACIO = {
  tipologia: '',
  sub_tipologia: '',
  clasificacion: '',
  nombre_producto: '',
  titulo_libro_evento: '',
  medio_verificacion: '',
  anio: '',
  periodo_academico: 'NA',
  fecha_publicacion: '',
  fecha_inicio: '',
  fecha_fin: '',
  editorial: '',
  instituciones_participantes: '',
  proyecto_investigacion: '',
  revista_libro_issn_isbn: '',
  volumen: '',
  ciudad_municipio: '',
  tipo_formato_producto: '',
  estudiante_orientado_1: '',
  estudiante_orientado_2: '',
  estudiante_orientado_3: '',
  sitio_web_doi: '',
  numero_paginas: '',
  autor_asesor_1: '',
  autor_asesor_2: '',
  autor_asesor_3: '',
  otros_autores: '',
  reconocimientos: '',
  evidencia: '',
};

const CLAVE_BORRADOR = 'udec_borrador_producto';

function Campo({ label, requerido, error, children, ayuda }) {
  return (
    <div>
      <label className="campo-label">
        {label}
        {requerido && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {ayuda && !error && <p className="mt-1 text-[11px] text-slate-400">{ayuda}</p>}
      {error && <p className="campo-error">{error}</p>}
    </div>
  );
}

export default function RegistrarProducto() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editarId = params.get('editar');

  const [paso, setPaso] = useState(0);
  const [form, setForm] = useState(VACIO);
  const [archivo, setArchivo] = useState(null);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState(null);
  const [cargandoEdicion, setCargandoEdicion] = useState(Boolean(editarId));
  const [productoActual, setProductoActual] = useState(null);
  const [hayBorrador, setHayBorrador] = useState(false);

  // Cargar producto a editar
  useEffect(() => {
    // Misma ruta con distinto ?editar: se reinicia el formulario para no arrastrar datos
    setPaso(0);
    setErrores({});
    setArchivo(null);
    setProductoActual(null);
    setForm(VACIO);
    if (!editarId) {
      // ¿Hay borrador guardado?
      const b = localStorage.getItem(CLAVE_BORRADOR);
      if (b) setHayBorrador(true);
      return;
    }
    setCargandoEdicion(true);
    api
      .get(`/investigacion/${editarId}`)
      .then(({ data }) => {
        const p = data.producto;
        setProductoActual(p);
        setForm((f) => ({
          ...f,
          ...Object.fromEntries(
            Object.keys(VACIO).map((k) => [k, p[k] === null || p[k] === undefined ? '' : p[k]])
          ),
          anio: p.anio || '',
          periodo_academico: p.periodo_academico || 'NA',
        }));
      })
      .catch((e) => {
        setToast({ tipo: 'error', mensaje: msgError(e) });
      })
      .finally(() => setCargandoEdicion(false));
  }, [editarId]);

  const set = (campo) => (e) => {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => {
      const nuevo = { ...f, [campo]: valor };
      // Cambios encadenados
      if (campo === 'tipologia') {
        nuevo.sub_tipologia = '';
        nuevo.clasificacion = '';
      }
      if (campo === 'sub_tipologia') nuevo.clasificacion = '';
      return nuevo;
    });
    setErrores((er) => ({ ...er, [campo]: undefined }));
  };

  const subTipologias = useMemo(
    () => (form.tipologia ? SUB_TIPOLOGIAS[form.tipologia] || [] : []),
    [form.tipologia]
  );
  const clasificaciones = useMemo(() => {
    if (!form.sub_tipologia) return [];
    const lista = CLASIFICACIONES_POR_SUBTIPOLOGIA[form.sub_tipologia] || [];
    return lista.includes('Otro') ? lista : [...lista, 'Otro'];
  }, [form.sub_tipologia]);

  // ---------- Validación por paso ----------
  const validarPaso = (indice) => {
    const e = {};
    if (indice === 0) {
      if (!form.tipologia) e.tipologia = 'Selecciona la tipología (obligatoria).';
      if (!form.sub_tipologia) e.sub_tipologia = 'Selecciona la sub-tipología (obligatoria).';
      if (!form.nombre_producto.trim())
        e.nombre_producto = 'El nombre del producto/título es obligatorio.';
    }
    if (indice === 1) {
      if (!form.anio) e.anio = 'El año es obligatorio.';
      else if (Number(form.anio) < 2019 || Number(form.anio) > 2027)
        e.anio = 'El año debe estar entre 2019 y 2027.';
      if (!form.periodo_academico) e.periodo_academico = 'Selecciona el período (o NA).';
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const irAPaso = (i) => {
    if (i > paso) {
      for (let k = 0; k < i; k++) {
        if (!validarPaso(k)) {
          setPaso(k);
          setToast({ tipo: 'error', mensaje: 'Completa los campos obligatorios del paso actual.' });
          return;
        }
      }
    }
    setPaso(i);
  };

  const siguiente = () => {
    if (!validarPaso(paso)) {
      setToast({ tipo: 'error', mensaje: 'Completa los campos obligatorios para continuar.' });
      return;
    }
    setPaso((p) => Math.min(p + 1, PASOS.length - 1));
  };

  const anterior = () => setPaso((p) => Math.max(p - 1, 0));

  // ---------- Borrador ----------
  const guardarBorrador = () => {
    localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(form));
    setHayBorrador(true);
    setToast({ tipo: 'success', mensaje: 'Borrador guardado en este navegador.' });
  };

  const recuperarBorrador = () => {
    const b = localStorage.getItem(CLAVE_BORRADOR);
    if (!b) return;
    try {
      setForm({ ...VACIO, ...JSON.parse(b) });
      setHayBorrador(false);
      setToast({ tipo: 'info', mensaje: 'Borrador recuperado.' });
    } catch {
      localStorage.removeItem(CLAVE_BORRADOR);
    }
  };

  const descartarBorrador = () => {
    localStorage.removeItem(CLAVE_BORRADOR);
    setHayBorrador(false);
    setToast({ tipo: 'info', mensaje: 'Borrador descartado.' });
  };

  // ---------- Envío ----------
  const enviar = async (e) => {
    e.preventDefault();
    // Solo se guarda desde el último paso (evidencia); un Enter en pasos anteriores avanza
    if (paso < PASOS.length - 1) {
      siguiente();
      return;
    }
    // Validar todos los pasos
    for (let k = 0; k <= 1; k++) {
      if (!validarPaso(k)) {
        setPaso(k);
        setToast({ tipo: 'error', mensaje: 'Revisa los campos obligatorios.' });
        return;
      }
    }
    if (!form.autor_asesor_1.trim() && !form.otros_autores.trim()) {
      setPaso(2);
      setToast({
        tipo: 'error',
        mensaje: 'Indica al menos un autor/asesor u otros autores.',
      });
      return;
    }

    setEnviando(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
      if (archivo) fd.append('archivo_evidencia', archivo);

      if (editarId) {
        const { data } = await api.put(`/investigacion/${editarId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setToast({ tipo: 'success', mensaje: data.mensaje });
      } else {
        const { data } = await api.post('/investigacion', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setToast({ tipo: 'success', mensaje: data.mensaje });
        localStorage.removeItem(CLAVE_BORRADOR);
        setHayBorrador(false);
      }
      setTimeout(() => navigate('/panel/mis-productos'), 1400);
    } catch (err) {
      setToast({ tipo: 'error', mensaje: msgError(err) });
    } finally {
      setEnviando(false);
    }
  };

  if (cargandoEdicion) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-udec-100 border-t-udec-700" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-serif text-base font-semibold text-udec-900">
            {editarId ? 'Edición de producto' : 'Nuevo registro'}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-udec-900 md:text-3xl">
            {editarId ? 'Editar Producto de Investigación' : 'Registrar Producto de Investigación'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Formulario con las 31 columnas exactas de la matriz institucional.
          </p>
        </div>
        {productoActual && <EstadoBadge estado={productoActual.estado_evidencia} />}
      </div>

      {/* Aviso de estado */}
      {!editarId && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
          <Clock size={18} className="mt-0.5 shrink-0 animate-pulse text-amber-600" />
          <p className="text-xs leading-relaxed text-amber-800">
            Al enviar, el producto quedará automáticamente en estado{' '}
            <b className="badge bg-amber-200 text-amber-900">Parcial</b> —representando un
            producto registrado pendiente de revisión— y permanecerá <b>bloqueado para edición</b>{' '}
            hasta que un Administrador lo audite (Con evidencia / Sin evidencia / No verificado).
          </p>
        </div>
      )}

      {/* Recuperar borrador */}
      {!editarId && hayBorrador && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-borde bg-white px-4 py-3 shadow-tarjeta">
          <p className="flex-1 text-xs font-medium text-slate-600">
            Tienes un <b>borrador guardado</b> en este navegador.
          </p>
          <button type="button" onClick={recuperarBorrador} className="btn-primary !py-2 text-xs">
            Recuperar
          </button>
          <button
            type="button"
            onClick={descartarBorrador}
            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
          >
            Descartar
          </button>
        </div>
      )}

      <form onSubmit={enviar} className="mt-6">
        <div className="rounded-lg border border-borde bg-white p-5 shadow-tarjeta md:p-7">
          <Stepper pasos={PASOS} actual={paso} onIr={irAPaso} />

          {/* ---------- PASO 1 ---------- */}
          {paso === 0 && (
            <div className="grid animate-slide-in gap-4 md:grid-cols-2">
              <Campo label="Tipología" requerido error={errores.tipologia}>
                <select value={form.tipologia} onChange={set('tipologia')} className="campo">
                  <option value="">Selecciona…</option>
                  {TIPOLOGIAS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Campo>

              <Campo label="Sub-tipología" requerido error={errores.sub_tipologia}>
                <select
                  value={form.sub_tipologia}
                  onChange={set('sub_tipologia')}
                  className="campo"
                  disabled={!form.tipologia}
                >
                  <option value="">
                    {form.tipologia ? 'Selecciona…' : 'Primero elige la tipología'}
                  </option>
                  {subTipologias.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Campo>

              <Campo label="Clasificación">
                <select
                  value={form.clasificacion}
                  onChange={set('clasificacion')}
                  className="campo"
                  disabled={!form.sub_tipologia}
                >
                  <option value="">
                    {form.sub_tipologia ? 'Selecciona…' : 'Primero elige la sub-tipología'}
                  </option>
                  {clasificaciones.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Campo>

              <Campo label="Tipo de formato o producto">
                <input
                  type="text"
                  value={form.tipo_formato_producto}
                  onChange={set('tipo_formato_producto')}
                  placeholder="Ej. Artículo, libro, software…"
                  className="campo"
                />
              </Campo>

              <div className="md:col-span-2">
                <Campo
                  label="Nombre del trabajo / producto / título del libro / título capítulo libro / evento"
                  requerido
                  error={errores.nombre_producto}
                >
                  <textarea
                    value={form.nombre_producto}
                    onChange={set('nombre_producto')}
                    rows={2}
                    placeholder="Ej. Aplicación móvil para trazabilidad de cultivos en la sabana de Bogotá"
                    className="campo resize-y"
                  />
                </Campo>
              </div>

              <Campo label="Título del libro del cual hace parte el capítulo / ponencia">
                <input
                  type="text"
                  value={form.titulo_libro_evento}
                  onChange={set('titulo_libro_evento')}
                  className="campo"
                />
              </Campo>

              <Campo label="Medio de verificación (si aplica)">
                <input
                  type="text"
                  value={form.medio_verificacion}
                  onChange={set('medio_verificacion')}
                  placeholder="Ej. DOI, carta de aceptación, certificado…"
                  className="campo"
                />
              </Campo>
            </div>
          )}

          {/* ---------- PASO 2 ---------- */}
          {paso === 1 && (
            <div className="grid animate-slide-in gap-4 md:grid-cols-2">
              <Campo label="Año" requerido error={errores.anio}>
                <select value={form.anio} onChange={set('anio')} className="campo">
                  <option value="">Selecciona…</option>
                  {generarAnios().map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo
                label="Período académico"
                requerido
                error={errores.periodo_academico}
                ayuda="Formato IPA-AAAA, IIPA-AAAA o NA"
              >
                <select
                  value={form.periodo_academico}
                  onChange={set('periodo_academico')}
                  className="campo"
                >
                  {generarPeriodos().map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Campo>

              <Campo label="Fecha o fecha de publicación">
                <input
                  type="date"
                  value={form.fecha_publicacion}
                  onChange={set('fecha_publicacion')}
                  className="campo"
                />
              </Campo>

              <Campo label="Fecha de inicio">
                <input
                  type="date"
                  value={form.fecha_inicio}
                  onChange={set('fecha_inicio')}
                  className="campo"
                />
              </Campo>

              <Campo label="Fecha de fin">
                <input
                  type="date"
                  value={form.fecha_fin}
                  onChange={set('fecha_fin')}
                  className="campo"
                />
              </Campo>

              <Campo label="Editorial">
                <input type="text" value={form.editorial} onChange={set('editorial')} className="campo" />
              </Campo>

              <Campo label="Revista - libro / ISSN - ISBN">
                <input
                  type="text"
                  value={form.revista_libro_issn_isbn}
                  onChange={set('revista_libro_issn_isbn')}
                  placeholder="Ej. ISSN 0123-4567"
                  className="campo"
                />
              </Campo>

              <Campo label="Volumen">
                <input type="text" value={form.volumen} onChange={set('volumen')} className="campo" />
              </Campo>

              <Campo label="Ciudad o municipio">
                <input
                  type="text"
                  value={form.ciudad_municipio}
                  onChange={set('ciudad_municipio')}
                  placeholder="Ej. Fusagasugá"
                  className="campo"
                />
              </Campo>

              <Campo label="Sitio web o DOI">
                <input
                  type="text"
                  value={form.sitio_web_doi}
                  onChange={set('sitio_web_doi')}
                  placeholder="https://… o 10.xxxx/xxxxx"
                  className="campo"
                />
              </Campo>

              <Campo label="No. páginas">
                <input
                  type="text"
                  value={form.numero_paginas}
                  onChange={set('numero_paginas')}
                  placeholder="Ej. 1-15"
                  className="campo"
                />
              </Campo>

              <Campo label="Proyecto de investigación">
                <input
                  type="text"
                  value={form.proyecto_investigacion}
                  onChange={set('proyecto_investigacion')}
                  className="campo"
                />
              </Campo>

              <Campo label="Instituciones participantes o asociadas">
                <input
                  type="text"
                  value={form.instituciones_participantes}
                  onChange={set('instituciones_participantes')}
                  placeholder="Ej. Universidad de Cundinamarca; CORPOGIRARDOT"
                  className="campo"
                />
              </Campo>
            </div>
          )}

          {/* ---------- PASO 3 ---------- */}
          {paso === 2 && (
            <div className="grid animate-slide-in gap-4 md:grid-cols-2">
              <Campo label="Autor / Asesor 1" requerido>
                <input
                  type="text"
                  value={form.autor_asesor_1}
                  onChange={set('autor_asesor_1')}
                  className="campo"
                />
              </Campo>
              <Campo label="Autor / Asesor 2">
                <input
                  type="text"
                  value={form.autor_asesor_2}
                  onChange={set('autor_asesor_2')}
                  className="campo"
                />
              </Campo>
              <Campo label="Autor / Asesor 3">
                <input
                  type="text"
                  value={form.autor_asesor_3}
                  onChange={set('autor_asesor_3')}
                  className="campo"
                />
              </Campo>
              <Campo label="Otros autores">
                <input
                  type="text"
                  value={form.otros_autores}
                  onChange={set('otros_autores')}
                  placeholder="Separados por coma"
                  className="campo"
                />
              </Campo>

              <Campo label="Nombre estudiante orientado 1">
                <input
                  type="text"
                  value={form.estudiante_orientado_1}
                  onChange={set('estudiante_orientado_1')}
                  className="campo"
                />
              </Campo>
              <Campo label="Nombre estudiante orientado 2">
                <input
                  type="text"
                  value={form.estudiante_orientado_2}
                  onChange={set('estudiante_orientado_2')}
                  className="campo"
                />
              </Campo>
              <Campo label="Nombre estudiante orientado 3">
                <input
                  type="text"
                  value={form.estudiante_orientado_3}
                  onChange={set('estudiante_orientado_3')}
                  className="campo"
                />
              </Campo>

              <div className="md:col-span-2">
                <Campo label="Reconocimientos">
                  <textarea
                    value={form.reconocimientos}
                    onChange={set('reconocimientos')}
                    rows={3}
                    className="campo resize-y"
                    placeholder="Premios, menciones, destacados…"
                  />
                </Campo>
              </div>
            </div>
          )}

          {/* ---------- PASO 4 ---------- */}
          {paso === 3 && (
            <div className="animate-slide-in space-y-5">
              <Campo
                label="Evidencia / soporte"
                ayuda="PDF, ZIP o imagen (máx. 25 MB). Se guarda en /uploads/evidencias. También puedes registrar un enlace abajo."
              >
                <input
                  type="file"
                  accept=".pdf,.zip,.rar,.7z,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                  className="campo file:mr-3 file:rounded-md file:border-0 file:bg-udec-100 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-udec-900"
                />
                {archivo && (
                  <p className="mt-2 flex animate-scale-in items-center gap-1.5 rounded-lg bg-udec-50 px-3 py-2 text-xs font-medium text-udec-900">
                    <Paperclip size={13} /> {archivo.name} ({(archivo.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                {productoActual?.evidencia && !archivo && (
                  <p className="mt-2 text-xs text-slate-500">
                    Evidencia actual:{' '}
                    <a
                      href={productoActual.evidencia}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-udec-700 underline"
                    >
                      ver archivo
                    </a>
                  </p>
                )}
              </Campo>

              <Campo label="Enlace o nombre de archivo de evidencia (opcional)">
                <input
                  type="text"
                  value={form.evidencia}
                  onChange={set('evidencia')}
                  placeholder="https://drive.google.com/… o soporte.pdf"
                  className="campo"
                  disabled={Boolean(archivo)}
                />
              </Campo>

              {/* Resumen */}
              <div className="rounded-xl border border-borde bg-slate-50 p-4">
                <p className="text-xs font-semibold text-udec-700">
                  Resumen del registro
                </p>
                <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                  {[
                    ['Tipología', form.tipologia],
                    ['Sub-tipología', form.sub_tipologia],
                    ['Clasificación', form.clasificacion],
                    ['Producto', form.nombre_producto],
                    ['Año', form.anio],
                    ['Período', form.periodo_academico],
                    ['Autor / Asesor 1', form.autor_asesor_1],
                    ['Evidencia', archivo ? archivo.name : form.evidencia || 'Sin adjuntar'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <dt className="w-28 shrink-0 font-semibold text-slate-500">{k}:</dt>
                      <dd className="min-w-0 flex-1 break-words text-slate-700">{v || '—'}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
                <p className="text-xs leading-relaxed text-amber-900">
                  <b>Nota:</b> el producto se enviará con estado{' '}
                  <span className="badge bg-amber-200 text-amber-900">Parcial</span> y quedará
                  pendiente de auditoría por el Administrador. Puedes editarlo mientras esté en
                  estado Parcial o No verificado.
                </p>
              </div>
            </div>
          )}

          {/* ---------- Navegación ---------- */}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-borde pt-5">
            <button
              type="button"
              onClick={anterior}
              disabled={paso === 0}
              className="btn-secundario group"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              Anterior
            </button>

            <div className="flex flex-wrap gap-2">
              {!editarId && (
                <button type="button" onClick={guardarBorrador} className="btn-secundario">
                  <Save size={16} /> Guardar borrador
                </button>
              )}
              {paso < PASOS.length - 1 ? (
                <button key="siguiente" type="button" onClick={siguiente} className="btn-primary group">
                  Siguiente
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              ) : (
                // key distinta: si React reutilizara el botón "Siguiente", el mismo clic enviaría el formulario
                <button key="enviar" type="submit" disabled={enviando} className="btn-primary">
                  {enviando ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Enviando…
                    </>
                  ) : editarId ? (
                    'Guardar cambios'
                  ) : (
                    'Enviar producto (estado Parcial)'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      <Toast toast={toast} onCerrar={() => setToast(null)} />
    </div>
  );
}
