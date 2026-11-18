/**
 * pages/Home.jsx — Inicio público
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight, ArrowUpRight, MapPin } from 'lucide-react';
import api from '../services/api';
import Contador from '../components/Contador';
import {
  Aparecer,
  EASE,
  Escalonar,
  ItemEscalonado,
  Magnetico,
  TarjetaLuz,
  TextoRevelado,
} from '../components/motion';
import {
  MarquesinaVelocidad,
  SelloGiratorio,
  TextoScroll,
  useEsEscritorio,
} from '../components/efectos';

const SEDES = ['Fusagasugá', 'Chía', 'Facatativá', 'Girardot', 'Soacha', 'Ubaté', 'Zipaquirá'];

const PASOS = [
  {
    titulo: 'Registra',
    texto:
      'Docentes e investigadores cargan su producción con los 31 campos de la matriz institucional y adjuntan los soportes. Cada registro entra como Parcial.',
    enlace: '/acceso',
    cta: 'Ingresar',
    tema: 'bg-white text-udec-900',
  },
  {
    titulo: 'Audita',
    texto:
      'La administración revisa cada soporte y asigna su estado de evidencia con observaciones. La matriz se importa y se exporta en Excel.',
    enlace: '/estadisticas',
    cta: 'Ver indicadores',
    tema: 'bg-udec-900 text-white grano',
  },
  {
    titulo: 'Publica',
    texto:
      'Los emprendedores de la comunidad venden sus productos en la Tienda UdeC. Los clientes arman su pedido y lo envían por WhatsApp.',
    enlace: '/tienda',
    cta: 'Ir a la tienda',
    tema: 'bg-oro-500 text-udec-950',
  },
];

/* ---------------------------------------------------------------- */

