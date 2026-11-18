/**
 * services/api.js
 * Instancia axios con interceptor de JWT y manejo centralizado de errores.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Adjuntar token en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('udec_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Manejo de errores centralizado
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const mensaje =
      err.response?.data?.mensaje ||
      (err.code === 'ECONNABORTED'
        ? 'La solicitud tardó demasiado. Intenta de nuevo.'
        : 'Error de conexión con el servidor. Verifica que el backend esté activo.');

    if (err.response?.status === 401) {
      localStorage.removeItem('udec_token');
      localStorage.removeItem('udec_usuario');
      // Vuelve a la misma página (con sus parámetros) después de iniciar sesión otra vez
      if (!window.location.pathname.startsWith('/acceso')) {
        const volver = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/acceso?volver=${volver}&expirada=1`;
      }
    }

    return Promise.reject(new Error(mensaje));
  }
);

/** Mensaje legible de cualquier error. */
export function msgError(err) {
  return err?.message || 'Ocurrió un error inesperado.';
}

export default api;
