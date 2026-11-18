/**
 * components/motion.jsx
 * Primitivas de animación del portal (Framer Motion).
 */
import { useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';

/** Curva de aceleración común: arranque rápido y frenado suave. */
export const EASE = [0.22, 1, 0.36, 1];

/** Variantes para listas escalonadas: el contenedor orquesta, los hijos aparecen. */
export const contenedorEscalonado = (paso = 0.08, retraso = 0) => ({
  oculto: {},
  visible: { transition: { staggerChildren: paso, delayChildren: retraso } },
});

export const itemEscalonado = {
  oculto: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/** Aparece al entrar en pantalla. */
export function Aparecer({ as = 'div', retraso = 0, y = 28, x = 0, className = '', children, ...props }) {
  const Comp = motion[as];
  return (
    <Comp
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.75, ease: EASE, delay: retraso }}
      className={className}
      {...props}
    >
      {children}
    </Comp>
  );
}

/** Contenedor que escalona la entrada de sus hijos `ItemEscalonado` al hacerse visible. */
export function Escalonar({ as = 'div', paso = 0.08, retraso = 0, className = '', children, ...props }) {
  const Comp = motion[as];
  return (
    <Comp
      variants={contenedorEscalonado(paso, retraso)}
      initial="oculto"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className={className}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function ItemEscalonado({ as = 'div', className = '', children, ...props }) {
  const Comp = motion[as];
  return (
    <Comp variants={itemEscalonado} className={className} {...props}>
      {children}
    </Comp>
  );
}

/** Título que se revela palabra por palabra desde una máscara. */
export function TextoRevelado({ texto, as = 'h1', className = '', retraso = 0, paso = 0.07 }) {
  const Comp = motion[as];
  const palabras = texto.split(' ');
  return (
    <Comp
      className={className}
      initial="oculto"
      animate="visible"
      variants={contenedorEscalonado(paso, retraso)}
      aria-label={texto}
    >
      {palabras.map((p, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-top" aria-hidden="true">
          <motion.span
            className="inline-block"
            variants={{
              oculto: { y: '110%', rotate: 4 },
              visible: { y: 0, rotate: 0, transition: { duration: 0.9, ease: EASE } },
            }}
          >
            {p}
            {i < palabras.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </Comp>
  );
}

/** Envuelve un elemento para que siga levemente al cursor (efecto magnético). */
export function Magnetico({ children, fuerza = 0.25, className = '' }) {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 15, mass: 0.4 });

  const mover = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * fuerza);
    y.set((e.clientY - (r.top + r.height / 2)) * fuerza);
  };
  const soltar = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      onPointerMove={mover}
      onPointerLeave={soltar}
      style={{ x, y }}
      className={`inline-flex ${className}`}
    >
      {children}
    </motion.span>
  );
}

/** Tarjeta con luz que sigue al cursor y ligera inclinación 3D. */
export function TarjetaLuz({ as = 'div', className = '', children, inclinacion = 4, ...props }) {
  const Comp = motion[as];
  const ref = useRef(null);
  const [luz, setLuz] = useState({ x: 50, y: 50, activa: false });
  const rx = useSpring(0, { stiffness: 180, damping: 18 });
  const ry = useSpring(0, { stiffness: 180, damping: 18 });

  const mover = (e) => {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setLuz({ x: px * 100, y: py * 100, activa: true });
    ry.set((px - 0.5) * inclinacion * 2);
    rx.set(-(py - 0.5) * inclinacion * 2);
  };
  const salir = () => {
    setLuz((l) => ({ ...l, activa: false }));
    rx.set(0);
    ry.set(0);
  };

  return (
    <Comp
      ref={ref}
      onPointerMove={mover}
      onPointerLeave={salir}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className={`relative ${className}`}
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: luz.activa ? 1 : 0,
          background: `radial-gradient(420px circle at ${luz.x}% ${luz.y}%, rgba(0,122,61,0.09), transparent 45%)`,
        }}
      />
      {children}
    </Comp>
  );
}

/** Barra fina que indica el avance de lectura de la página. */
export function BarraProgreso() {
  const { scrollYProgress } = useScroll();
  const escala = useSpring(scrollYProgress, { stiffness: 140, damping: 24, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: escala }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-oro-500"
    />
  );
}

/** Desplaza verticalmente un elemento a distinta velocidad que el scroll (parallax). */
export function Parallax({ children, distancia = 80, className = '' }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [distancia, -distancia]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
