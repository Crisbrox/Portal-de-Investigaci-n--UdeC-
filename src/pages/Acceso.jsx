/**
 * pages/Acceso.jsx
 * Acceso institucional: inicio de sesión y registro con validación estricta del dominio
 * @ucundinamarca.edu.co. El registro público solo crea cuentas de EMPRENDEDOR; los demás
 * roles (investigador, líder ISU, administrador) los crea la administración.
 */
import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CircleCheck, Lock, Store } from 'lucide-react';
import { useAuth, validarCorreoInstitucional } from '../context/AuthContext';
import { SEDES, PROGRAMAS } from '../constants/catalogos';
import Logo from '../components/Logo';

const BENEFICIOS = {
  login: {
    titulo: 'Portal de investigación y emprendimiento',
    puntos: [
      'Registra productos con las 31 columnas de la matriz institucional.',
      'Entrega los informes de tus proyectos de Interacción Social (ISU).',
      'Publica tu emprendimiento y vende en la Tienda UdeC.',
      'Sigue el estado de auditoría de cada registro.',
    ],
  },
  registro: {
    titulo: 'Vende lo que haces en la Tienda UdeC',
    puntos: [
      'Publica tu emprendimiento en la vitrina de la universidad.',
      'Sube tus productos con foto, precio y ofertas.',
      'Recibe los pedidos directamente en tu WhatsApp.',
      'Sin comisiones: el pago lo acuerdas con tu cliente.',
    ],
  },
};

