/**
 * pages/Usuarios.jsx — (Solo Admin) Gestión de cuentas.
 * No hay registro público: aquí se crean las cuentas con una contraseña temporal
 * que el usuario debe cambiar en su primer ingreso.
 */
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, KeyRound, Pencil, Search, Trash2, UserPlus, X } from 'lucide-react';
import api, { msgError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SEDES, PROGRAMAS } from '../constants/catalogos';
import Toast from '../components/Toast';

const ROLES = {
  ADMINISTRADOR: { nombre: 'Administrador', clase: 'bg-oro-100 text-amber-900' },
  INVESTIGADOR: { nombre: 'Investigador', clase: 'bg-udec-50 text-udec-800' },
  EMPRENDEDOR: { nombre: 'Emprendedor', clase: 'bg-sky-50 text-sky-800' },
  ISU: { nombre: 'Líder ISU', clase: 'bg-violet-50 text-violet-800' },
};

const VACIO = {
  nombre_completo: '',
  correo_institucional: '',
  rol: 'INVESTIGADOR',
  sede: '',
  programa_academico: '',
  semillero: '',
  password: '',
};

function Modal({ titulo, onCerrar, children }) {
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
      <motion.div
        data-lenis-prevent
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-udec-900">{titulo}</h2>
          <button onClick={onCerrar} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Muestra una contraseña temporal una sola vez, con botón para copiarla. */
function PasswordTemporal({ datos, onCerrar }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(datos.password);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };
  return (
    <Modal titulo="Contraseña temporal" onCerrar={onCerrar}>
      <p className="mt-3 text-sm text-slate-600">
        Entrega estos datos a <b>{datos.nombre}</b>. La contraseña solo se muestra ahora; al ingresar,
        el sistema le pedirá cambiarla.
      </p>
      <dl className="mt-5 space-y-3 rounded border border-borde bg-fondo p-4 text-sm">
        <div>
          <dt className="text-slate-500">Correo</dt>
          <dd className="font-semibold text-slate-800">{datos.correo}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Contraseña temporal</dt>
          <dd className="mt-1 flex items-center gap-3">
            <code className="rounded bg-white px-3 py-1.5 font-mono text-base font-semibold tracking-wide text-udec-900 ring-1 ring-borde">
              {datos.password}
            </code>
            <button onClick={copiar} className="btn-secundario !px-3 !py-1.5 text-xs">
              {copiado ? <Check size={14} /> : <Copy size={14} />}
              {copiado ? 'Copiada' : 'Copiar'}
            </button>
          </dd>
        </div>
      </dl>
      <button onClick={onCerrar} className="btn-primary mt-6 w-full">
        Listo
      </button>
    </Modal>
  );
}

