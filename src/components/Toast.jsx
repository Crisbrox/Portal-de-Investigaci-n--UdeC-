/**
 * components/Toast.jsx
 * Notificación flotante (éxito / error / info).
 */
import { useEffect } from 'react';
import { CircleCheck, CircleX, Info, X } from 'lucide-react';

const ESTILOS = {
  success: 'border-udec-500 bg-udec-50 text-udec-900',
  error: 'border-red-400 bg-red-50 text-red-800',
  info: 'border-oro-500 bg-amber-50 text-amber-900',
};

const ICONOS = { success: CircleCheck, error: CircleX, info: Info };

export default function Toast({ toast, onCerrar, duracion = 5000 }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onCerrar, duracion);
    return () => clearTimeout(t);
  }, [toast, onCerrar, duracion]);

  if (!toast) return null;
  const estilo = ESTILOS[toast.tipo] || ESTILOS.info;
  const Icono = ICONOS[toast.tipo] || ICONOS.info;

  return (
    <div className="fixed bottom-5 right-5 z-[60] max-w-sm animate-scale-in">
      <div className={`relative flex items-start gap-3 overflow-hidden rounded-xl border-l-4 p-4 shadow-xl ${estilo}`}>
        <Icono size={20} className="mt-0.5 shrink-0" />
        <p className="flex-1 text-sm font-medium leading-snug">{toast.mensaje}</p>
        <button
          onClick={onCerrar}
          className="opacity-50 transition hover:rotate-90 hover:opacity-100"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
        {/* Barra de tiempo restante */}
        <span
          className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-current opacity-30"
          style={{ animation: `encoger ${duracion}ms linear forwards` }}
        />
      </div>
    </div>
  );
}

/** Hook auxiliar para usar toasts de forma sencilla. */
export function useToastState() {
  return [null, null];
}
