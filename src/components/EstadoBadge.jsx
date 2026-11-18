/**
 * components/EstadoBadge.jsx
 * Badge de estado de evidencia con colores institucionales.
 */
import { CircleCheck, CircleDashed, CircleX, Clock } from 'lucide-react';

const ESTILOS = {
  Parcial: 'bg-amber-100 text-amber-800 border border-amber-300',
  'Con evidencia': 'bg-udec-100 text-udec-900 border border-udec-500',
  'Sin evidencia': 'bg-red-50 text-red-700 border border-red-300',
  'No verificado': 'bg-slate-100 text-slate-600 border border-slate-300',
};

const ICONOS = {
  Parcial: Clock,
  'Con evidencia': CircleCheck,
  'Sin evidencia': CircleX,
  'No verificado': CircleDashed,
};

export default function EstadoBadge({ estado, compacto = false }) {
  const clave = estado || 'No verificado';
  const estilo = ESTILOS[clave] || ESTILOS['No verificado'];
  const Icono = ICONOS[clave] || ICONOS['No verificado'];

  return (
    <span className={`badge ${estilo} animate-scale-in`} title={`Estado de evidencia: ${clave}`}>
      <Icono size={12} strokeWidth={2.5} aria-hidden="true" className={clave === 'Parcial' ? 'animate-pulse' : ''} />
      {compacto ? clave.split(' ')[0] : clave}
    </span>
  );
}
