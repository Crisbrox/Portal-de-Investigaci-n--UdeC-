/**
 * pages/Panel.jsx — Inicio del workspace autenticado.
 * Cada rol ve sus indicadores y accesos: investigador (producción científica),
 * emprendedor (emprendimientos y tienda) y administrador (todo).
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  FilePenLine,
  FileText,
  Plus,
  Rocket,
  ShoppingBag,
  Store,
  Users,
  Users2,
  Sheet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import EstadoBadge from '../components/EstadoBadge';
import Contador from '../components/Contador';
import { pesos } from '../context/CarritoContext';

const ACCESOS = [
  {
    to: '/panel/mis-productos',
    titulo: 'Mis Productos de Investigación',
    texto: 'Consulta, edita (si están Parcial/No verificado) y sigue tu producción científica.',
    Icono: FileText,
    roles: ['INVESTIGADOR'],
  },
  {
    to: '/panel/registrar-producto',
    titulo: 'Registrar Producto',
    texto: 'Formulario en 4 pasos con las 31 columnas de la matriz institucional.',
    Icono: FilePenLine,
    roles: ['INVESTIGADOR'],
  },
  {
    to: '/panel/mi-tienda',
    titulo: 'Mi tienda',
    texto: 'Publica productos con foto y precio; los pedidos te llegan por WhatsApp.',
    Icono: ShoppingBag,
    roles: ['EMPRENDEDOR'],
  },
  {
    to: '/panel/publicar-emprendimiento',
    titulo: 'Publicar Emprendimiento',
    texto: 'Se publica de inmediato en la vitrina pública UdeC.',
    Icono: Rocket,
    roles: ['EMPRENDEDOR'],
  },
  {
    to: '/tienda',
    titulo: 'Ver la Tienda UdeC',
    texto: 'Mira cómo ven tus productos los clientes.',
    Icono: Store,
    roles: ['EMPRENDEDOR'],
  },
  {
    to: '/panel/isu',
    titulo: 'Proyectos ISU',
    texto: 'Sube el video y los informes 1 a 4 de tus proyectos de Interacción Social.',
    Icono: Users2,
    roles: ['ISU'],
  },
  {
    to: '/panel/isu/matriz',
    titulo: 'Matriz ISU (Excel)',
    texto: 'Sube tu matriz de convocatorias e informes ISU; los proyectos quedan a tu nombre.',
    Icono: Sheet,
    roles: ['ISU'],
  },
  {
    to: '/panel/auditoria',
    titulo: 'Auditoría y Validación',
    texto: 'Cambia estados de evidencia y registra observaciones de validación.',
    Icono: ClipboardCheck,
    roles: [],
  },
  {
    to: '/panel/usuarios',
    titulo: 'Usuarios',
    texto: 'Crea cuentas de investigadores, emprendedores y administradores.',
    Icono: Users,
    roles: [],
  },
  {
    to: '/panel/matriz-excel',
    titulo: 'Matriz de investigación (Excel)',
    texto: 'Sube tu matriz .xlsx (queda a tu nombre) y descarga tus productos con 3 hojas.',
    Icono: BarChart3,
    roles: ['INVESTIGADOR'],
  },
];

const SUBTITULO = {
  ADMINISTRADOR: 'Panel de administración',
  INVESTIGADOR: 'Panel del investigador',
  EMPRENDEDOR: 'Panel del emprendedor',
  ISU: 'Panel del líder ISU',
};

export default function Panel() {
  const { usuario, esAdmin } = useAuth();
  const rol = usuario?.rol;
  const veInvestigacion = esAdmin || rol === 'INVESTIGADOR';
  const veTienda = rol === 'EMPRENDEDOR';
  const veIsu = rol === 'ISU';

  const [kpis, setKpis] = useState(null);
  const [recientes, setRecientes] = useState([]);
  const [tienda, setTienda] = useState(null);
  const [isu, setIsu] = useState(null);

  useEffect(() => {
    api
      .get('/stats/resumen')
      .then(({ data }) => setKpis(data.kpis))
      .catch(() => {});

    if (veInvestigacion) {
      api
        .get(esAdmin ? '/investigacion/admin/todos' : '/investigacion/mis')
        .then(({ data }) => setRecientes((data.productos || []).slice(0, 5)))
        .catch(() => {});
    }
    if (veTienda) {
      Promise.all([api.get('/emprendimientos/mis/listado'), api.get('/tienda/mis-productos')])
        .then(([{ data: e }, { data: p }]) => setTienda({ emprendimientos: e.emprendimientos, productos: p.productos }))
        .catch(() => setTienda({ emprendimientos: [], productos: [] }));
    }
    if (veIsu) {
      api
        .get('/isu/proyectos', { params: { vigente: 1 } })
        .then(({ data }) => setIsu(data.proyectos))
        .catch(() => setIsu([]));
    }
  }, [esAdmin, veInvestigacion, veTienda, veIsu]);

  let tarjetas;
  if (veIsu) {
    const contar = (estado) =>
      isu ? isu.reduce((s, p) => s + ['video', 'informe_1', 'informe_2', 'informe_3', 'informe_4'].filter((c) => p[`${c}_estado`] === estado).length, 0) : null;
    tarjetas = [
      { label: 'Mis proyectos vigentes', valor: isu ? isu.length : null },
      { label: 'Entregables pendientes', valor: contar('Pendiente') },
      { label: 'Aprobados', valor: contar('Aprobado') },
      { label: 'Devueltos para corregir', valor: contar('Devuelto') },
    ];
  } else if (veTienda) {
    const productos = tienda?.productos || [];
    tarjetas = [
      { label: 'Mis emprendimientos', valor: tienda ? tienda.emprendimientos.length : null },
      { label: 'Productos a la venta', valor: tienda ? productos.filter((p) => p.disponible).length : null },
      { label: 'En oferta', valor: tienda ? productos.filter((p) => p.precio_oferta).length : null },
      { label: 'Agotados o pausados', valor: tienda ? productos.filter((p) => !p.disponible || p.stock === 0).length : null },
    ];
  } else if (esAdmin) {
    tarjetas = [
      { label: 'Total productos', valor: kpis?.total },
      { label: 'Verificados', valor: kpis?.con_evidencia },
      { label: 'En revisión (Parcial)', valor: kpis?.parcial },
      { label: 'Emprendimientos', valor: kpis?.emprendimientos },
    ];
  } else {
    tarjetas = [
      { label: 'Total productos', valor: kpis?.total },
      { label: 'Con evidencia', valor: kpis?.con_evidencia },
      { label: 'En revisión', valor: kpis?.parcial },
      { label: 'Emprendimientos UdeC', valor: kpis?.emprendimientos },
    ];
  }

  const accesos = ACCESOS.filter((a) => (esAdmin ? true : a.roles.includes(rol)));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="antetitulo">{SUBTITULO[rol] || 'Panel'}</p>
          <h1 className="mt-3 text-2xl font-semibold text-udec-900 md:text-3xl">
            Hola, {usuario?.nombre_completo?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {usuario?.correo_institucional} · {usuario?.programa_academico}
            {usuario?.sede ? ` · Sede ${usuario.sede}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {veInvestigacion && (
            <Link to="/panel/registrar-producto" className="btn-primary group">
              <Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" />
              Registrar producto
            </Link>
          )}
          {veTienda && (
            <Link to="/panel/mi-tienda" className="btn-primary group">
              <Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" />
              Vender un producto
            </Link>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="escalonado mt-8 grid grid-cols-2 divide-borde rounded-md border border-borde bg-white lg:grid-cols-4 lg:divide-x">
        {tarjetas.map((t) => (
          <div key={t.label} className="p-5">
            <p className="font-serif text-3xl font-semibold text-udec-900">
              <Contador valor={t.valor} />
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-600">{t.label}</p>
          </div>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div className="escalonado mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accesos.map(({ to, titulo, texto, Icono }) => (
          <Link key={to} to={to} className="tarjeta tarjeta-hover group p-5">
            <span className="icono-tarjeta">
              <Icono size={22} strokeWidth={1.8} />
            </span>
            <h3 className="mt-3 font-bold text-udec-900 group-hover:text-udec-700">{titulo}</h3>
            <p className="mt-1 text-xs text-slate-500">{texto}</p>
          </Link>
        ))}
      </div>

      {/* Recientes: producción científica */}
      {veInvestigacion && (
        <div className="mt-8 overflow-hidden rounded-md border border-borde bg-white">
          <div className="flex items-center justify-between border-b border-borde bg-fondo px-5 py-3.5">
            <h2 className="text-base font-semibold text-udec-900">
              {esAdmin ? 'Productos actualizados recientemente' : 'Mis últimos productos'}
            </h2>
            <Link
              to={esAdmin ? '/panel/auditoria' : '/panel/mis-productos'}
              className="group inline-flex items-center gap-1 text-xs font-bold text-udec-700 hover:text-udec-900"
            >
              Ver todos
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {recientes.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">
              Aún no hay productos registrados.{' '}
              <Link to="/panel/registrar-producto" className="font-bold text-udec-700">
                Registra el primero
              </Link>
              .
            </p>
          ) : (
            <ul className="escalonado divide-y divide-borde">
              {recientes.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-udec-50/60">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-udec-900">{p.nombre_producto}</p>
                    <p className="text-xs text-slate-400">
                      {p.tipologia} · {p.anio || '—'} · {p.periodo_academico || 'NA'}
                    </p>
                  </div>
                  <EstadoBadge estado={p.estado_evidencia} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Recientes: tienda del emprendedor */}
      {veTienda && tienda && (
        <div className="mt-8 overflow-hidden rounded-md border border-borde bg-white">
          <div className="flex items-center justify-between border-b border-borde bg-fondo px-5 py-3.5">
            <h2 className="text-base font-semibold text-udec-900">Mis productos en la tienda</h2>
            <Link to="/panel/mi-tienda" className="group inline-flex items-center gap-1 text-xs font-bold text-udec-700 hover:text-udec-900">
              Gestionar
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          {tienda.productos.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">
              {tienda.emprendimientos.length === 0 ? (
                <>
                  Primero{' '}
                  <Link to="/panel/publicar-emprendimiento" className="font-bold text-udec-700">
                    publica tu emprendimiento
                  </Link>
                  .
                </>
              ) : (
                <>
                  Aún no vendes productos.{' '}
                  <Link to="/panel/mi-tienda" className="font-bold text-udec-700">
                    Publica el primero
                  </Link>
                  .
                </>
              )}
            </p>
          ) : (
            <ul className="escalonado divide-y divide-borde">
              {tienda.productos.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-udec-900">{p.nombre}</p>
                    <p className="text-xs text-slate-400">{p.nombre_emprendimiento}</p>
                  </div>
                  <span className="text-right text-sm">
                    <span className="font-semibold text-udec-900">{pesos(p.precio_oferta || p.precio)}</span>
                    <span className={`block text-xs ${p.disponible ? 'text-udec-700' : 'text-slate-400'}`}>
                      {p.disponible ? 'A la venta' : 'Pausado'}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