function FormUsuario({ inicial, editando, onGuardar, onCerrar, esPropio }) {
  const [form, setForm] = useState(inicial);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[A-Za-z0-9._%+-]+@ucundinamarca\.edu\.co$/.test(form.correo_institucional.trim())) {
      return setError('El correo debe terminar en @ucundinamarca.edu.co.');
    }
    if (form.password && form.password.length < 8) {
      return setError('La contraseña temporal debe tener al menos 8 caracteres (o déjala vacía para generarla).');
    }
    setEnviando(true);
    try {
      await onGuardar(form);
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <Modal titulo={editando ? 'Editar usuario' : 'Nuevo usuario'} onCerrar={onCerrar}>
      <form onSubmit={enviar} className="mt-5 space-y-4">
        {error && (
          <div role="alert" className="rounded border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}
        <div>
          <label className="campo-label" htmlFor="u-nombre">Nombre completo</label>
          <input id="u-nombre" className="campo" value={form.nombre_completo} onChange={set('nombre_completo')} required />
        </div>
        <div>
          <label className="campo-label" htmlFor="u-correo">Correo institucional</label>
          <input
            id="u-correo"
            type="email"
            className="campo"
            value={form.correo_institucional}
            onChange={set('correo_institucional')}
            placeholder="nombre@ucundinamarca.edu.co"
            disabled={editando}
            required
          />
          {editando && <p className="mt-1 text-xs text-slate-500">El correo no se puede cambiar.</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="campo-label" htmlFor="u-rol">Rol</label>
            <select id="u-rol" className="campo" value={form.rol} onChange={set('rol')} disabled={esPropio}>
              <option value="INVESTIGADOR">Investigador</option>
              <option value="EMPRENDEDOR">Emprendedor</option>
              <option value="ISU">Líder ISU</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
          </div>
          <div>
            <label className="campo-label" htmlFor="u-sede">Sede</label>
            <select id="u-sede" className="campo" value={form.sede || ''} onChange={set('sede')}>
              <option value="">Sin sede</option>
              {SEDES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="campo-label" htmlFor="u-programa">Programa académico</label>
          <input
            id="u-programa"
            className="campo"
            list="u-programas"
            value={form.programa_academico}
            onChange={set('programa_academico')}
            required
          />
          <datalist id="u-programas">
            {PROGRAMAS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="campo-label" htmlFor="u-semillero">Semillero (opcional)</label>
          <input id="u-semillero" className="campo" value={form.semillero || ''} onChange={set('semillero')} />
        </div>
        {!editando && (
          <div>
            <label className="campo-label" htmlFor="u-password">Contraseña temporal (opcional)</label>
            <input
              id="u-password"
              className="campo"
              value={form.password}
              onChange={set('password')}
              placeholder="Déjala vacía y el sistema genera una segura"
              autoComplete="off"
            />
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCerrar} className="btn-secundario">
            Cancelar
          </button>
          <button type="submit" disabled={enviando} className="btn-primary">
            {enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear cuenta'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Usuarios() {
  const { usuario: yo } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState({ q: '', rol: '', sede: '', activo: '' });
  const [formulario, setFormulario] = useState(null); // { inicial, editandoId }
  const [temporal, setTemporal] = useState(null);
  const [toast, setToast] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== ''));
      const { data } = await api.get('/usuarios', { params });
      setUsuarios(data.usuarios);
    } catch (err) {
      setToast({ tipo: 'error', mensaje: msgError(err) });
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  useEffect(() => {
    const t = setTimeout(cargar, 250);
    return () => clearTimeout(t);
  }, [cargar]);

  const setFiltro = (campo) => (e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }));

  const guardar = async (form) => {
    if (formulario.editandoId) {
      const { data } = await api.put(`/usuarios/${formulario.editandoId}`, form);
      setToast({ tipo: 'success', mensaje: data.mensaje });
    } else {
      const { data } = await api.post('/usuarios', form);
      setTemporal({
        nombre: data.usuario.nombre_completo,
        correo: data.usuario.correo_institucional,
        password: data.password_temporal,
      });
    }
    setFormulario(null);
    cargar();
  };

  const alternarActivo = async (u) => {
    try {
      const { data } = await api.put(`/usuarios/${u.id}`, { activo: !u.activo });
      setUsuarios((lista) => lista.map((x) => (x.id === u.id ? data.usuario : x)));
      setToast({ tipo: 'success', mensaje: data.usuario.activo ? 'Cuenta activada.' : 'Cuenta desactivada.' });
    } catch (err) {
      setToast({ tipo: 'error', mensaje: msgError(err) });
    }
  };

  const restablecer = async (u) => {
    if (!window.confirm(`¿Generar una nueva contraseña temporal para ${u.nombre_completo}? La actual dejará de funcionar.`)) return;
    try {
      const { data } = await api.post(`/usuarios/${u.id}/restablecer`);
      setTemporal({ nombre: u.nombre_completo, correo: u.correo_institucional, password: data.password_temporal });
      cargar();
    } catch (err) {
      setToast({ tipo: 'error', mensaje: msgError(err) });
    }
  };

  const eliminar = async (u) => {
    if (!window.confirm(`¿Eliminar definitivamente la cuenta de ${u.nombre_completo}? Esta acción no se puede deshacer.`)) return;
    try {
      const { data } = await api.delete(`/usuarios/${u.id}`);
      setToast({ tipo: 'success', mensaje: data.mensaje });
      cargar();
    } catch (err) {
      setToast({ tipo: 'error', mensaje: msgError(err) });
    }
  };

  const activos = usuarios.filter((u) => u.activo).length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="antetitulo">Administración</p>
          <h1 className="mt-3 text-2xl font-semibold text-udec-900 md:text-3xl">Usuarios</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Los emprendedores pueden crear su cuenta desde la página de acceso; las de investigadores,
            líderes ISU y administradores se crean aquí. Los investigadores registran
            producción científica, los emprendedores venden en la Tienda UdeC y los líderes ISU
            entregan los informes de sus proyectos de Interacción Social. Cada cuenta nueva recibe
            una contraseña temporal que el usuario cambia en su primer ingreso.
          </p>
        </div>
        <button onClick={() => setFormulario({ inicial: VACIO, editandoId: null })} className="btn-primary group">
          <UserPlus size={16} />
          Nuevo usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="mt-6 grid gap-3 rounded-md border border-borde bg-white p-4 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <label className="relative">
          <span className="sr-only">Buscar</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={filtros.q} onChange={setFiltro('q')} placeholder="Nombre, correo o programa" className="campo !pl-9" />
        </label>
        <select value={filtros.rol} onChange={setFiltro('rol')} className="campo" aria-label="Rol">
          <option value="">Todos los roles</option>
          <option value="INVESTIGADOR">Investigadores</option>
          <option value="EMPRENDEDOR">Emprendedores</option>
          <option value="ISU">Líderes ISU</option>
          <option value="ADMINISTRADOR">Administradores</option>
        </select>
        <select value={filtros.sede} onChange={setFiltro('sede')} className="campo" aria-label="Sede">
          <option value="">Todas las sedes</option>
          {SEDES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={filtros.activo} onChange={setFiltro('activo')} className="campo" aria-label="Estado">
          <option value="">Activas e inactivas</option>
          <option value="1">Solo activas</option>
          <option value="0">Solo inactivas</option>
        </select>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {usuarios.length} cuentas · {activos} activas
      </p>

      {/* Tabla */}
      <div className="mt-2 overflow-x-auto rounded-md border border-borde bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-borde bg-fondo text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Usuario</th>
              <th className="px-4 py-3 font-semibold">Rol</th>
              <th className="px-4 py-3 font-semibold">Sede y programa</th>
              <th className="px-4 py-3 text-right font-semibold">Productos</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {cargando && usuarios.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">Cargando cuentas…</td>
              </tr>
            )}
            {!cargando && usuarios.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">No hay cuentas con esos filtros.</td>
              </tr>
            )}
            {usuarios.map((u) => {
              const esPropio = u.id === yo?.id;
              return (
                <tr key={u.id} className={`transition-colors hover:bg-udec-50/50 ${u.activo ? '' : 'text-slate-400'}`}>
                  <td className="px-4 py-3">
                    <p className={`font-semibold ${u.activo ? 'text-slate-800' : ''}`}>
                      {u.nombre_completo}
                      {esPropio && <span className="ml-2 text-xs font-normal text-udec-700">(tú)</span>}
                    </p>
                    <p className="text-xs text-slate-500">{u.correo_institucional}</p>
                    {u.debe_cambiar_password && (
                      <p className="mt-0.5 text-xs text-amber-700">Pendiente de cambiar contraseña</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${ROLES[u.rol]?.clase || ''}`}>{ROLES[u.rol]?.nombre || u.rol}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p>{u.sede || 'Sin sede'}</p>
                    <p className="text-slate-500">{u.programa_academico}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{u.productos}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => alternarActivo(u)}
                      disabled={esPropio}
                      role="switch"
                      aria-checked={u.activo}
                      title={esPropio ? 'No puedes desactivar tu propia cuenta' : u.activo ? 'Desactivar' : 'Activar'}
                      className="flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className={`relative h-5 w-9 rounded-full transition-colors ${u.activo ? 'bg-udec-700' : 'bg-slate-300'}`}>
                        <motion.span
                          layout
                          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow ${u.activo ? 'right-0.5' : 'left-0.5'}`}
                        />
                      </span>
                      <span className="text-xs">{u.activo ? 'Activa' : 'Inactiva'}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() =>
                          setFormulario({
                            inicial: { ...VACIO, ...u, sede: u.sede || '', semillero: u.semillero || '' },
                            editandoId: u.id,
                          })
                        }
                        className="rounded p-2 text-slate-500 hover:bg-udec-50 hover:text-udec-800"
                        title="Editar"
                        aria-label={`Editar ${u.nombre_completo}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => restablecer(u)}
                        className="rounded p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-800"
                        title="Restablecer contraseña"
                        aria-label={`Restablecer contraseña de ${u.nombre_completo}`}
                      >
                        <KeyRound size={16} />
                      </button>
                      <button
                        onClick={() => eliminar(u)}
                        disabled={esPropio || u.productos > 0}
                        className="rounded p-2 text-slate-500 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"
                        title={u.productos > 0 ? 'Tiene productos: desactívala en lugar de eliminarla' : 'Eliminar'}
                        aria-label={`Eliminar ${u.nombre_completo}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {formulario && (
          <FormUsuario
            key="form"
            inicial={formulario.inicial}
            editando={Boolean(formulario.editandoId)}
            esPropio={formulario.editandoId === yo?.id}
            onGuardar={guardar}
            onCerrar={() => setFormulario(null)}
          />
        )}
        {temporal && <PasswordTemporal key="temporal" datos={temporal} onCerrar={() => setTemporal(null)} />}
      </AnimatePresence>

      <Toast toast={toast} onCerrar={() => setToast(null)} />
    </div>
  );
}
