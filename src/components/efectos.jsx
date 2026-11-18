/**
 * components/efectos.jsx
 * Efectos de experiencia: scroll suave, cursor propio, marquesina por velocidad,
 * texto que se ilumina con el scroll y sello giratorio.
 */
import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';

/** Scroll con inercia suave en toda la página (Lenis). */
export function ScrollSuave() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4) });
    window.__lenis = lenis;
    let frame;
    const raf = (t) => {
      lenis.raf(t);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);
  return null;
}

/** Sube al inicio de la página respetando el scroll suave. */
export function irArriba() {
  if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
}

const CONSULTA_ESCRITORIO = '(min-width: 1024px) and (pointer: fine)';

/** true en pantallas grandes con mouse (donde tienen sentido el cursor y las secciones fijadas). */
export function useEsEscritorio() {
  const [es, setEs] = useState(() => window.matchMedia(CONSULTA_ESCRITORIO).matches);
  useEffect(() => {
    const mq = window.matchMedia(CONSULTA_ESCRITORIO);
    const cambiar = () => setEs(mq.matches);
    mq.addEventListener('change', cambiar);
    return () => mq.removeEventListener('change', cambiar);
  }, []);
  return es;
}

/**
 * Cursor propio: punto + anillo que lo sigue con resorte.
 * Crece sobre enlaces y botones; muestra una etiqueta en elementos con data-cursor="Texto".
 */
export function Cursor() {
  const escritorio = useEsEscritorio();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ax = useSpring(x, { stiffness: 260, damping: 26, mass: 0.6 });
  const ay = useSpring(y, { stiffness: 260, damping: 26, mass: 0.6 });
  const [estado, setEstado] = useState({ modo: 'normal', texto: '' });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!escritorio) return undefined;
    document.documentElement.classList.add('cursor-propio');
    const mover = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const objetivo = e.target.closest?.('[data-cursor], a, button, select, input, textarea, label');
      if (!objetivo) setEstado({ modo: 'normal', texto: '' });
      else if (objetivo.dataset.cursor) setEstado({ modo: 'etiqueta', texto: objetivo.dataset.cursor });
      else if (['INPUT', 'TEXTAREA'].includes(objetivo.tagName)) setEstado({ modo: 'texto', texto: '' });
      else setEstado({ modo: 'enlace', texto: '' });
    };
    const salir = () => setVisible(false);
    window.addEventListener('pointermove', mover);
    document.addEventListener('pointerleave', salir);
    return () => {
      document.documentElement.classList.remove('cursor-propio');
      window.removeEventListener('pointermove', mover);
      document.removeEventListener('pointerleave', salir);
    };
  }, [escritorio, x, y]);

  if (!escritorio) return null;

  const tamano = { normal: 34, enlace: 56, etiqueta: 88, texto: 6 }[estado.modo];
  const estilos = {
    normal: 'ring-1 ring-udec-700/60',
    enlace: 'bg-oro-500/25 ring-1 ring-oro-500',
    etiqueta: 'bg-oro-500 text-udec-950',
    texto: 'bg-udec-800',
  };

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{ x: ax, y: ay, translateX: '-50%', translateY: '-50%' }}
        animate={{ width: tamano, height: tamano, opacity: visible ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className={`pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center rounded-full ${estilos[estado.modo]}`}
      >
        {estado.modo === 'etiqueta' && (
          <motion.span
            key={estado.texto}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-semibold"
          >
            {estado.texto}
          </motion.span>
        )}
      </motion.div>
      <motion.div
        aria-hidden="true"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: visible && estado.modo === 'normal' ? 1 : 0 }}
        className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full bg-udec-800"
      />
    </>
  );
}

/** Repite un valor dentro del rango [min, max). */
const envolver = (min, max, v) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/** Marquesina infinita cuya velocidad y dirección responden al scroll. */
export function MarquesinaVelocidad({ children, velocidad = 2, className = '' }) {
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const vel = useVelocity(scrollY);
  const velSuave = useSpring(vel, { damping: 50, stiffness: 400 });
  const factor = useTransform(velSuave, [0, 1000], [0, 5], { clamp: false });
  const x = useTransform(base, (v) => `${envolver(-25, 0, v)}%`);
  const direccion = useRef(-1);

  useAnimationFrame((_, delta) => {
    let mov = direccion.current * velocidad * (delta / 1000);
    if (factor.get() < 0) direccion.current = 1;
    else if (factor.get() > 0) direccion.current = -1;
    mov += direccion.current * Math.abs(mov) * Math.abs(factor.get());
    base.set(base.get() + mov);
  });

  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <motion.div style={{ x }} className={`flex shrink-0 ${className}`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="flex shrink-0" aria-hidden={i > 0}>
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function PalabraScroll({ palabra, progreso, rango }) {
  const opacidad = useTransform(progreso, rango, [0.15, 1]);
  const y = useTransform(progreso, rango, [8, 0]);
  return (
    <motion.span style={{ opacity: opacidad, y }} className="mr-[0.25em] inline-block">
      {palabra}
    </motion.span>
  );
}

/** Párrafo cuyas palabras se iluminan una a una a medida que se hace scroll. */
export function TextoScroll({ texto, className = '' }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.4'] });
  const palabras = texto.split(' ');
  return (
    <p ref={ref} className={className} aria-label={texto}>
      {palabras.map((p, i) => (
        <PalabraScroll
          key={i}
          palabra={p}
          progreso={scrollYProgress}
          rango={[i / palabras.length, (i + 1) / palabras.length]}
        />
      ))}
    </p>
  );
}

/** Sello circular con texto que gira lentamente y acelera con el scroll. */
export function SelloGiratorio({ texto, tamano = 150, className = '', children }) {
  const { scrollY } = useScroll();
  const base = useMotionValue(0);
  useAnimationFrame((_, delta) => base.set(base.get() + delta * 0.012));
  const rot = useTransform([base, scrollY], ([a, s]) => a + s * 0.15);
  return (
    <div className="relative" style={{ width: tamano, height: tamano }}>
      <motion.svg viewBox="0 0 200 200" style={{ rotate: rot }} className={`absolute inset-0 ${className}`}>
        <defs>
          <path id="trazo-sello" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text className="fill-current text-[14.5px] font-semibold uppercase tracking-[0.3em]">
          <textPath href="#trazo-sello">{texto}</textPath>
        </text>
      </motion.svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
