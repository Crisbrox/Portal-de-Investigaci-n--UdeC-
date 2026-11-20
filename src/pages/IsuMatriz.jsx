/**
 * pages/IsuMatriz.jsx — (Admin) Importar / exportar la Matriz ISU y fijar las fechas de los informes.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarClock, Download, FileSpreadsheet, Upload } from 'lucide-react';
import api, { msgError } from '../services/api';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

function FechasPeriodo({ periodo, onGuardado }) {
  const [f, setF] = useState(() => Object.fromEntries([1, 2, 3, 4].map((n) => [`fecha_informe_${n}`, periodo[`fecha_informe_${n}`] || ''])));
  const [guardando, setGuardando] = useState(false);
  const guardar = async () => {
    setGuardando(true);
    try {
      const { data } = await api.put(`/isu/periodos/${encodeURIComponent(periodo.periodo)}`, f);
      onGuardado(data.mensaje);
    } catch (err) {
      onGuardado(msgError(err), true);
    } finally {
      setGuardando(false);
    }
  };
  return (
    <tr>
      <td className="px-3 py-2 font-semibold text-udec-900">
        {periodo.periodo}
        <span className="block text-xs font-normal text-slate-500">{periodo.proyectos} proyectos</span>
      </td>
      {[1, 2, 3, 4].map((n) => (
        <td key={n} className="px-2 py-2">
          <input
            value={f[`fecha_informe_${n}`]}
            onChange={(e) => setF((x) => ({ ...x, [`fecha_informe_${n}`]: e.target.value }))}
            placeholder="Ej. 05-Septiembre-2026"
            className="campo !py-1.5 text-xs"
            aria-label={`Fecha informe ${n} de ${periodo.periodo}`}
          />
        </td>
      ))}
      <td className="px-2 py-2 text-right">
        <button onClick={guardar} disabled={guardando} className="btn-secundario !px-3 !py-1.5 text-xs">
          {guardando ? '…' : 'Guardar'}
        </button>
      </td>
    </tr>
  );
}

export default function IsuMatriz() {
  // Admin: matriz completa y fechas de informes. Líder ISU: sube y descarga solo sus proyectos.
  const { esAdmin } = useAuth();
  const [archivo, setArchivo] = useState(null);
  const [modo, setModo] = useState('actualizar');
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [toast, setToast] = useState(null);
  const [arrastrando, setArrastrando] = useState(false);
  const inputRef = useRef(null);

  const cargarPeriodos = useCallback(() => {
    api
      .get('/isu/periodos')
      .then(({ data }) => setPeriodos(data.periodos))
      .catch((err) => setToast({ tipo: 'error', mensaje: msgError(err) }));
  }, []);

  useEffect(cargarPeriodos, [cargarPeriodos]);

  const importar = async () => {
    if (!archivo) return;
    if (modo === 'reemplazar' && !window.confirm('Se borrarán los proyectos (y sus entregables) de los periodos que traiga el archivo. ¿Continuar?')) {
      return;
    }
    setImportando(true);
    setResultado(null);
    try {
      const fd = new FormData();
      fd.append('archivo', archivo);
      fd.append('modo', modo);
      const { data } = await api.post('/isu/excel/importar', fd, { timeout: 120000 });
      setResultado(data);
      setToast({ tipo: 'success', mensaje: data.mensaje });
      cargarPeriodos();
    } catch (err) {
      setToast({ tipo: 'error', mensaje: msgError(err) });
    } finally {
      setImportando(false);
    }
  };

  const exportar = async () => {
    try {
      const { data } = await api.get('/isu/excel/exportar', { responseType: 'blob', timeout: 120000 });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Matriz_ISU_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setToast({ tipo: 'error', mensaje: msgError(err) });
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <p className="antetitulo">{esAdmin ? 'Administración · ISU' : 'Mis proyectos ISU'}</p>
      <h1 className="mt-3 text-2xl font-semibold text-udec-900 md:text-3xl">
        {esAdmin ? 'Matriz ISU (Excel)' : 'Subir mi matriz ISU en Excel'}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        Usa la misma plantilla de la "Matriz de convocatorias e informes": una hoja por periodo con
        Proyecto, ISU PRO, Objetivos, Población, Líder, Asistencia CDEI, Video e Informes 1 a 4. Los
        proyectos debajo de la fila "NO VAN" quedan como no vigentes.
      </p>
      {!esAdmin && (
        <p className="mt-3 max-w-2xl rounded border border-udec-500/40 bg-udec-50 px-4 py-3 text-sm text-udec-900">
          Los proyectos nuevos quedan <b>a tu nombre</b>. Los que ya existen solo se actualizan si son tuyos
          (o si apareces como líder); los de otras personas se omiten. Desde el Excel puedes marcar
          entregables como <b>Entregado</b>, pero la aprobación la hace la administración.
        </p>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* Importar */}
        <section className="rounded-lg border border-borde bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-udec-900">
            <Upload size={18} /> Importar matriz
          </h2>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArrastrando(false);
              setArchivo(e.dataTransfer.files?.[0] || null);
            }}
            onClick={() => inputRef.current?.click()}
            className={`group mt-4 cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all duration-300 ${
              arrastrando ? 'scale-[1.02] border-udec-500 bg-udec-50' : 'border-slate-300 bg-fondo hover:border-udec-500'
            }`}
          >
            <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
            <FileSpreadsheet size={36} strokeWidth={1.5} className="mx-auto text-udec-700 transition-transform group-hover:-translate-y-1" />
            <p className="mt-2 text-sm font-semibold text-slate-700">{archivo ? archivo.name : 'Arrastra la matriz o haz clic para elegirla'}</p>
            <p className="text-xs text-slate-500">.xlsx con una hoja por periodo</p>
          </div>

          {esAdmin && (
            <fieldset className="mt-4 space-y-2 text-sm">
              <label className="flex items-start gap-2">
                <input type="radio" name="modo" checked={modo === 'actualizar'} onChange={() => setModo('actualizar')} className="mt-1 accent-udec-800" />
                <span>
                  <b>Actualizar</b> (recomendado): agrega proyectos nuevos y actualiza los existentes sin borrar
                  entregables subidos ni bajar estados.
                </span>
              </label>
              <label className="flex items-start gap-2">
                <input type="radio" name="modo" checked={modo === 'reemplazar'} onChange={() => setModo('reemplazar')} className="mt-1 accent-udec-800" />
                <span>
                  <b>Reemplazar</b>: borra los proyectos de los periodos del archivo y los vuelve a crear.
                </span>
              </label>
            </fieldset>
          )}

          <button onClick={importar} disabled={!archivo || importando} className="btn-primary mt-5 w-full">
            {importando ? 'Importando…' : 'Importar matriz ISU'}
          </button>

          {resultado && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded border border-udec-500/40 bg-udec-50 p-4 text-sm">
              <p className="font-semibold text-udec-900">{resultado.mensaje}</p>
              <table className="mt-2 w-full text-left text-xs">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-1">Periodo</th>
                    <th>Proyectos</th>
                    <th>No van</th>
                    <th>Nuevos</th>
                    <th>Actualizados</th>
                    <th>Omitidos</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.resumen.map((r) => (
                    <tr key={r.periodo} className="border-t border-udec-500/20">
                      <td className="py-1 font-semibold">{r.periodo}</td>
                      <td>{r.proyectos}</td>
                      <td>{r.no_van}</td>
                      <td>{r.nuevos}</td>
                      <td>{r.actualizados}</td>
                      <td>{r.omitidos_de_otros ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Link to="/panel/isu" className="enlace mt-3 text-sm">
                Ver los proyectos
              </Link>
            </motion.div>
          )}
        </section>

        {/* Exportar */}
        <section className="rounded-lg border border-borde bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-udec-900">
            <Download size={18} /> {esAdmin ? 'Exportar matriz actualizada' : 'Descargar mis proyectos'}
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Genera el Excel con el mismo formato de la plantilla: una hoja por periodo (fechas de informes,
            proyectos vigentes, fila "NO VAN" y los que no van) y la hoja de Notas. Los entregables salen
            como <b>Entregado</b>, <b>Aprobado</b> o <b>Devuelto</b> (vacío si está pendiente).
          </p>
          <button onClick={exportar} className="btn-oro mt-5 w-full">
            <Download size={16} /> Descargar Matriz ISU (.xlsx)
          </button>
        </section>
      </div>

      {/* Fechas de informes (las define la administración) */}
      {esAdmin && (
        <section className="mt-6 rounded-lg border border-borde bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-udec-900">
            <CalendarClock size={18} /> Fechas de entrega de informes
          </h2>
          <p className="mt-1 text-sm text-slate-500">Los líderes ISU ven estas fechas en sus proyectos.</p>
          {periodos.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Aún no hay periodos: importa la matriz o registra un proyecto.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-xs text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Periodo</th>
                    {[1, 2, 3, 4].map((n) => (
                      <th key={n} className="px-2 py-2">Informe {n}</th>
                    ))}
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-borde">
                  {periodos.map((p) => (
                    <FechasPeriodo
                      key={p.periodo}
                      periodo={p}
                      onGuardado={(mensaje, error) => {
                        setToast({ tipo: error ? 'error' : 'success', mensaje });
                        if (!error) cargarPeriodos();
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <Toast toast={toast} onCerrar={() => setToast(null)} />
    </div>
  );
}
