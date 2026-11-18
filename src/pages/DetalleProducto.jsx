/**
 * pages/DetalleProducto.jsx
 * Ficha completa del producto (dueño o Admin) — las 31 columnas.
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Paperclip, ShieldCheck, TriangleAlert } from 'lucide-react';
import api, { msgError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EstadoBadge from '../components/EstadoBadge';
import Toast from '../components/Toast';

const ETIQUETAS = [
  ['tipologia', 'Tipología'],
  ['sub_tipologia', 'Sub-tipología'],
  ['clasificacion', 'Clasificación'],
  ['nombre_producto', 'Nombre del producto'],
  ['titulo_libro_evento', 'Título del libro / evento'],
  ['medio_verificacion', 'Medio de verificación'],
  ['anio', 'Año'],
  ['periodo_academico', 'Período académico'],
  ['fecha_publicacion', 'Fecha de publicación'],
  ['fecha_inicio', 'Fecha de inicio'],
  ['fecha_fin', 'Fecha de fin'],
  ['editorial', 'Editorial'],
  ['instituciones_participantes', 'Instituciones participantes'],
  ['proyecto_investigacion', 'Proyecto de investigación'],
  ['revista_libro_issn_isbn', 'Revista - libro / ISSN-ISBN'],
  ['volumen', 'Volumen'],
  ['ciudad_municipio', 'Ciudad o municipio'],
  ['tipo_formato_producto', 'Tipo de formato o producto'],
  ['estudiante_orientado_1', 'Estudiante orientado 1'],
  ['estudiante_orientado_2', 'Estudiante orientado 2'],
  ['estudiante_orientado_3', 'Estudiante orientado 3'],
  ['sitio_web_doi', 'Sitio web o DOI'],
  ['numero_paginas', 'No. páginas'],
  ['autor_asesor_1', 'Autor / Asesor 1'],
  ['autor_asesor_2', 'Autor / Asesor 2'],
  ['autor_asesor_3', 'Autor / Asesor 3'],
  ['otros_autores', 'Otros autores'],
  ['reconocimientos', 'Reconocimientos'],
  ['evidencia', 'Evidencia'],
];

export default function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { esAdmin, usuario } = useAuth();
  const [producto, setProducto] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [modalValidar, setModalValidar] = useState(false);
  const [formValidar, setFormValidar] = useState({ estado_evidencia: '', observaciones_validacion: '' });

  useEffect(() => {
    api
      .get(`/investigacion/${id}`)
      .then(({ data }) => {
        setProducto(data.producto);
        setFormValidar({
          estado_evidencia: data.producto.estado_evidencia,
          observaciones_validacion: data.producto.observaciones_validacion || '',
        });
      })
      .catch((e) => setError(msgError(e)));
  }, [id]);

  const guardarValidacion = async () => {
    try {
      const { data } = await api.put(`/investigacion/${id}/validar`, formValidar);
      setToast({ tipo: 'success', mensaje: data.mensaje });
      setProducto(data.producto);
      setModalValidar(false);
    } catch (e) {
      setToast({ tipo: 'error', mensaje: msgError(e) });
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <TriangleAlert size={44} className="mx-auto text-amber-500" />
        <p className="mt-3 font-bold text-udec-900">{error}</p>
        <button onClick={() => navigate('/panel/mis-productos')} className="btn-secundario mt-5">
          Volver a mis productos
        </button>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-udec-100 border-t-udec-700" />
      </div>
    );
  }

  const editable =
    esAdmin || ['Parcial', 'No verificado'].includes(producto.estado_evidencia);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-serif text-base font-semibold text-udec-900">
            Ficha del producto
          </p>
          <h1 className="mt-1 max-w-2xl text-xl font-semibold leading-snug text-udec-900 md:text-2xl">
            {producto.nombre_producto}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <EstadoBadge estado={producto.estado_evidencia} />
            <span className="rounded-full bg-udec-50 px-3 py-1 text-xs font-bold text-udec-900">
              {producto.anio || '—'} · {producto.periodo_academico || 'NA'}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {producto.autor_nombre || '—'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/panel/mis-productos" className="btn-secundario group !py-2 text-xs">
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Volver
          </Link>
          {editable && (
            <Link
              to={`/panel/registrar-producto?editar=${producto.id}`}
              className="btn-primary !py-2 text-xs"
            >
              Editar
            </Link>
          )}
          {esAdmin && (
            <button
              onClick={() => setModalValidar(true)}
              className="btn-oro !py-2 text-xs"
            >
              <ShieldCheck size={15} /> Auditar / Validar
            </button>
          )}
        </div>
      </div>

      {!editable && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Este producto está en estado <b>{producto.estado_evidencia}</b>: solo el Administrador
          puede modificarlo. {esAdmin && 'Tú sí tienes permiso de edición.'}
        </div>
      )}

      {producto.observaciones_validacion && (
        <div className="mt-4 rounded-xl border border-oro-500/50 bg-oro-100 px-4 py-3">
          <p className="text-xs font-semibold text-amber-800">
            Observaciones de la validación
          </p>
          <p className="mt-1 text-sm text-amber-900">{producto.observaciones_validacion}</p>
        </div>
      )}

      <div className="mt-5 rounded-lg border border-borde bg-white p-5 shadow-tarjeta md:p-7">
        <h2 className="mb-4 font-serif text-base font-semibold text-udec-900">
          Las 31 columnas de la matriz
        </h2>
        <dl className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
          {ETIQUETAS.map(([campo, etiqueta]) => {
            const valor = producto[campo];
            if (campo === 'evidencia' && valor) {
              return (
                <div key={campo} className="border-b border-borde/60 pb-2 sm:col-span-2">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {etiqueta}
                  </dt>
                  <dd className="text-sm">
                    <a
                      href={valor}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-udec-700 underline hover:text-udec-900"
                    >
                      <Paperclip size={13} /> {String(valor).split('/').pop()}
                    </a>
                  </dd>
                </div>
              );
            }
            return (
              <div key={campo} className="border-b border-borde/60 pb-2">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {etiqueta}
                </dt>
                <dd className="break-words text-sm text-slate-700">
                  {valor === null || valor === undefined || valor === '' ? (
                    <span className="text-slate-300">—</span>
                  ) : (
                    String(valor)
                  )}
                </dd>
              </div>
            );
          })}

          <div className="border-b border-borde/60 pb-2">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Estado evidencia
            </dt>
            <dd>
              <EstadoBadge estado={producto.estado_evidencia} />
            </dd>
          </div>
          <div className="border-b border-borde/60 pb-2">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Registrado / actualizado
            </dt>
            <dd className="text-sm text-slate-700">
              {new Date(producto.created_at).toLocaleDateString('es-CO')} ·{' '}
              {new Date(producto.updated_at).toLocaleDateString('es-CO')}
            </dd>
          </div>
        </dl>
      </div>

      {/* Modal de auditoría (Admin) */}
      {modalValidar && (
        <div
          className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setModalValidar(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-lg animate-scale-in rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-udec-900">Auditoría y Validación</h2>
            <p className="mt-1 text-xs text-slate-500">
              Revisa los soportes adjuntos y actualiza el estado de evidencia.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="estado" className="campo-label">
                  Estado evidencia
                </label>
                <select
                  id="estado"
                  value={formValidar.estado_evidencia}
                  onChange={(e) =>
                    setFormValidar((f) => ({ ...f, estado_evidencia: e.target.value }))
                  }
                  className="campo"
                >
                  <option>Parcial</option>
                  <option>Con evidencia</option>
                  <option>Sin evidencia</option>
                  <option>No verificado</option>
                </select>
              </div>
              <div>
                <label htmlFor="obs" className="campo-label">
                  Observaciones de la validación
                </label>
                <textarea
                  id="obs"
                  rows={4}
                  value={formValidar.observaciones_validacion}
                  onChange={(e) =>
                    setFormValidar((f) => ({ ...f, observaciones_validacion: e.target.value }))
                  }
                  placeholder="Ej. Soporte completo verificado. DOI coincide con la publicación."
                  className="campo resize-y"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setModalValidar(false)} className="btn-secundario">
                Cancelar
              </button>
              <button onClick={guardarValidacion} className="btn-primary">
                Guardar validación
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onCerrar={() => setToast(null)} />
    </div>
  );
}
