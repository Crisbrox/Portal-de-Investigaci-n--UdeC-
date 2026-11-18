/**
 * components/EncabezadoPagina.jsx
 * Cabecera de las páginas públicas: miga de pan, título y descripción.
 */
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function EncabezadoPagina({ titulo, descripcion, miga, children }) {
  return (
    <section className="border-b border-borde bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 lg:px-6">
        <nav className="flex items-center gap-1 text-[13px] text-slate-500" aria-label="Ruta">
          <Link to="/" className="hover:text-udec-800 hover:underline">
            Inicio
          </Link>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-slate-700">{miga || titulo}</span>
        </nav>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold leading-tight text-udec-900 md:text-[2.5rem]">
              {titulo}
            </h1>
            <span className="mt-4 block h-1 w-14 bg-oro-500" aria-hidden="true" />
            {descripcion && (
              <p className="mt-4 text-base leading-relaxed text-slate-600">{descripcion}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
