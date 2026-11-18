/**
 * components/Stepper.jsx
 * Barra de progreso de 4 pasos para el formulario de productos.
 */
import { Check } from 'lucide-react';

export default function Stepper({ pasos, actual, onIr, puedeIr }) {
  const progreso = ((actual) / (pasos.length - 1)) * 100;

  return (
    <div className="mb-8">
      {/* Barra de progreso */}
      <div className="relative mb-6 h-2 rounded-full bg-udec-100">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-udec-800 transition-all duration-700 ease-out"
          style={{ width: `${progreso}%` }}
        />
      </div>

      <ol className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {pasos.map((p, i) => {
          const activo = i === actual;
          const completado = i < actual;
          const alcanzable = puedeIr ? puedeIr(i) : i <= actual;

          return (
            <li key={p.titulo}>
              <button
                type="button"
                onClick={() => alcanzable && onIr && onIr(i)}
                disabled={!alcanzable}
                className={`flex w-full items-start gap-2.5 rounded-lg border p-3 text-left transition-all duration-200 ${
                  activo
                    ? 'border-udec-700 bg-white shadow-md ring-2 ring-udec-100'
                    : completado
                      ? 'border-udec-500/40 bg-white hover:border-udec-500'
                      : 'border-borde bg-white/60'
                } ${alcanzable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    activo
                      ? 'bg-udec-900 text-white ring-4 ring-udec-100 scale-110'
                      : completado
                        ? 'bg-udec-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {completado ? <Check size={14} strokeWidth={3} className="animate-scale-in" /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Paso {i + 1}
                  </span>
                  <span
                    className={`block text-[13px] font-semibold leading-tight ${
                      activo ? 'text-udec-900' : 'text-slate-600'
                    }`}
                  >
                    {p.titulo}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
