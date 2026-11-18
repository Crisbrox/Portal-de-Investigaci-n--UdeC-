/**
 * pages/Estadisticas.jsx
 * Estadísticas e indicadores (pública y admin):
 *  - Tarjetas KPI
 *  - Tabla dinámica TABLA PROD (Tipología x Año)
 *  - Tabla dinámica Por Periodo (IPA / IIPA)
 *  - Gráficos Recharts con filtros por año y tipología
 */
import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import api, { msgError } from '../services/api';
import EncabezadoPagina from '../components/EncabezadoPagina';
import { TIPOLOGIAS } from '../constants/catalogos';
import Contador from '../components/Contador';
import Reveal from '../components/Reveal';

const COLORES = ['#00482B', '#007A3D', '#43A047', '#D4AF37', '#F59E0B', '#005A3D', '#8BC34A'];

function KPI({ label, valor, sub, acento }) {
  return (
    <div className={`tarjeta border-t-[3px] p-5 ${acento}`}>
      <p className="text-3xl font-semibold text-udec-900">
        <Contador valor={valor} />
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-600">{label}</p>
      {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
    </div>
  );
}

function Tabla({ titulo, descripcion, columnas, filas, totales, granTotal }) {
  return (
    <div className="overflow-hidden rounded-xl border border-borde bg-white shadow-tarjeta">
      <div className="border-b border-borde bg-slate-50 px-5 py-4">
        <h3 className="text-sm font-bold text-udec-900">{titulo}</h3>
        <p className="text-xs text-slate-500">{descripcion}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="bg-udec-900 text-[11px] uppercase tracking-wider text-white">
              <th className="px-4 py-3 font-bold">Tipología</th>
              {columnas.map((c) => (
                <th key={c} className="px-3 py-3 text-center font-bold">
                  {c}
                </th>
              ))}
              <th className="px-3 py-3 text-center font-bold">Total</th>
              <th className="px-3 py-3 text-center font-bold">% del total</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => (
              <tr
                key={f.tipologia}
                className={`border-b border-borde/70 transition hover:bg-udec-50 ${
                  i % 2 ? 'bg-slate-50/60' : ''
                }`}
              >
                <td className="px-4 py-2.5 text-xs font-semibold text-udec-900">{f.tipologia}</td>
                {f.celdas.map((v, j) => (
                  <td
                    key={j}
                    className={`px-3 py-2.5 text-center text-xs ${
                      v > 0 ? 'font-semibold text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    {v}
                  </td>
                ))}
                <td className="px-3 py-2.5 text-center text-xs font-semibold text-udec-900">
                  {f.total}
                </td>
                <td className="px-3 py-2.5 text-center text-xs font-bold text-oro-600">
                  {f.porcentaje}%
                </td>
              </tr>
            ))}
            <tr className="bg-udec-50 font-semibold">
              <td className="px-4 py-3 text-xs uppercase tracking-wide text-udec-900">
                Total general
              </td>
              {totales.map((t, j) => (
                <td key={j} className="px-3 py-3 text-center text-xs text-udec-900">
                  {t}
                </td>
              ))}
              <td className="px-3 py-3 text-center text-xs text-udec-900">{granTotal}</td>
              <td className="px-3 py-3 text-center text-xs text-oro-600">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const estiloTooltip = {
  contentStyle: {
    borderRadius: 10,
    border: '1px solid #E2E8F0',
    fontSize: 12,
    boxShadow: '0 4px 14px rgba(0,72,43,.08)',
  },
};

export default function Estadisticas() {
  const [kpis, setKpis] = useState(null);
  const [anios, setAnios] = useState([]);
  const [tablaProd, setTablaProd] = useState(null);
  const [porPeriodo, setPorPeriodo] = useState(null);
  const [dist, setDist] = useState(null);
  const [filtroAnio, setFiltroAnio] = useState('');
  const [filtroTipologia, setFiltroTipologia] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api
      .get('/stats/resumen')
      .then(({ data }) => {
        setKpis(data.kpis);
        setAnios(data.anios);
      })
      .catch((e) => setError(msgError(e)));
    api
      .get('/stats/distribucion')
      .then(({ data }) => setDist(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setCargando(true);
    const params = {};
    if (filtroAnio) params.anio = filtroAnio;
    if (filtroTipologia) params.tipologia = filtroTipologia;

    Promise.all([
      api.get('/stats/tabla-prod', { params }),
      api.get('/stats/por-periodo', { params }),
    ])
      .then(([a, b]) => {
        setTablaProd(a.data);
        setPorPeriodo(b.data);
        setError('');
      })
      .catch((e) => setError(msgError(e)))
      .finally(() => setCargando(false));
  }, [filtroAnio, filtroTipologia]);

  const datosGraficoAnio = tablaProd
    ? tablaProd.anios.map((a, i) => ({
        anio: String(a),
        total: tablaProd.totales_por_anio[i],
      }))
    : [];

  const datosGraficoTipologia = tablaProd
    ? tablaProd.filas.map((f) => ({ name: f.tipologia.replace(/ .*/, ''), total: f.total }))
    : [];

  const datosPie = dist
    ? dist.por_estado.map((e) => ({ name: e.estado, value: e.cantidad }))
    : [];

  return (
    <div>
      {/* Cabecera */}
      <EncabezadoPagina
        titulo="Estadísticas de producción científica"
        miga="Estadísticas"
        descripcion="Producción por tipología, año y periodo académico, con la misma estructura de las hojas TABLA PROD y Por Periodo de la matriz institucional."
      />

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* KPIs */}
        <div className="escalonado grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPI label="Total Productos" valor={kpis?.total} sub="Matriz completa" acento="border-t-udec-900" />
          <KPI
            label="Verificados"
            valor={kpis?.con_evidencia}
            sub='Estado "Con evidencia"'
            acento="border-t-udec-500"
          />
          <KPI
            label="En Revisión"
            valor={kpis?.en_revision}
            sub='Estado "Parcial" (badge ámbar)'
            acento="border-t-amber-500"
          />
          <KPI
            label="Sin Evidencia / No Verificados"
            valor={(kpis?.sin_evidencia || 0) + (kpis?.no_verificado || 0)}
            sub={`Sin evidencia: ${kpis?.sin_evidencia ?? 0} · No verificados: ${kpis?.no_verificado ?? 0}`}
            acento="border-t-red-400"
          />
        </div>

        {/* Filtros */}
        <div className="mt-8 flex flex-wrap items-end gap-3 rounded-xl border border-borde bg-white p-4 shadow-tarjeta">
          <div>
            <label htmlFor="f-anio" className="campo-label">
              Año
            </label>
            <select
              id="f-anio"
              value={filtroAnio}
              onChange={(e) => setFiltroAnio(e.target.value)}
              className="campo !w-40"
            >
              <option value="">Todos</option>
              {anios.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-tip" className="campo-label">
              Tipología
            </label>
            <select
              id="f-tip"
              value={filtroTipologia}
              onChange={(e) => setFiltroTipologia(e.target.value)}
              className="campo !w-72"
            >
              <option value="">Todas</option>
              {TIPOLOGIAS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setFiltroAnio('');
              setFiltroTipologia('');
            }}
            className="btn-secundario !py-2 text-xs"
          >
            Restablecer
          </button>
          {cargando && (
            <span className="ml-auto text-xs font-medium text-udec-700">Actualizando…</span>
          )}
        </div>

        {/* Tabla TABLA PROD */}
        <div className="mt-6">
          {tablaProd ? (
            <Tabla
              titulo="TABLA PROD — Tipología vs Año"
              descripcion={`Totales por tipología y año con porcentaje del total general${
                filtroAnio ? ` (filtro: ${filtroAnio})` : ''
              }`}
              columnas={tablaProd.anios}
              filas={tablaProd.filas}
              totales={tablaProd.totales_por_anio}
              granTotal={tablaProd.gran_total}
            />
          ) : (
            <div className="h-40 animate-pulse rounded-xl bg-white" />
          )}
        </div>

        {/* Tabla Por Periodo */}
        <div className="mt-6">
          {porPeriodo ? (
            <Tabla
              titulo="Por Periodo — Tipología vs Periodo Académico (IPA / IIPA)"
              descripcion="Distribución de productos por grupo de período académico"
              columnas={['IPA', 'IIPA']}
              filas={porPeriodo.filas.map((f) => ({
                ...f,
                celdas: [f.IPA, f.IIPA],
              }))}
              totales={[porPeriodo.totales.IPA, porPeriodo.totales.IIPA]}
              granTotal={porPeriodo.gran_total}
            />
          ) : (
            <div className="h-40 animate-pulse rounded-xl bg-white" />
          )}
        </div>

        {/* Gráficos */}
        <div className="escalonado mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-borde bg-white p-5 shadow-tarjeta">
            <h3 className="mb-4 text-sm font-bold text-udec-900">Productos por año</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={datosGraficoAnio}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="anio" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip {...estiloTooltip} />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Productos"
                  stroke="#007A3D"
                  strokeWidth={3}
                  dot={{ fill: '#D4AF37', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-borde bg-white p-5 shadow-tarjeta">
            <h3 className="mb-4 text-sm font-bold text-udec-900">
              Distribución por tipología
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={datosGraficoTipologia} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 10 }} />
                <Tooltip {...estiloTooltip} />
                <Bar dataKey="total" name="Productos" radius={[0, 6, 6, 0]}>
                  {datosGraficoTipologia.map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-borde bg-white p-5 shadow-tarjeta lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-udec-900">
              Estados de evidencia (auditoría)
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <ResponsiveContainer width="100%" height={240} className="max-w-sm">
                <PieChart>
                  <Pie
                    data={datosPie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {datosPie.map((_, i) => (
                      <Cell key={i} fill={COLORES[i % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...estiloTooltip} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Total', valor: kpis?.total, color: 'text-udec-900' },
                  { label: 'Con evidencia', valor: kpis?.con_evidencia, color: 'text-udec-700' },
                  { label: 'Parcial', valor: kpis?.parcial, color: 'text-amber-600' },
                  {
                    label: 'Sin / No verif.',
                    valor: (kpis?.sin_evidencia || 0) + (kpis?.no_verificado || 0),
                    color: 'text-red-600',
                  },
                ].map((k) => (
                  <div key={k.label} className="rounded-lg border border-borde p-3 text-center">
                    <p className={`text-2xl font-semibold ${k.color}`}>{k.valor ?? '—'}</p>
                    <p className="text-[11px] font-semibold text-slate-500">{k.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
