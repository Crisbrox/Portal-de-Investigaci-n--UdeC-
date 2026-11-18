/**
 * pages/PublicarEmprendimiento.jsx
 * Formulario de emprendimiento con subida de imágenes (multer).
 * Se publica de inmediato (estado PUBLICADO) en la vitrina.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import api, { msgError } from '../services/api';
import Toast from '../components/Toast';
import { SEDES, SECTORES, ETAPAS, PROGRAMAS } from '../constants/catalogos';

const VACIO = {
  nombre_emprendimiento: '',
  sector_categoria: '',
  etapa: '',
  sede_udec: '',
  programa_academico: '',
  descripcion_corta: '',
  descripcion_detallada: '',
  emprendedores: '',
  whatsapp: '',
  instagram: '',
  sitio_web: '',
  correo_contacto: '',
};

export default function PublicarEmprendimiento() {
  const navigate = useNavigate();
  const [form, setForm] = useState(VACIO);
  const [logo, setLogo] = useState(null);
  const [galeria, setGaleria] = useState([]);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    setError('');
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.nombre_emprendimiento.trim()) return setError('El nombre es obligatorio.');
    if (!form.sector_categoria) return setError('Selecciona el sector.');
    if (!form.etapa) return setError('Selecciona la etapa.');
    if (!form.sede_udec) return setError('Selecciona la sede UdeC.');
    if (form.descripcion_corta.trim().length < 10)
      return setError('La descripción corta debe tener al menos 10 caracteres.');

    setEnviando(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
      if (logo) fd.append('logo', logo);
      galeria.forEach((g) => fd.append('galeria', g));

      const { data } = await api.post('/emprendimientos', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setToast({ tipo: 'success', mensaje: data.mensaje });
      setTimeout(() => navigate('/vitrina'), 1800);
    } catch (err) {
      setError(msgError(err));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <p className="font-serif text-base font-semibold text-udec-900">
          Vitrina UdeC
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-udec-900 md:text-3xl">
          Publicar Emprendimiento
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Al enviar, se publica <b>de inmediato</b> en la vitrina pública sin esperar aprobación.
          El administrador conserva la capacidad de moderarlo.
        </p>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-udec-500/40 bg-udec-50 px-4 py-3">
        <Rocket size={18} className="mt-0.5 shrink-0 text-udec-700" />
        <p className="text-xs leading-relaxed text-udec-900">
          Publicación inmediata: tu emprendimiento aparecerá en{' '}
          <b>/vitrina</b> con estado <b>PUBLICADO</b> apenas confirmes el envío.
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={enviar} className="mt-5 space-y-5 rounded-lg border border-borde bg-white p-5 shadow-tarjeta md:p-7">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="campo-label">
              Nombre del emprendimiento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.nombre_emprendimiento}
              onChange={set('nombre_emprendimiento')}
              placeholder="Ej. AgroTech Sabana"
              className="campo"
            />
          </div>

          <div>
            <label className="campo-label">
              Sector <span className="text-red-500">*</span>
            </label>
            <select value={form.sector_categoria} onChange={set('sector_categoria')} className="campo">
              <option value="">Selecciona…</option>
              {SECTORES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="campo-label">
              Etapa <span className="text-red-500">*</span>
            </label>
            <select value={form.etapa} onChange={set('etapa')} className="campo">
              <option value="">Selecciona…</option>
              {ETAPAS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="campo-label">
              Sede UdeC <span className="text-red-500">*</span>
            </label>
            <select value={form.sede_udec} onChange={set('sede_udec')} className="campo">
              <option value="">Selecciona…</option>
              {SEDES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="campo-label">Programa académico</label>
            <select value={form.programa_academico} onChange={set('programa_academico')} className="campo">
              <option value="">Selecciona…</option>
              {PROGRAMAS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="campo-label">
              Descripción corta (tarjeta) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              maxLength={300}
              value={form.descripcion_corta}
              onChange={set('descripcion_corta')}
              placeholder="Máx. 300 caracteres. Se muestra en la tarjeta de la vitrina."
              className="campo resize-y"
            />
            <p className="mt-1 text-right text-[11px] text-slate-400">
              {form.descripcion_corta.length}/300
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="campo-label">Descripción detallada (modal)</label>
            <textarea
              rows={5}
              value={form.descripcion_detallada}
              onChange={set('descripcion_detallada')}
              placeholder="Historia, modelo de negocio, impacto…"
              className="campo resize-y"
            />
          </div>

          <div className="md:col-span-2">
            <label className="campo-label">Emprendedores (integrantes)</label>
            <input
              type="text"
              value={form.emprendedores}
              onChange={set('emprendedores')}
              placeholder="Nombres separados por coma"
              className="campo"
            />
          </div>
        </div>

        {/* Imágenes */}
        <div className="grid gap-4 border-t border-borde pt-5 md:grid-cols-2">
          <div>
            <label className="campo-label">Logo (imagen)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogo(e.target.files?.[0] || null)}
              className="campo file:mr-3 file:rounded-md file:border-0 file:bg-udec-100 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-udec-900"
            />
          </div>
          <div>
            <label className="campo-label">Galería (hasta 8 imágenes)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setGaleria(Array.from(e.target.files || []).slice(0, 8))}
              className="campo file:mr-3 file:rounded-md file:border-0 file:bg-udec-100 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-udec-900"
            />
            {galeria.length > 0 && (
              <p className="mt-1 text-[11px] text-slate-500">{galeria.length} imagen(es) seleccionada(s)</p>
            )}
          </div>
        </div>

        {/* Contacto */}
        <div className="grid gap-4 border-t border-borde pt-5 md:grid-cols-2">
          <div>
            <label className="campo-label">WhatsApp</label>
            <input
              type="text"
              value={form.whatsapp}
              onChange={set('whatsapp')}
              placeholder="Ej. 3001234567"
              className="campo"
            />
          </div>
          <div>
            <label className="campo-label">Instagram</label>
            <input
              type="text"
              value={form.instagram}
              onChange={set('instagram')}
              placeholder="@usuario o URL"
              className="campo"
            />
          </div>
          <div>
            <label className="campo-label">Sitio web</label>
            <input
              type="text"
              value={form.sitio_web}
              onChange={set('sitio_web')}
              placeholder="https://…"
              className="campo"
            />
          </div>
          <div>
            <label className="campo-label">Correo de contacto</label>
            <input
              type="email"
              value={form.correo_contacto}
              onChange={set('correo_contacto')}
              placeholder="contacto@ejemplo.com"
              className="campo"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-borde pt-5">
          <button type="button" onClick={() => navigate('/panel')} className="btn-secundario">
            Cancelar
          </button>
          <button type="submit" disabled={enviando} className="btn-primary">
            {enviando ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Publicando…
              </>
            ) : (
              <>
                <Rocket size={16} /> Publicar en la vitrina
              </>
            )}
          </button>
        </div>
      </form>

      <Toast toast={toast} onCerrar={() => setToast(null)} />
    </div>
  );
}
