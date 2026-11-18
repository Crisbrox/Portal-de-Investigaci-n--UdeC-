/**
 * pages/MatrizExcel.jsx (Solo Admin)
 * Importar Matriz Excel (.xlsx) + Exportar Matriz Actualizada (.xlsx).
 */
import { useEffect, useRef, useState } from 'react';
import { CalendarRange, Download, FileSpreadsheet, FileText, Table2, Upload } from 'lucide-react';
import api, { msgError } from '../services/api';
import Toast from '../components/Toast';

export default function MatrizExcel() {
  const [archivo, setArchivo] = useState(null);
  const [modo, setModo] = useState('reemplazar');
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [estado, setEstado] = useState(null);
  const [toast, setToast] = useState(null);
  const [arrastrando, setArrastrando] = useState(false);
  const inputRef = useRef(null);

  const cargarEstado = () => {
    api
      .get('/excel/estado')
      .then(({ data }) => setEstado(data))
      .catch(() => {});
  };

  useEffect(cargarEstado, []);

  const importar = async () => {
    if (!archivo) {
      setToast({ tipo: 'error', mensaje: 'Selecciona primero el archivo .xlsx de la matriz.' });
      return;
    }
    setImportando(true);
    setResultado(null);
    try {
      const fd = new FormData();
      fd.append('archivo', archivo);
      fd.append('modo', modo);
      const { data } = await api.post('/excel/importar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      setResultado(data);
      setToast({ tipo: 'success', mensaje: data.mensaje });
      setArchivo(null);
      if (inputRef.current) inputRef.current.value = '';
      cargarEstado();
    } catch (e) {
      setToast({ tipo: 'error', mensaje: msgError(e) });
    } finally {
      setImportando(false);
    }
  };

  const exportar = async () => {
    setToast({ tipo: 'info', mensaje: 'Generando archivo con 3 hojas (matriz, TABLA PROD, Por Periodo)…' });
    try {
      const { data } = await api.get('/excel/exportar', { responseType: 'blob', timeout: 120000 });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Matriz_produccion_cientifica_UdeC_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setToast({ tipo: 'success', mensaje: 'Matriz exportada correctamente con sus 3 hojas.' });
    } catch (e) {
      setToast({ tipo: 'error', mensaje: msgError(e) });
    }
  };

  const onSoltar = (e) => {
    e.preventDefault();
    setArrastrando(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setArchivo(f);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <p className="antetitulo">
          Administración
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-udec-900 md:text-3xl">
          Importar / Exportar Matriz Excel
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Carga masiva desde <b>Matriz producción científica arreglada.xlsx</b> (hoja{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">matriz</code>) con mapeo
          automático de las 31 columnas, o descarga la matriz actualizada con 3 hojas.
        </p>
      </div>

      {/* Estado actual */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="tarjeta border-t-4 border-t-udec-900 p-4">
          <p className="text-2xl font-semibold text-udec-900">
            {estado?.total_registros ?? '—'}
          </p>
          <p className="text-[11px] font-semibold text-slate-500">Registros en la base</p>
        </div>
        <div className="tarjeta border-t-4 border-t-udec-500 p-4">
          <p className="text-sm font-bold text-udec-900">
            {estado?.ultima_actualizacion
              ? new Date(estado.ultima_actualizacion).toLocaleString('es-CO')
              : '—'}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">Última actualización</p>
        </div>
        <div className="tarjeta border-t-4 border-t-oro-500 p-4">
          <p className="text-sm font-bold text-udec-900">3 hojas</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">
            matriz · TABLA PROD · Por Periodo
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* ---------- IMPORTAR ---------- */}
        <section className="rounded-lg border border-borde bg-white p-6 shadow-tarjeta">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-udec-50 text-udec-700">
              <Upload size={18} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-udec-900">Importar matriz (.xlsx)</h2>
              <p className="text-[11px] text-slate-500">Hoja "matriz" · 31 columnas mapeadas</p>
            </div>
          </div>

          {/* Zona de arrastre */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={onSoltar}
            onClick={() => inputRef.current?.click()}
            className={`group mt-4 cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all duration-300 ${
              arrastrando
                ? 'scale-[1.02] border-udec-500 bg-udec-50'
                : 'border-borde bg-slate-50 hover:border-udec-500 hover:bg-udec-50/50'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            />
            <FileSpreadsheet size={40} strokeWidth={1.5} className="mx-auto text-udec-700 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110" />
            {archivo ? (
              <>
                <p className="mt-2 text-sm font-bold text-udec-900">{archivo.name}</p>
                <p className="text-[11px] text-slate-400">
                  {(archivo.size / 1024 / 1024).toFixed(2)} MB · clic para cambiar
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  Arrastra el archivo aquí o haz clic para seleccionarlo
                </p>
                <p className="text-[11px] text-slate-400">Formatos .xlsx / .xls · máx. 30 MB</p>
              </>
            )}
          </div>

          {/* Modo */}
          <div className="mt-4">
            <p className="campo-label">Modo de importación</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label
                className={`cursor-pointer rounded-lg border p-3 text-xs transition ${
                  modo === 'reemplazar'
                    ? 'border-udec-700 bg-udec-50 ring-2 ring-udec-100'
                    : 'border-borde hover:border-udec-500'
                }`}
              >
                <input
                  type="radio"
                  name="modo"
                  value="reemplazar"
                  checked={modo === 'reemplazar'}
                  onChange={(e) => setModo(e.target.value)}
                  className="mr-2 accent-udec-900"
                />
                <b className="text-udec-900">Reemplazar todo</b>
                <p className="mt-1 text-slate-500">Borra los registros actuales e importa el archivo.</p>
              </label>
              <label
                className={`cursor-pointer rounded-lg border p-3 text-xs transition ${
                  modo === 'agregar'
                    ? 'border-udec-700 bg-udec-50 ring-2 ring-udec-100'
                    : 'border-borde hover:border-udec-500'
                }`}
              >
                <input
                  type="radio"
                  name="modo"
                  value="agregar"
                  checked={modo === 'agregar'}
                  onChange={(e) => setModo(e.target.value)}
                  className="mr-2 accent-udec-900"
                />
                <b className="text-udec-900">Agregar nuevos registros</b>
                <p className="mt-1 text-slate-500">Omite duplicados por nombre + año + tipología.</p>
              </label>
            </div>
          </div>

          <button
            onClick={importar}
            disabled={!archivo || importando}
            className="btn-primary mt-4 w-full"
          >
            {importando ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Importando registros…
              </>
            ) : (
              <>
                <Upload size={16} /> Importar Matriz Excel (.xlsx)
              </>
            )}
          </button>

          {/* Resultado detallado */}
          {resultado && (
            <div className="mt-4 rounded-xl border border-udec-500/40 bg-udec-50 p-4 animate-scale-in">
              <p className="text-sm font-semibold text-udec-900">Resumen de importación</p>
              <p className="mt-1 text-xs font-semibold text-udec-700">{resultado.mensaje}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                {[
                  ['Hoja', resultado.hoja],
                  ['Leídos', resultado.registros_leidos],
                  ['Importados', resultado.importados],
                  ['Duplicados', resultado.duplicados],
                  ['Errores', resultado.total_errores],
                  ['Modo', resultado.modo],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-white px-2.5 py-2">
                    <dt className="text-[10px] font-bold uppercase text-slate-400">{k}</dt>
                    <dd className="font-semibold text-udec-900">{v}</dd>
                  </div>
                ))}
              </dl>

              {resultado.errores?.length > 0 && (
                <div className="mt-3 max-h-32 overflow-y-auto rounded-lg border border-red-200 bg-red-50 p-2.5">
                  {resultado.errores.map((e, i) => (
                    <p key={i} className="text-[11px] text-red-700">
                      <b>Fila {e.fila}:</b> {e.error}
                    </p>
                  ))}
                </div>
              )}

              {resultado.encabezados_no_mapeados?.length > 0 && (
                <p className="mt-2 text-[11px] text-slate-500">
                  Columnas ignoradas: {resultado.encabezados_no_mapeados.join(', ')}
                </p>
              )}
            </div>
          )}
        </section>

        {/* ---------- EXPORTAR ---------- */}
        <section className="rounded-lg border border-borde bg-white p-6 shadow-tarjeta">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-oro-100 text-oro-600">
              <Download size={18} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-udec-900">
                Exportar matriz actualizada (.xlsx)
              </h2>
              <p className="text-[11px] text-slate-500">
                Descarga generada desde la base de datos
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {[
              {
                hoja: 'matriz',
                desc: 'Los registros actuales con las 31 columnas exactas del archivo institucional.',
                Icono: FileText,
              },
              {
                hoja: 'TABLA PROD',
                desc: 'Resumen agrupado por Tipología y Año, con totales y % del total.',
                Icono: Table2,
              },
              {
                hoja: 'Por Periodo',
                desc: 'Resumen agrupado por Tipología y Periodo Académico IPA / IIPA.',
                Icono: CalendarRange,
              },
            ].map((h) => (
              <div
                key={h.hoja}
                className="flex items-start gap-3 rounded-lg border border-borde bg-slate-50 px-3.5 py-3 transition-all duration-300 hover:translate-x-1 hover:border-udec-500/50 hover:bg-white"
              >
                <h.Icono size={18} className="mt-0.5 shrink-0 text-udec-700" />
                <div>
                  <p className="text-xs font-semibold text-udec-900">{h.hoja}</p>
                  <p className="text-[11px] leading-snug text-slate-500">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={exportar} className="btn-oro mt-5 w-full">
            <Download size={16} /> Exportar Matriz Actualizada (.xlsx)
          </button>

          <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
            El archivo se genera en el servidor con los datos vigentes de la tabla{' '}
            <code className="rounded bg-slate-100 px-1">productos_investigacion</code> y se
            descarga directamente en tu navegador.
          </p>
        </section>
      </div>

      <Toast toast={toast} onCerrar={() => setToast(null)} />
    </div>
  );
}
