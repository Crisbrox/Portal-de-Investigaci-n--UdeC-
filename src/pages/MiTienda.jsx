/**
 * pages/MiTienda.jsx — (Emprendedor) Productos que vende cada uno de mis emprendimientos.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, ImagePlus, Pencil, Plus, Store, Trash2, X } from 'lucide-react';
import api, { msgError } from '../services/api';
import Toast from '../components/Toast';
import { pesos } from '../context/CarritoContext';

const VACIO = {
  nombre: '',
  descripcion: '',
  precio: '',
  precio_oferta: '',
  unidad: 'unidad',
  stock: '',
  disponible: true,
  destacado: false,
};

function FormProducto({ inicial, emprendimientoId, onGuardado, onCerrar }) {
  const editando = Boolean(inicial.id);
  const [form, setForm] = useState({
    ...VACIO,
    ...inicial,
    precio_oferta: inicial.precio_oferta ?? '',
    stock: inicial.stock ?? '',
    descripcion: inicial.descripcion ?? '',
  });
  const [imagen, setImagen] = useState(null);
  const [quitarImagen, setQuitarImagen] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const vistaPrevia = useMemo(() => (imagen ? URL.createObjectURL(imagen) : null), [imagen]);
  useEffect(() => () => vistaPrevia && URL.revokeObjectURL(vistaPrevia), [vistaPrevia]);
  const imagenActual = vistaPrevia || (!quitarImagen && inicial.imagen_url);

  const set = (campo) => (e) =>
    setForm((f) => ({ ...f, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    const precio = Number(form.precio);
    if (!form.nombre.trim()) return setError('El nombre es obligatorio.');
    if (!(precio > 0)) return setError('Indica un precio mayor que cero.');
    if (form.precio_oferta !== '' && !(Number(form.precio_oferta) > 0 && Number(form.precio_oferta) < precio)) {
      return setError('El precio de oferta debe ser menor que el precio normal.');
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (['id', 'imagen_url'].includes(k) || v === null || v === undefined) return;
      fd.append(k, typeof v === 'boolean' ? (v ? '1' : '0') : v);
    });
    fd.append('emprendimiento_id', emprendimientoId);
    if (imagen) fd.append('imagen', imagen);
    if (quitarImagen) fd.append('quitar_imagen', '1');

    setEnviando(true);
    try {
      const { data } = editando
        ? await api.put(`/tienda/productos/${inicial.id}`, fd)
        : await api.post('/tienda/productos', fd);
      onGuardado(data.mensaje);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
    >
      <motion.form
        data-lenis-prevent
        onSubmit={enviar}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold text-udec-900">{editando ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button type="button" onClick={onCerrar} className="rounded p-1 text-slate-400 hover:bg-slate-100" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div role="alert" className="mt-4 rounded border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 grid gap-5 sm:grid-cols-[11rem_1fr]">
          {/* Imagen */}
          <div>
            <label className="group relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-fondo text-center text-xs text-slate-500 transition-colors hover:border-udec-700">
              {imagenActual ? (
                <img src={imagenActual} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <>
                  <ImagePlus size={28} className="text-udec-700 transition-transform group-hover:scale-110" />
                  <span className="mt-2 px-2">Foto del producto (JPG, PNG o WEBP)</span>
                </>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => {
                  setImagen(e.target.files?.[0] || null);
                  setQuitarImagen(false);
                }}
              />
            </label>
            {imagenActual && (
              <button
                type="button"
                onClick={() => {
                  setImagen(null);
                  setQuitarImagen(true);
                }}
                className="mt-2 text-xs text-slate-500 hover:text-red-700"
              >
                Quitar foto
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="campo-label" htmlFor="t-nombre">Nombre</label>
              <input id="t-nombre" className="campo" value={form.nombre} onChange={set('nombre')} placeholder="Ej. Café molido 500 g" required />
            </div>
            <div>
              <label className="campo-label" htmlFor="t-desc">Descripción</label>
              <textarea id="t-desc" rows={3} className="campo resize-y" value={form.descripcion} onChange={set('descripcion')} placeholder="Ingredientes, tallas, tiempos de entrega…" />
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="campo-label" htmlFor="t-precio">Precio (COP)</label>
            <input id="t-precio" type="number" min="1" step="1" className="campo" value={form.precio} onChange={set('precio')} required />
          </div>
          <div>
            <label className="campo-label" htmlFor="t-oferta">Precio de oferta (opcional)</label>
            <input id="t-oferta" type="number" min="1" step="1" className="campo" value={form.precio_oferta} onChange={set('precio_oferta')} />
          </div>
          <div>
            <label className="campo-label" htmlFor="t-unidad">Se vende por</label>
            <input id="t-unidad" className="campo" list="t-unidades" value={form.unidad} onChange={set('unidad')} />
            <datalist id="t-unidades">
              {['unidad', 'paquete', 'caja', 'libra', 'kilo', 'docena', 'par', 'servicio', 'hora'].map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="campo-label" htmlFor="t-stock">Unidades disponibles (opcional)</label>
            <input id="t-stock" type="number" min="0" className="campo" value={form.stock} onChange={set('stock')} placeholder="Vacío = sin control de inventario" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={form.disponible} onChange={set('disponible')} className="h-4 w-4 accent-udec-800" />
            Visible en la tienda
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={form.destacado} onChange={set('destacado')} className="h-4 w-4 accent-udec-800" />
            Destacar (aparece primero)
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCerrar} className="btn-secundario">
            Cancelar
          </button>
          <button type="submit" disabled={enviando} className="btn-primary">
            {enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Publicar producto'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

export default function MiTienda() {
  const [emprendimientos, setEmprendimientos] = useState(null);
  const [activo, setActivo] = useState(null);
  const [productos, setProductos] = useState([]);
  const [formulario, setFormulario] = useState(null);
  const [toast, setToast] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const [{ data: e }, { data: p }] = await Promise.all([
        api.get('/emprendimientos/mis/listado'),
        api.get('/tienda/mis-productos'),
      ]);
      setEmprendimientos(e.emprendimientos);
      setProductos(p.productos);
      setActivo((a) => a ?? e.emprendimientos[0]?.id ?? null);
    } catch (err) {
      setEmprendimientos([]);
      setToast({ tipo: 'error', mensaje: msgError(err) });
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const delActivo = productos.filter((p) => p.emprendimiento_id === activo);
  const emp = emprendimientos?.find((e) => e.id === activo);

  const alternar = async (p) => {
    try {
      const { data } = await api.patch(`/tienda/productos/${p.id}/disponible`, { disponible: !p.disponible });
      setProductos((lista) => lista.map((x) => (x.id === p.id ? { ...x, disponible: data.disponible } : x)));
    } catch (err) {
      setToast({ tipo: 'error', mensaje: msgError(err) });
    }
  };

  const eliminar = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.nombre}" de la tienda? Esta acción no se puede deshacer.`)) return;
    try {
      const { data } = await api.delete(`/tienda/productos/${p.id}`);
      setToast({ tipo: 'success', mensaje: data.mensaje });
      cargar();
    } catch (err) {
      setToast({ tipo: 'error', mensaje: msgError(err) });
    }
  };

  if (emprendimientos === null) {
    return (
      <div className="mx-auto max-w-6xl space-y-3">
        <div className="esqueleto h-10 w-64" />
        <div className="esqueleto h-48" />
      </div>
    );
  }

  if (emprendimientos.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-udec-50 text-udec-700">
          <Store size={36} strokeWidth={1.5} />
        </span>
        <h1 className="mt-5 text-2xl font-semibold text-udec-900">Primero publica tu emprendimiento</h1>
        <p className="mt-2 text-slate-600">
          Los productos de la tienda pertenecen a un emprendimiento. Crea el tuyo y luego vuelve aquí para
          publicar lo que vendes.
        </p>
        <Link to="/panel/publicar-emprendimiento" className="btn-primary mt-6">
          Publicar emprendimiento
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="antetitulo">Tienda UdeC</p>
          <h1 className="mt-3 text-2xl font-semibold text-udec-900 md:text-3xl">Mi tienda</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Lo que publiques aquí aparece en la Tienda UdeC. Los clientes te envían el pedido por
            WhatsApp{emp?.whatsapp ? ` al ${emp.whatsapp}` : ''}; el pago y la entrega los acuerdas tú.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/tienda?emprendimiento=${activo}`} className="btn-secundario">
            <ExternalLink size={16} /> Ver en la tienda
          </Link>
          <button onClick={() => setFormulario({ ...VACIO })} className="btn-primary group">
            <Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" /> Nuevo producto
          </button>
        </div>
      </div>

      {!emp?.whatsapp && (
        <p className="mt-4 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Tu emprendimiento no tiene WhatsApp registrado: los clientes solo podrán pedirte por correo.
        </p>
      )}

      {emprendimientos.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-1 border-b border-borde">
          {emprendimientos.map((e) => (
            <button
              key={e.id}
              onClick={() => setActivo(e.id)}
              className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
                activo === e.id ? 'text-udec-900' : 'text-slate-500 hover:text-udec-800'
              }`}
            >
              {e.nombre_emprendimiento}
              {activo === e.id && (
                <motion.span layoutId="pestana-tienda" className="absolute inset-x-0 -bottom-px h-[3px] bg-oro-500" />
              )}
            </button>
          ))}
        </div>
      )}

      {delActivo.length === 0 ? (
        <div className="mt-8 rounded-lg border-2 border-dashed border-slate-300 py-14 text-center">
          <p className="font-serif text-xl font-semibold text-udec-900">Aún no vendes nada en {emp?.nombre_emprendimiento}</p>
          <p className="mt-1 text-sm text-slate-500">Publica tu primer producto con foto y precio.</p>
          <button onClick={() => setFormulario({ ...VACIO })} className="btn-primary mt-5">
            <Plus size={16} /> Publicar producto
          </button>
        </div>
      ) : (
        <motion.ul layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {delActivo.map((p) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex gap-4 rounded-lg border border-borde bg-white p-4 transition-opacity ${p.disponible ? '' : 'opacity-60'}`}
              >
                <span className="h-20 w-20 shrink-0 overflow-hidden rounded bg-udec-50">
                  {p.imagen_url ? (
                    <img src={p.imagen_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-udec-900 font-serif text-2xl text-white">
                      {p.nombre.charAt(0)}
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-semibold text-slate-800">{p.nombre}</p>
                  <p className="mt-0.5 text-sm">
                    <span className="font-semibold text-udec-900">{pesos(p.precio_oferta || p.precio)}</span>
                    {p.precio_oferta && <span className="ml-2 text-xs text-slate-400 line-through">{pesos(p.precio)}</span>}
                    <span className="text-xs text-slate-500"> / {p.unidad}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {p.stock === null ? 'Sin control de inventario' : p.stock === 0 ? 'Agotado' : `${p.stock} disponibles`}
                    {p.destacado ? ' · Destacado' : ''}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <button
                      onClick={() => alternar(p)}
                      role="switch"
                      aria-checked={p.disponible}
                      className="mr-auto flex items-center gap-2 text-xs text-slate-600"
                    >
                      <span className={`relative h-5 w-9 rounded-full transition-colors ${p.disponible ? 'bg-udec-700' : 'bg-slate-300'}`}>
                        <motion.span
                          layout
                          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow ${p.disponible ? 'right-0.5' : 'left-0.5'}`}
                        />
                      </span>
                      {p.disponible ? 'A la venta' : 'Pausado'}
                    </button>
                    <button onClick={() => setFormulario(p)} className="rounded p-1.5 text-slate-500 hover:bg-udec-50 hover:text-udec-800" aria-label={`Editar ${p.nombre}`}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => eliminar(p)} className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-700" aria-label={`Eliminar ${p.nombre}`}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <AnimatePresence>
        {formulario && (
          <FormProducto
            key="form"
            inicial={formulario}
            emprendimientoId={activo}
            onCerrar={() => setFormulario(null)}
            onGuardado={(mensaje) => {
              setFormulario(null);
              setToast({ tipo: 'success', mensaje });
              cargar();
            }}
          />
        )}
      </AnimatePresence>

      <Toast toast={toast} onCerrar={() => setToast(null)} />
    </div>
  );
}
