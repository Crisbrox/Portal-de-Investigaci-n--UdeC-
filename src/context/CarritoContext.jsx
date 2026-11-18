/**
 * context/CarritoContext.jsx
 * Carrito de la Tienda UdeC. Se guarda en el navegador y el pedido se envía
 * por WhatsApp a cada emprendimiento (el portal no procesa pagos).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CarritoContext = createContext(null);
const CLAVE = 'udec_carrito';

const formatoCOP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

/** $ 12.500 */
export const pesos = (valor) => formatoCOP.format(Number(valor) || 0);

/** Precio que paga el cliente: la oferta si existe. */
export const precioFinal = (p) => (p.precio_oferta ? p.precio_oferta : p.precio);

/** Número de WhatsApp en formato internacional (Colombia por defecto) o null si no es válido. */
export function numeroWhatsApp(valor) {
  const digitos = String(valor || '').replace(/\D/g, '');
  if (digitos.length === 10 && digitos.startsWith('3')) return `57${digitos}`;
  if (digitos.length >= 11) return digitos;
  return null;
}

/** Mensaje del pedido para un emprendimiento. */
export function mensajePedido(grupo) {
  const lineas = grupo.items.map(
    (i) => `• ${i.cantidad} x ${i.nombre} (${pesos(i.precio)} c/${i.unidad || 'unidad'}) = ${pesos(i.precio * i.cantidad)}`
  );
  return [
    `Hola, ${grupo.nombre_emprendimiento}. Vi sus productos en la Tienda UdeC y quiero hacer este pedido:`,
    '',
    ...lineas,
    '',
    `Total: ${pesos(grupo.total)}`,
    '',
    '¿Me confirman disponibilidad, forma de pago y entrega? Gracias.',
  ].join('\n');
}

function leerGuardado() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE) || '[]');
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

export function CarritoProvider({ children }) {
  const [items, setItems] = useState(leerGuardado);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(items));
    } catch {
      // Sin almacenamiento disponible el carrito sigue funcionando en memoria
    }
  }, [items]);

  /** Agrega un producto del catálogo (guarda los datos necesarios para el pedido). */
  const agregar = useCallback((producto, cantidad = 1) => {
    setItems((actual) => {
      const existente = actual.find((i) => i.id === producto.id);
      const tope = producto.stock ?? Infinity;
      if (existente) {
        return actual.map((i) =>
          i.id === producto.id ? { ...i, cantidad: Math.min(i.cantidad + cantidad, tope) } : i
        );
      }
      return [
        ...actual,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: precioFinal(producto),
          unidad: producto.unidad,
          imagen_url: producto.imagen_url,
          stock: producto.stock,
          cantidad: Math.min(cantidad, tope),
          emprendimiento_id: producto.emprendimiento_id,
          nombre_emprendimiento: producto.nombre_emprendimiento,
          whatsapp: producto.whatsapp,
          instagram: producto.instagram,
          correo_contacto: producto.correo_contacto,
        },
      ];
    });
  }, []);

  const cambiarCantidad = useCallback((id, cantidad) => {
    setItems((actual) =>
      cantidad <= 0
        ? actual.filter((i) => i.id !== id)
        : actual.map((i) => (i.id === id ? { ...i, cantidad: Math.min(cantidad, i.stock ?? Infinity) } : i))
    );
  }, []);

  const quitar = useCallback((id) => setItems((actual) => actual.filter((i) => i.id !== id)), []);

  const vaciarEmprendimiento = useCallback(
    (emprendimientoId) => setItems((actual) => actual.filter((i) => i.emprendimiento_id !== emprendimientoId)),
    []
  );

  /** Ítems agrupados por emprendimiento: cada grupo es un pedido distinto. */
  const grupos = useMemo(() => {
    const mapa = new Map();
    items.forEach((i) => {
      if (!mapa.has(i.emprendimiento_id)) {
        mapa.set(i.emprendimiento_id, {
          emprendimiento_id: i.emprendimiento_id,
          nombre_emprendimiento: i.nombre_emprendimiento,
          whatsapp: i.whatsapp,
          instagram: i.instagram,
          correo_contacto: i.correo_contacto,
          items: [],
          total: 0,
        });
      }
      const g = mapa.get(i.emprendimiento_id);
      g.items.push(i);
      g.total += i.precio * i.cantidad;
    });
    return [...mapa.values()];
  }, [items]);

  const unidades = items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <CarritoContext.Provider
      value={{ items, grupos, unidades, abierto, setAbierto, agregar, cambiarCantidad, quitar, vaciarEmprendimiento }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error('useCarrito debe usarse dentro de <CarritoProvider>');
  return ctx;
}
