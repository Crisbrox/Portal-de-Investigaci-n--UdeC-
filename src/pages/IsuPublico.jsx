/**
 * pages/IsuPublico.jsx — Vista pública de los proyectos de Interacción Social Universitaria (ISU).
 * Muestra los proyectos vigentes por periodo con su avance; no expone archivos ni observaciones.
 */
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Target, UserRound, Users2, X } from 'lucide-react';
import api, { msgError } from '../services/api';
import EncabezadoPagina from '../components/EncabezadoPagina';
import { TarjetaLuz } from '../components/motion';
import { normalizar } from '../components/FiltroAutor';
import Contador from '../components/Contador';

/** Nombre propio a partir de un texto en mayúsculas ("ANGELICA MARIA" → "Angelica Maria"). */
const nombrePropio = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/(^|\s)(\p{L})/gu, (m, esp, letra) => esp + letra.toUpperCase());

function Avance({ avance }) {
  const pct = Math.round((avance.entregados / avance.total) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>Entregables</span>
        <span className="font-semibold text-udec-900">
          {avance.entregados} de {avance.total}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-udec-50">
        <motion.div
          className="h-full origin-left rounded-full bg-udec-700"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: pct / 100 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function Detalle({ p, onCerrar }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 50, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl"
      >
        <div className="grano sticky top-0 z-10 bg-udec-900 px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-semibold text-oro-400">
              {p.codigo || 'Proyecto ISU'} · Periodo {p.periodo}
            </p>
            <button onClick={onCerrar} className="-mr-2 -mt-2 rounded p-2 text-white/70 hover:bg-white/10" aria-label="Cerrar">
              <X size={20} />
            </button>
          </div>
          <h2 className="mt-2 text-2xl font-semibold leading-snug">{p.nombre}</h2>
        </div>
        <div className="space-y-5 p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-udec-50 text-udec-800">
              <UserRound size={18} />
            </span>
            <div>
              <p className="text-xs text-slate-500">Líder del proyecto</p>
              <p className="font-semibold text-slate-800">{nombrePropio(p.lider) || 'Sin registrar'}</p>
            </div>
          </div>
          {p.objetivos && (
            <section>
              <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-udec-900">
                <Target size={18} /> Objetivo
              </h3>
              <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-slate-600">{p.objetivos}</p>
            </section>
          )}
          {p.poblacion && (
            <section>
              <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-udec-900">
                <Users2 size={18} /> Población
              </h3>
              <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-slate-600">{p.poblacion}</p>
            </section>
          )}
          <div className="rounded-lg border border-borde bg-fondo p-4">
            <Avance avance={p.avance} />
            <p className="mt-2 text-xs text-slate-500">Video e informes 1 a 4 del periodo.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function IsuPublico() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [q, setQ] = useState('');
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    api
      .get('/isu/publicos')
      .then(({ data }) => {
        setDatos(data);
        const hoy = new Date();
        const enCurso = `${hoy.getFullYear()}-${hoy.getMonth() < 6 ? 'I' : 'II'}`;
        setPeriodo(data.periodos.includes(enCurso) ? enCurso : data.periodos[0] || '');
      })
      .catch((e) => setError(msgError(e)));
  }, []);

  const proyectos = useMemo(() => {
    if (!datos) return [];
    const b = normalizar(q);
    return datos.proyectos.filter(
      (p) =>
        (!periodo || p.periodo === periodo) &&
        (!b || [p.nombre, p.codigo, p.lider, p.poblacion, p.objetivos].some((t) => normalizar(t).includes(b)))
    );
  }, [datos, periodo, q]);

  const lideres = new Set(proyectos.map((p) => normalizar(p.lider)).filter(Boolean)).size;

  return (
    <div>
      <EncabezadoPagina
        titulo="Interacción Social Universitaria"
        miga="ISU"
        descripcion="Proyectos con los que la UdeC trabaja junto a emprendedores, productores, comerciantes y comunidades de la región. Conoce sus objetivos, a quién benefician y cómo avanzan en cada periodo."
      />

      {/* Cifras del periodo */}
      <section className="border-b border-borde bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-borde px-4 lg:px-6">
          {[
            ['Proyectos vigentes', datos ? proyectos.length : null],
            ['Líderes', datos ? lideres : null],
            ['Entregables al día', datos ? proyectos.reduce((s, p) => s + p.avance.entregados, 0) : null],
          ].map(([t, v]) => (
            <div key={t} className="px-4 py-6 first:pl-0">
              <p className="font-serif text-3xl font-semibold text-udec-900 md:text-4xl">
                <Contador valor={v} />
              </p>
              <p className="text-sm text-slate-500">{t}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sticky top-[var(--alto-header,105px)] z-20 border-b border-borde bg-fondo/95 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 lg:px-6">
          <div className="flex gap-1 rounded-lg bg-white p-1 ring-1 ring-borde">
            {(datos?.periodos || []).map((per) => (
              <button
                key={per}
                onClick={() => setPeriodo(per)}
                className={`relative rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${periodo === per ? 'text-white' : 'text-slate-600 hover:text-udec-900'}`}
              >
                {periodo === per && (
                  <motion.span layoutId="periodo-isu-publico" className="absolute inset-0 rounded-md bg-udec-900" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                )}
                <span className="relative">{per}</span>
              </button>
            ))}
          </div>
          <label className="relative min-w-60 flex-1">
            <span className="sr-only">Buscar</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Proyecto, líder, población o municipio" className="campo !pl-9" />
          </label>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
        {error && <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {!datos && !error && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="esqueleto h-64 rounded-xl" />
            ))}
          </div>
        )}
        {datos && proyectos.length === 0 && (
          <p className="py-16 text-center text-slate-500">No hay proyectos que coincidan con la búsqueda.</p>
        )}
        <motion.div layout className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {proyectos.map((p) => (
              <TarjetaLuz
                key={p.id}
                as="article"
                layout
                inclinacion={2}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setSeleccion(p)}
                data-cursor="Ver"
                className="group flex cursor-pointer flex-col rounded-xl border border-borde bg-white p-6 transition-shadow hover:shadow-tarjeta-hover"
              >
                <div className="relative z-10 flex flex-1 flex-col">
                  <p className="text-xs font-semibold text-udec-700">{p.codigo || 'Proyecto ISU'}</p>
                  <h3 className="mt-2 line-clamp-3 font-serif text-xl font-semibold leading-snug text-slate-900 group-hover:text-udec-800">
                    {p.nombre}
                  </h3>
                  {p.poblacion && <p className="mt-3 line-clamp-2 text-sm text-slate-500">{p.poblacion}</p>}
                  <div className="mt-auto space-y-4 pt-5">
                    <p className="flex items-center gap-2 text-sm text-slate-700">
                      <UserRound size={15} className="text-udec-700" />
                      {nombrePropio(p.lider) || 'Sin líder registrado'}
                    </p>
                    <Avance avance={p.avance} />
                  </div>
                </div>
              </TarjetaLuz>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      <AnimatePresence>{seleccion && <Detalle key={seleccion.id} p={seleccion} onCerrar={() => setSeleccion(null)} />}</AnimatePresence>
    </div>
  );
}
