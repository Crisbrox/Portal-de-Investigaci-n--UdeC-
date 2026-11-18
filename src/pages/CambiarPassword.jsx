/**
 * pages/CambiarPassword.jsx
 * Cambio de contraseña propia. Es obligatorio en el primer ingreso con una contraseña temporal.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function CambiarPassword() {
  const { usuario, cambiarPassword } = useAuth();
  const navigate = useNavigate();
  const obligatorio = Boolean(usuario?.debe_cambiar_password);

  const [form, setForm] = useState({ actual: '', nueva: '', confirmar: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    if (form.nueva.length < 8) return setError('La nueva contraseña debe tener al menos 8 caracteres.');
    if (form.nueva !== form.confirmar) return setError('La confirmación no coincide con la nueva contraseña.');

    setEnviando(true);
    try {
      const { mensaje } = await cambiarPassword(form.actual, form.nueva);
      setToast({ tipo: 'success', mensaje });
      setForm({ actual: '', nueva: '', confirmar: '' });
      if (obligatorio) setTimeout(() => navigate('/panel', { replace: true }), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <p className="antetitulo">Seguridad de la cuenta</p>
      <h1 className="mt-3 text-2xl font-semibold text-udec-900 md:text-3xl">Cambiar contraseña</h1>

      {obligatorio && (
        <div className="mt-5 flex items-start gap-3 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <KeyRound size={18} className="mt-0.5 shrink-0" />
          <p>
            Tu cuenta fue creada (o restablecida) por la administración con una contraseña temporal.
            Define una contraseña propia para continuar.
          </p>
        </div>
      )}

      <form onSubmit={enviar} className="tarjeta mt-6 space-y-4 p-6">
        {error && (
          <div role="alert" className="rounded border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="actual" className="campo-label">
            {obligatorio ? 'Contraseña temporal' : 'Contraseña actual'}
          </label>
          <input id="actual" type="password" autoComplete="current-password" value={form.actual} onChange={set('actual')} className="campo" required />
        </div>
        <div>
          <label htmlFor="nueva" className="campo-label">
            Nueva contraseña
          </label>
          <input id="nueva" type="password" autoComplete="new-password" value={form.nueva} onChange={set('nueva')} placeholder="Mínimo 8 caracteres" className="campo" required />
        </div>
        <div>
          <label htmlFor="confirmar" className="campo-label">
            Confirmar nueva contraseña
          </label>
          <input id="confirmar" type="password" autoComplete="new-password" value={form.confirmar} onChange={set('confirmar')} className="campo" required />
        </div>
        <button type="submit" disabled={enviando} className="btn-primary w-full !py-3">
          {enviando ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>

      <Toast toast={toast} onCerrar={() => setToast(null)} />
    </div>
  );
}
