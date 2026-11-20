/**
 * pages/MisProductos.jsx
 * Listado de productos del investigador con edición/eliminación
 * solo mientras el estado sea 'Parcial' o 'No verificado'.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Microscope } from 'lucide-react';
import api, { msgError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EstadoBadge from '../components/EstadoBadge';
import Toast from '../components/Toast';
import FiltroAutor, { autoresDe, coincideAutor } from '../components/FiltroAutor';

export default function MisProductos() {
  const { esAdmin, usuario } = useAuth();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [q, setQ] = useState('');
  const [autor, setAutor] = useState('');

  const cargar = () => {
    setCargando(true);
    api
      .get(esAdmin ? '/investigacion/admin/todos' : '/investigacion/mis')
      .then(({ data }) => setProductos(data.productos || []))
      .catch((e) => setToast({ tipo: 'error', mensaje: msgError(e) }))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, [esAdmin]);

  const editables = (p) => ['Parcial', 'No verificado'].includes(p.estado_evidencia);

  const eliminar = async (p) => {
    if (!window.confirm(`¿Eliminar el producto "${p.nombre_producto}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      const { data } = await api.delete(`/investigacion/${p.id}`);
      setToast({ tipo: 'success', mensaje: data.mensaje });
      cargar();
    } catch (e) {
      setToast({ tipo: 'error', mensaje: msgError(e) });
    }
  };

  const autores = useMemo(() => autoresDe(productos), [productos]);

  const filtrados = productos.filter((p) => {
    if (filtroEstado && p.estado_evidencia !== filtroEstado) return false;
    if (!coincideAutor(p, autor)) return false;
    if (!q.trim()) return true;
    const texto = q.toLowerCase();
    return (
      (p.nombre_producto || '').toLowerCase().includes(texto) ||
      (p.tipologia || '').toLowerCase().includes(texto)
    );
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="antetitulo">Producción científica</p>
          <h1 className="mt-3 text-2xl font-semibold text-udec-900 md:text-3xl">
            {esAdmin ? 'Auditoría: todos los productos' : 'Mis Productos de Investigación'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Los productos en estado <b>Parcial</b> o <b>No verificado</b> pueden editarse; al
            quedar <b>Con evidencia</b> quedan bloqueados para el investigador.
          </p>
        </div>
        <Link to="/panel/registrar-producto" className="btn-primary">
          + Nuevo producto
        </Link>
      </div>

      {/* Filtros */}
      <div className="mt-6 flex flex-wrap gap-3 rounded-xl border border-borde bg-white p-4 shadow-tarjeta">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o tipología…"
          className="campo !w-64"
        />
        <FiltroAutor valor={autor} onCambiar={setAutor} autores={autores} className="w-64" />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="campo !w-52"
        >
          <option value="">Todos los estados</option>
          <option>Parcial</option>
          <option>Con evidencia</option>
          <option>Sin evidencia</option>
          <option>No verificado</option>
        </select>
        <span className="ml-auto self-center text-xs text-slate-500">
          <b className="text-udec-900">{filtrados.length}</b> de {productos.length} productos
        </span>
      </div>

      {/* Lista */}
      <div className="mt-5 space-y-3">
        {cargando && (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-udec-100 border-t-udec-700" />
          </div>
        )}

        {!cargando && filtrados.length === 0 && (
          <div className="rounded-xl border border-borde bg-white py-16 text-center">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-lg bg-udec-50 text-udec-700">
              <Microscope size={40} strokeWidth={1.5} />
            </span>
            <p className="mt-4 font-bold text-udec-900">No hay productos para mostrar</p>
            <p className="mt-1 text-sm text-slate-500">
              Registra tu primer producto de investigación con el formulario de 4 pasos.
            </p>
            <Link to="/panel/registrar-producto" className="btn-primary mt-5">
              Registrar producto
            </Link>
          </div>
        )}

        {!cargando &&
          filtrados.map((p) => (
            <article key={p.id} className="tarjeta p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <EstadoBadge estado={p.estado_evidencia} />
                    <span className="rounded-full bg-udec-50 px-2.5 py-1 text-[11px] font-bold text-udec-900">
                      {p.anio || '—'}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {p.periodo_academico || 'NA'}
                    </span>
                  </div>
                  <h2 className="mt-2 text-base font-bold leading-snug text-udec-900">
                    {p.nombre_producto}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {p.tipologia}
                    {p.sub_tipologia ? ` · ${p.sub_tipologia}` : ''}
                    {p.clasificacion ? ` · ${p.clasificacion}` : ''}
                  </p>
                  {p.observaciones_validacion && (
                    <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      <b>Observaciones de validación:</b> {p.observaciones_validacion}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/panel/producto/${p.id}`)}
                    className="btn-secundario !px-3.5 !py-2 text-xs"
                  >
                    Ver detalle
                  </button>
                  {editables(p) || esAdmin ? (
                    <button
                      onClick={() => navigate(`/panel/registrar-producto?editar=${p.id}`)}
                      className="btn-primary !px-3.5 !py-2 text-xs"
                    >
                      Editar
                    </button>
                  ) : null}
                  {/* Quien registró el producto puede eliminarlo en cualquier estado; el admin, cualquiera */}
                  {(esAdmin || p.user_id === usuario?.id) && (
                    <button
                      onClick={() => eliminar(p)}
                      className="rounded-lg border border-red-200 px-3.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
      </div>

      <Toast toast={toast} onCerrar={() => setToast(null)} />
    </div>
  );
}
