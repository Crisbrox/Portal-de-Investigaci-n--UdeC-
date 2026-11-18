/**
 * components/Carrito.jsx
 * Panel lateral del carrito: un pedido por emprendimiento, enviado por WhatsApp.
 */
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { mensajePedido, numeroWhatsApp, pesos, useCarrito } from '../context/CarritoContext';

function IconoWhatsApp({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" />
    </svg>
  );
}

function Grupo({ grupo }) {
  const { cambiarCantidad, quitar, vaciarEmprendimiento } = useCarrito();
  const numero = numeroWhatsApp(grupo.whatsapp);
  const mensaje = encodeURIComponent(mensajePedido(grupo));

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="rounded-md border border-borde bg-white"
    >
      <header className="flex items-center justify-between gap-3 border-b border-borde px-4 py-3">
        <p className="font-serif text-lg font-semibold text-udec-900">{grupo.nombre_emprendimiento}</p>
        <button
          onClick={() => vaciarEmprendimiento(grupo.emprendimiento_id)}
          className="text-xs text-slate-500 hover:text-red-700"
        >
          Vaciar
        </button>
      </header>

      <ul className="divide-y divide-borde">
        <AnimatePresence initial={false}>
          {grupo.items.map((i) => (
            <motion.li
              key={i.id}
              layout
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-3 overflow-hidden px-4 py-3"
            >
              <span className="h-14 w-14 shrink-0 overflow-hidden rounded bg-udec-50">
                {i.imagen_url ? (
                  <img src={i.imagen_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-serif text-xl text-udec-800">
                    {i.nombre.charAt(0)}
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-slate-800">{i.nombre}</p>
                <p className="text-xs text-slate-500">
                  {pesos(i.precio)} / {i.unidad || 'unidad'}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center rounded border border-borde">
                    <button
                      onClick={() => cambiarCantidad(i.id, i.cantidad - 1)}
                      className="p-1.5 text-slate-600 hover:bg-slate-100"
                      aria-label={`Quitar una unidad de ${i.nombre}`}
                    >
                      <Minus size={14} />
                    </button>
                    <motion.span key={i.cantidad} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="w-8 text-center text-sm font-semibold tabular-nums">
                      {i.cantidad}
                    </motion.span>
                    <button
                      onClick={() => cambiarCantidad(i.id, i.cantidad + 1)}
                      disabled={i.stock !== null && i.stock !== undefined && i.cantidad >= i.stock}
                      className="p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                      aria-label={`Agregar una unidad de ${i.nombre}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-udec-900">{pesos(i.precio * i.cantidad)}</span>
                  <button onClick={() => quitar(i.id)} className="p-1 text-slate-400 hover:text-red-700" aria-label={`Quitar ${i.nombre}`}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <footer className="space-y-3 border-t border-borde bg-fondo px-4 py-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Total del pedido</span>
          <span className="font-serif text-lg font-semibold text-udec-900">{pesos(grupo.total)}</span>
        </div>
        {numero ? (
          <a
            href={`https://wa.me/${numero}?text=${mensaje}`}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded bg-[#1FAF38] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#178a2c]"
          >
            <IconoWhatsApp />
            Pedir por WhatsApp
          </a>
        ) : grupo.correo_contacto ? (
          <a
            href={`mailto:${grupo.correo_contacto}?subject=${encodeURIComponent('Pedido desde la Tienda UdeC')}&body=${mensaje}`}
            className="btn-primary w-full"
          >
            <Mail size={16} />
            Enviar pedido por correo
          </a>
        ) : (
          <p className="text-xs text-slate-500">
            Este emprendimiento no registró WhatsApp ni correo. Contáctalo por sus redes desde la vitrina.
          </p>
        )}
      </footer>
    </motion.section>
  );
}

export default function Carrito() {
  const { abierto, setAbierto, grupos, unidades } = useCarrito();

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div key="carrito" className="fixed inset-0 z-[70]" exit={{ opacity: 1 }}>
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAbierto(false)}
          />
          <motion.aside
            data-lenis-prevent
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-fondo shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
          >
            <div className="flex items-center justify-between border-b border-borde bg-white px-5 py-4">
              <div>
                <p className="font-serif text-xl font-semibold text-udec-900">Tu pedido</p>
                <p className="text-xs text-slate-500">
                  {unidades} producto{unidades !== 1 ? 's' : ''} · se envía a cada emprendimiento por separado
                </p>
              </div>
              <button onClick={() => setAbierto(false)} className="rounded p-2 text-slate-500 hover:bg-slate-100" aria-label="Cerrar carrito">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {grupos.length === 0 ? (
                <div className="py-16 text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-udec-50 text-udec-700">
                    <ShoppingBag size={28} />
                  </span>
                  <p className="mt-4 font-serif text-lg font-semibold text-udec-900">Tu carrito está vacío</p>
                  <p className="mt-1 text-sm text-slate-500">Agrega productos de los emprendimientos UdeC.</p>
                  <Link to="/tienda" onClick={() => setAbierto(false)} className="btn-primary mt-5">
                    Ir a la tienda
                  </Link>
                </div>
              ) : (
                <AnimatePresence>
                  {grupos.map((g) => (
                    <Grupo key={g.emprendimiento_id} grupo={g} />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {grupos.length > 0 && (
              <p className="border-t border-borde bg-white px-5 py-3 text-xs leading-relaxed text-slate-500">
                El pago y la entrega se acuerdan directamente con cada emprendimiento. La Tienda UdeC no
                procesa pagos.
              </p>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
