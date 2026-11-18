/**
 * components/FiltroAutor.jsx
 * Campo de búsqueda por autor con autocompletado (autor/asesor 1-3 y otros autores).
 */
import { useId } from 'react';
import { UserSearch, X } from 'lucide-react';

/** Minúsculas y sin tildes, para comparar nombres sin importar cómo se escribieron. */
export const normalizar = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** true si alguno de los autores del producto contiene el texto buscado. */
export function coincideAutor(producto, texto) {
  const buscado = normalizar(texto);
  if (!buscado) return true;
  return [producto.autor_asesor_1, producto.autor_asesor_2, producto.autor_asesor_3, producto.otros_autores].some(
    (a) => normalizar(a).includes(buscado)
  );
}

/** Lista de autores distintos (autor/asesor 1-3) con su número de productos, de mayor a menor. */
export function autoresDe(productos) {
  const conteo = new Map();
  productos.forEach((p) => {
    [p.autor_asesor_1, p.autor_asesor_2, p.autor_asesor_3].forEach((a) => {
      const nombre = String(a || '').trim();
      if (nombre) conteo.set(nombre, (conteo.get(nombre) || 0) + 1);
    });
  });
  return [...conteo.entries()]
    .map(([nombre, productos]) => ({ nombre, productos }))
    .sort((a, b) => b.productos - a.productos || a.nombre.localeCompare(b.nombre));
}

export default function FiltroAutor({ valor, onCambiar, autores = [], className = '' }) {
  const id = useId();
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">Filtrar por autor</span>
      <UserSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        list={id}
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        placeholder="Autor o asesor"
        className="campo !pl-9 !pr-8"
      />
      {valor && (
        <button
          type="button"
          onClick={() => onCambiar('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
          aria-label="Quitar filtro de autor"
        >
          <X size={14} />
        </button>
      )}
      <datalist id={id}>
        {autores.map((a) => (
          <option key={a.nombre} value={a.nombre}>
            {a.productos} producto{a.productos !== 1 ? 's' : ''}
          </option>
        ))}
      </datalist>
    </label>
  );
}