function Hero({ kpis }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const xLinea1 = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const xLinea2 = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacidad = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[calc(100svh-var(--alto-header,105px))] flex-col justify-between overflow-hidden bg-white px-4 pb-8 pt-10 lg:px-10"
    >
      <div className="flex items-start justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="max-w-xs"
        >
          <p className="antetitulo">Portal institucional</p>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
            Producción científica y emprendimiento de las siete sedes de la Universidad de
            Cundinamarca, en un solo lugar.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -40 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.4 }}
          className="hidden text-udec-900 sm:block"
        >
          <SelloGiratorio texto="Universidad de Cundinamarca · Ex umbra in solem · " tamano={160}>
            <img src="/img/logo-udec.png" alt="" className="h-16 w-auto" />
          </SelloGiratorio>
        </motion.div>
      </div>

      {/* Tipografía gigante que se separa al hacer scroll */}
      <motion.div style={{ opacity: opacidad }} className="my-10 select-none">
        <motion.div style={{ x: xLinea1 }}>
          <TextoRevelado
            as="div"
            texto="Investigación"
            className="font-serif text-[clamp(3.2rem,12.5vw,12.5rem)] font-semibold leading-[0.9] tracking-[-0.035em] text-udec-900"
            retraso={0.15}
          />
        </motion.div>
        <motion.div style={{ x: xLinea2 }} className="flex items-baseline justify-end gap-[0.15em]">
          <motion.span
            initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.55 }}
            className="font-serif text-[clamp(3.2rem,12.5vw,12.5rem)] font-medium italic leading-[0.9] text-oro-500"
          >
            &amp;
          </motion.span>
          <TextoRevelado
            as="div"
            texto="emprendimiento"
            className="font-serif text-[clamp(3.2rem,12.5vw,12.5rem)] font-semibold leading-[0.9] tracking-[-0.035em] text-udec-900"
            retraso={0.35}
          />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.9 }}
        className="flex flex-wrap items-end justify-between gap-6"
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Magnetico fuerza={0.4}>
            <Link to="/acceso" className="btn-primary group rounded-full !px-7 !py-3.5">
              Acceso institucional
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Magnetico>
          <Link to="/repositorio" className="enlace text-[15px]">
            Consultar el repositorio
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="flex items-end gap-10">
          <div className="hidden text-right md:block">
            <p className="font-serif text-5xl font-semibold text-udec-900">
              <Contador valor={kpis?.total} duracion={1800} />
            </p>
            <p className="text-sm text-slate-500">productos en la matriz</p>
          </div>
          <div className="flex flex-col items-center gap-2 text-xs text-slate-500">
            <span>Desliza</span>
            <span className="relative block h-12 w-px overflow-hidden bg-borde">
              <motion.span
                className="absolute inset-x-0 top-0 h-1/2 bg-udec-800"
                animate={{ y: ['-100%', '200%'] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </span>
            <ArrowDown size={14} />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function BandaSedes() {
  return (
    <section className="grano overflow-hidden bg-udec-900 py-7 text-white" aria-label="Sedes de la UdeC">
      <MarquesinaVelocidad velocidad={2.2}>
        {SEDES.map((s, i) => (
          <span key={s} className="flex items-center">
            <span
              className={`px-8 font-serif text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-none ${
                i % 2 ? 'texto-contorno text-oro-400' : 'text-white'
              }`}
            >
              {s}
            </span>
            <span className="h-3 w-3 rotate-45 bg-oro-500" />
          </span>
        ))}
      </MarquesinaVelocidad>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function Manifiesto() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-28 lg:px-6 lg:py-40">
      <Aparecer>
        <p className="antetitulo">Ex umbra in solem</p>
      </Aparecer>
      <TextoScroll
        className="mt-8 font-serif text-[clamp(1.8rem,4.2vw,3.6rem)] font-medium leading-[1.15] tracking-[-0.01em] text-udec-900"
        texto="De la sombra a la luz. Cada trabajo de grado, cada artículo y cada emprendimiento que nace en la UdeC merece salir del archivo y ser visto por toda la comunidad."
      />
    </section>
  );
}

/* ---------------------------------------------------------------- */

function TarjetaPaso({ paso, indice, className = '' }) {
  return (
    <div
      className={`flex flex-col justify-between rounded-[2rem] p-8 shadow-[0_30px_60px_-30px_rgba(0,46,27,0.35)] lg:p-12 ${paso.tema} ${className}`}
    >
      <div className="flex items-start justify-between">
        <span className="font-serif text-[clamp(4rem,9vw,9rem)] font-semibold leading-none opacity-90">
          0{indice + 1}
        </span>
        <Link
          to={paso.enlace}
          data-cursor="Ir"
          className="group flex h-14 w-14 items-center justify-center rounded-full border border-current transition-colors hover:bg-current"
          aria-label={paso.cta}
        >
          <ArrowUpRight size={22} className="transition-transform duration-300 group-hover:rotate-45 group-hover:invert" />
        </Link>
      </div>
      <div>
        <h3 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-none">{paso.titulo}</h3>
        <p className="mt-5 max-w-md text-base leading-relaxed opacity-80 lg:text-lg">{paso.texto}</p>
      </div>
    </div>
  );
}

/** Sección fijada: el scroll vertical desplaza los pasos horizontalmente (solo escritorio). */
function ComoFunciona() {
  const escritorio = useEsEscritorio();
  const seccion = useRef(null);
  const pista = useRef(null);
  const [recorrido, setRecorrido] = useState(0);
  const { scrollYProgress } = useScroll({ target: seccion });
  const x = useTransform(scrollYProgress, [0, 1], [0, -recorrido]);

  useLayoutEffect(() => {
    if (!escritorio) return undefined;
    const medir = () => setRecorrido(pista.current.scrollWidth - window.innerWidth);
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, [escritorio]);

  const intro = (
    <div className="flex shrink-0 flex-col justify-center lg:w-[34vw] lg:pr-10">
      <p className="antetitulo">Cómo funciona</p>
      <h2 className="mt-5 font-serif text-[clamp(2.4rem,4.6vw,4.4rem)] font-semibold leading-[1.02] text-udec-900">
        Tres pasos, una sola matriz.
      </h2>
      <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-slate-600">
        Del registro del investigador a la vitrina pública, todo queda trazado en la base de datos
        institucional.
      </p>
    </div>
  );

  if (!escritorio) {
    return (
      <section className="space-y-6 bg-fondo px-4 py-20">
        {intro}
        {PASOS.map((p, i) => (
          <Aparecer key={p.titulo}>
            <TarjetaPaso paso={p} indice={i} className="min-h-[26rem]" />
          </Aparecer>
        ))}
      </section>
    );
  }

  return (
    <section ref={seccion} className="relative h-[320vh] bg-fondo">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div ref={pista} style={{ x }} className="flex gap-8 pl-[6vw] pr-[6vw]">
          {intro}
          {PASOS.map((p, i) => (
            <TarjetaPaso key={p.titulo} paso={p} indice={i} className="h-[72vh] w-[58vw] shrink-0" />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function Celda({ className = '', children, ...props }) {
  return (
    <ItemEscalonado className={className}>
      <TarjetaLuz
        inclinacion={2}
        className="h-full overflow-hidden rounded-[1.75rem] transition-shadow duration-300 hover:shadow-[0_30px_60px_-30px_rgba(0,46,27,0.45)]"
        {...props}
      >
        <div className="relative z-10 h-full">{children}</div>
      </TarjetaLuz>
    </ItemEscalonado>
  );
}

function Bento({ kpis, tabla, productos, emprendimientos }) {
  const filas = tabla ? [...tabla.filas].sort((a, b) => b.total - a.total).slice(0, 5) : [];
  const max = Math.max(...filas.map((f) => f.total), 1);

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Aparecer>
          <p className="antetitulo">El portal en datos</p>
          <h2 className="mt-5 font-serif text-[clamp(2.4rem,4.6vw,4.4rem)] font-semibold leading-[1.02] text-udec-900">
            Lo que pasa hoy en la UdeC.
          </h2>
        </Aparecer>
        <Aparecer retraso={0.1}>
          <Link to="/estadisticas" className="enlace">
            Todas las estadísticas
            <ArrowRight size={16} />
          </Link>
        </Aparecer>
      </div>

      <Escalonar paso={0.09} className="mt-12 grid auto-rows-[minmax(11rem,auto)] gap-4 md:grid-cols-4">
        {/* Total + barras por tipología */}
        <Celda className="md:col-span-2 md:row-span-2">
          <div className="grano flex h-full flex-col justify-between bg-udec-900 p-8 text-white">
            <div>
              <p className="text-sm text-white/60">Productos en la matriz</p>
              <p className="mt-1 font-serif text-[clamp(3.5rem,7vw,6rem)] font-semibold leading-none">
                <Contador valor={kpis?.total} duracion={1800} />
              </p>
            </div>
            <ul className="mt-8 space-y-3">
              {filas.map((f) => (
                <li key={f.tipologia} className="group">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-white/80 group-hover:text-white">{f.tipologia}</span>
                    <span className="font-semibold">{f.total}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: f.total / max }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.3, ease: EASE, delay: 0.2 }}
                      className="h-full origin-left rounded-full bg-oro-400"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Celda>

        <Celda>
          <div className="flex h-full flex-col justify-between border border-borde bg-white p-7">
            <p className="text-sm text-slate-500">Con evidencia verificada</p>
            <p className="font-serif text-6xl font-semibold text-udec-900">
              <Contador valor={kpis?.con_evidencia} />
            </p>
          </div>
        </Celda>

        <Celda>
          <div className="flex h-full flex-col justify-between bg-oro-500 p-7 text-udec-950">
            <p className="text-sm text-udec-950/70">Emprendimientos en vitrina</p>
            <p className="font-serif text-6xl font-semibold">
              <Contador valor={kpis?.emprendimientos} />
            </p>
          </div>
        </Celda>

        {/* Producción reciente */}
        <Celda className="md:col-span-2">
          <div className="h-full border border-borde bg-white p-7">
            <div className="flex items-center justify-between">
              <p className="font-serif text-xl font-semibold text-udec-900">Producción reciente</p>
              <Link to="/repositorio" data-cursor="Ver" className="text-sm font-semibold text-udec-700">
                Repositorio
              </Link>
            </div>
            {productos === null ? (
              <div className="mt-4 space-y-3">
                <div className="esqueleto h-10" />
                <div className="esqueleto h-10" />
              </div>
            ) : productos.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500">
                Aún no hay productos registrados en la matriz.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-borde">
                {productos.slice(0, 4).map((p) => (
                  <li key={p.id}>
                    <Link to="/repositorio" className="group flex gap-4 py-3">
                      <span className="font-serif font-semibold text-oro-600">{p.anio}</span>
                      <span className="min-w-0">
                        <span className="line-clamp-1 text-[15px] text-slate-700 group-hover:text-udec-800">
                          {p.nombre_producto}
                        </span>
                        <span className="line-clamp-1 text-xs text-slate-500">
                          {[p.autor_asesor_1, p.sub_tipologia].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Celda>

        {/* Emprendimientos recientes */}
        {(emprendimientos || []).map((e, i) => (
          <Celda key={e.id} className={i === 0 ? 'md:col-span-2' : ''}>
            <Link
              to="/vitrina"
              data-cursor="Ver"
              className={`group flex h-full flex-col justify-between p-7 ${
                i === 0 ? 'bg-udec-100' : 'border border-borde bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-udec-900 font-serif text-xl font-semibold text-white transition-transform duration-500 group-hover:rotate-[360deg]">
                  {e.nombre_emprendimiento?.charAt(0)}
                </span>
                <span className="rounded-full border border-udec-900/15 px-3 py-1 text-xs font-semibold text-udec-800">
                  {e.etapa}
                </span>
              </div>
              <div className="mt-6">
                <p className="font-serif text-2xl font-semibold text-udec-900">{e.nombre_emprendimiento}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{e.descripcion_corta}</p>
                <p className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={12} /> {e.sede_udec} · {e.sector_categoria}
                </p>
              </div>
            </Link>
          </Celda>
        ))}
      </Escalonar>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function Cierre() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const escala = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const radio = useTransform(scrollYProgress, [0, 1], [64, 0]);

  return (
    <section ref={ref} className="bg-white px-0">
      <motion.div
        style={{ scale: escala, borderTopLeftRadius: radio, borderTopRightRadius: radio }}
        className="grano overflow-hidden bg-udec-900 px-4 py-24 text-white lg:px-10 lg:py-32"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-12">
          <div>
            <Aparecer>
              <p className="text-sm text-white/60">¿Tienes un emprendimiento en la comunidad UdeC?</p>
            </Aparecer>
            <TextoRevelado
              as="h2"
              texto="Muestra lo que haces."
              className="mt-4 font-serif text-[clamp(3rem,8vw,7.5rem)] font-semibold leading-[0.95] tracking-[-0.03em]"
            />
          </div>
          <Aparecer retraso={0.2}>
            <Magnetico fuerza={0.5}>
              <Link
                to="/acceso?modo=registro"
                className="group relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-oro-500 text-center font-semibold text-udec-950"
              >
                <span className="absolute inset-0 scale-0 rounded-full bg-white transition-transform duration-500 ease-out group-hover:scale-100" />
                <span className="relative">
                  Crear cuenta
                  <br />
                  de emprendedor
                </span>
              </Link>
            </Magnetico>
          </Aparecer>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------- */

export default function Home() {
  const [kpis, setKpis] = useState(null);
  const [tabla, setTabla] = useState(null);
  const [productos, setProductos] = useState(null);
  const [emprendimientos, setEmprendimientos] = useState(null);

  useEffect(() => {
    api
      .get('/stats/resumen')
      .then(({ data }) => setKpis(data.kpis))
      .catch(() => setKpis({ total: 0, con_evidencia: 0, emprendimientos: 0, en_revision: 0 }));
    api
      .get('/stats/tabla-prod')
      .then(({ data }) => setTabla(data))
      .catch(() => setTabla({ filas: [], anios: [], gran_total: 0 }));
    api
      .get('/investigacion/publicos', { params: { todas: 1 } })
      .then(({ data }) => setProductos(data.productos || []))
      .catch(() => setProductos([]));
    api
      .get('/emprendimientos')
      .then(({ data }) => setEmprendimientos((data.emprendimientos || []).slice(0, 3)))
      .catch(() => setEmprendimientos([]));
  }, []);

  return (
    <div className="overflow-x-clip">
      <Hero kpis={kpis} />
      <BandaSedes />
      <Manifiesto />
      <ComoFunciona />
      <Bento kpis={kpis} tabla={tabla} productos={productos} emprendimientos={emprendimientos} />
      <Cierre />
    </div>
  );
}