function PanelIlustrativo({ modo }) {
  const b = BENEFICIOS[modo];
  return (
    <div className="grano relative hidden flex-col justify-between overflow-hidden bg-udec-900 p-10 text-white lg:flex">
      <div className="relative">
        <Logo tamano={44} claro />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={modo}
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
        >
          <span className="block h-1 w-14 bg-oro-500" aria-hidden="true" />
          <h2 className="mt-5 text-3xl font-semibold leading-tight">{b.titulo}</h2>
          <ul className="mt-6 space-y-3 text-[15px] text-white/80">
            {b.puntos.map((t, i) => (
              <motion.li
                key={t}
                className="flex gap-3"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
              >
                <CircleCheck size={18} className="mt-0.5 shrink-0 text-oro-400" />
                {t}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>

      <p className="relative text-[11px] text-white/40">
        Fusagasugá · Chía · Facatativá · Girardot · Soacha · Ubaté · Zipaquirá
      </p>
    </div>
  );
}

const VACIO = {
  correo_institucional: '',
  password: '',
  confirmar: '',
  nombre_completo: '',
  sede: '',
  programa_academico: '',
};

export default function Acceso() {
  const [params] = useSearchParams();
  const [modo, setModo] = useState(params.get('modo') === 'registro' ? 'registro' : 'login');
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const { iniciarSesion, registrarEmprendedor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Si la sesión expiró, se vuelve a la página donde estaba el usuario
  const destino = location.state?.desde || params.get('volver') || '/panel';
  const expirada = params.get('expirada') === '1';

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  const cambiarModo = (m) => {
    setModo(m);
    setError('');
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError('');

    // Validación de dominio en frontend (el backend la revalida)
    const errorCorreo = validarCorreoInstitucional(form.correo_institucional);
    if (errorCorreo) return setError(errorCorreo);
    if (!form.password) return setError('La contraseña es obligatoria.');

    if (modo === 'registro') {
      if (form.nombre_completo.trim().length < 5) return setError('Ingresa tu nombre completo.');
      if (!form.programa_academico.trim()) return setError('Indica tu programa académico.');
      if (form.password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
      if (form.password !== form.confirmar) return setError('Las contraseñas no coinciden.');
    }

    setEnviando(true);
    try {
      if (modo === 'login') {
        const usuario = await iniciarSesion(form.correo_institucional, form.password);
        navigate(usuario.debe_cambiar_password ? '/panel/cambiar-password' : destino, { replace: true });
      } else {
        const { confirmar, ...datos } = form;
        await registrarEmprendedor(datos);
        navigate('/panel/mi-tienda', { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const campo = (id, etiqueta, props) => (
    <div>
      <label htmlFor={id} className="campo-label">
        {etiqueta}
      </label>
      <input id={id} className="campo" required {...props} />
    </div>
  );

  return (
    <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-2">
      <PanelIlustrativo modo={modo} />

      <div className="flex items-center justify-center bg-fondo px-4 py-12">
        <div className="w-full max-w-md">
          <motion.div layout className="tarjeta overflow-hidden p-7 md:p-8">
            {/* Pestañas */}
            <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
              {[
                ['login', 'Iniciar sesión'],
                ['registro', 'Crear cuenta'],
              ].map(([id, texto]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => cambiarModo(id)}
                  className={`relative flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                    modo === id ? 'text-udec-900' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {modo === id && (
                    <motion.span
                      layoutId="pestana-acceso"
                      className="absolute inset-0 rounded-md bg-white shadow"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{texto}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={modo}
                initial={{ opacity: 0, x: modo === 'registro' ? 24 : -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: modo === 'registro' ? -24 : 24 }}
                transition={{ duration: 0.25 }}
              >
                {modo === 'login' ? (
                  <>
                    <h1 className="text-2xl font-semibold text-udec-900">Acceso institucional</h1>
                    <p className="mt-1 text-sm text-slate-500">Ingresa con tu correo @ucundinamarca.edu.co.</p>
                  </>
                ) : (
                  <>
                    <h1 className="flex items-center gap-2 text-2xl font-semibold text-udec-900">
                      <Store size={22} className="text-oro-600" /> Cuenta de emprendedor
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                      Para publicar tu emprendimiento y vender en la Tienda UdeC.
                    </p>
                  </>
                )}

                {expirada && modo === 'login' && (
                  <div className="mt-4 rounded border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
                    Tu sesión expiró. Ingresa de nuevo y te llevamos a donde estabas.
                  </div>
                )}

                {error && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-700"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={enviar} className="mt-6 space-y-4">
                  {modo === 'registro' &&
                    campo('nombre', 'Nombre completo', {
                      value: form.nombre_completo,
                      onChange: set('nombre_completo'),
                      autoComplete: 'name',
                    })}

                  {campo('correo', 'Correo institucional', {
                    type: 'email',
                    autoComplete: 'email',
                    value: form.correo_institucional,
                    onChange: set('correo_institucional'),
                    placeholder: 'nombre@ucundinamarca.edu.co',
                  })}

                  {modo === 'registro' && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="sede" className="campo-label">
                          Sede
                        </label>
                        <select id="sede" className="campo" value={form.sede} onChange={set('sede')}>
                          <option value="">Selecciona…</option>
                          {SEDES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="programa" className="campo-label">
                          Programa académico
                        </label>
                        <input
                          id="programa"
                          list="programas"
                          className="campo"
                          value={form.programa_academico}
                          onChange={set('programa_academico')}
                          required
                        />
                        <datalist id="programas">
                          {PROGRAMAS.map((p) => (
                            <option key={p} value={p} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                  )}

                  {campo('password', 'Contraseña', {
                    type: 'password',
                    autoComplete: modo === 'login' ? 'current-password' : 'new-password',
                    value: form.password,
                    onChange: set('password'),
                    placeholder: modo === 'registro' ? 'Mínimo 8 caracteres' : undefined,
                  })}

                  {modo === 'registro' &&
                    campo('confirmar', 'Confirmar contraseña', {
                      type: 'password',
                      autoComplete: 'new-password',
                      value: form.confirmar,
                      onChange: set('confirmar'),
                    })}

                  <button type="submit" disabled={enviando} className="btn-primary w-full !py-3">
                    {enviando ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        {modo === 'login' ? 'Verificando…' : 'Creando cuenta…'}
                      </>
                    ) : modo === 'login' ? (
                      'Ingresar al panel'
                    ) : (
                      'Crear cuenta de emprendedor'
                    )}
                  </button>
                </form>

                <div className="mt-6 flex items-start gap-2 border-t border-borde pt-5 text-[13px] leading-snug text-slate-500">
                  <Lock size={14} className="mt-0.5 shrink-0 text-udec-700" />
                  {modo === 'login' ? (
                    <p>
                      ¿Tienes un emprendimiento?{' '}
                      <button type="button" onClick={() => cambiarModo('registro')} className="font-semibold text-udec-700 hover:underline">
                        Crea tu cuenta de emprendedor
                      </button>
                      . Las cuentas de investigador y de líder ISU las crea la administración.
                    </p>
                  ) : (
                    <p>
                      Las cuentas creadas aquí son de <b>emprendedor</b>. Si eres investigador o líder ISU,
                      la administración del portal crea tu cuenta.
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <p className="mt-4 text-center text-[11px] text-slate-400">
            <Link to="/" className="group inline-flex items-center gap-1 hover:text-udec-700">
              <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
              Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
