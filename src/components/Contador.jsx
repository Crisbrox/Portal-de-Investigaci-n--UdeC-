/**
 * components/Contador.jsx
 * Número que cuenta desde 0 hasta su valor (easing suave).
 */
import { useEffect, useRef, useState } from 'react';

export default function Contador({ valor, duracion = 1200, className = '' }) {
  const [actual, setActual] = useState(0);
  const desde = useRef(0);

  useEffect(() => {
    if (valor == null || Number.isNaN(Number(valor))) return undefined;
    const objetivo = Number(valor);
    const inicio = desde.current;
    const t0 = performance.now();
    let frame;

    const paso = (t) => {
      const p = Math.min(1, (t - t0) / duracion);
      const suave = 1 - Math.pow(1 - p, 3);
      const v = Math.round(inicio + (objetivo - inicio) * suave);
      setActual(v);
      if (p < 1) frame = requestAnimationFrame(paso);
      else desde.current = objetivo;
    };
    frame = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(frame);
  }, [valor, duracion]);

  if (valor == null) {
    return <span className={`esqueleto inline-block h-[0.9em] w-12 align-middle ${className}`} />;
  }
  return <span className={`tabular-nums ${className}`}>{actual.toLocaleString('es-CO')}</span>;
}
