/**
 * context/AuthContext.jsx
 * Estado global de autenticación (JWT + usuario) con validación de dominio.
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const DOMINIO_INSTITUCIONAL = '@ucundinamarca.edu.co';
export const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@ucundinamarca\.edu\.co$/;

/** Valida dominio en frontend (el backend lo revalida). */
export function validarCorreoInstitucional(correo) {
  if (!correo || !correo.trim()) return 'El correo institucional es obligatorio.';
  if (!EMAIL_REGEX.test(correo.trim())) {
    return 'Solo se permite el uso de correos institucionales terminados en @ucundinamarca.edu.co.';
  }
  return null;
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem('udec_token');
    localStorage.removeItem('udec_usuario');
    setUsuario(null);
  }, []);

  // Restaurar sesión al cargar
  useEffect(() => {
    const token = localStorage.getItem('udec_token');
    const guardado = localStorage.getItem('udec_usuario');
    if (token && guardado) {
      try {
        setUsuario(JSON.parse(guardado));
      } catch {
        localStorage.removeItem('udec_usuario');
      }
    }
    setCargando(false);
  }, []);

  const guardarSesion = (token, u) => {
    localStorage.setItem('udec_token', token);
    localStorage.setItem('udec_usuario', JSON.stringify(u));
    setUsuario(u);
  };

  const iniciarSesion = async (correo, password) => {
    const error = validarCorreoInstitucional(correo);
    if (error) throw new Error(error);
    const { data } = await api.post('/auth/login', {
      correo_institucional: correo.trim().toLowerCase(),
      password,
    });
    guardarSesion(data.token, data.usuario);
    return data.usuario;
  };

  /** Crea una cuenta de emprendedor (único rol disponible en el registro público) e inicia sesión. */
  const registrarEmprendedor = async (payload) => {
    const error = validarCorreoInstitucional(payload.correo_institucional);
    if (error) throw new Error(error);
    const { data } = await api.post('/auth/registro', {
      ...payload,
      correo_institucional: payload.correo_institucional.trim().toLowerCase(),
    });
    guardarSesion(data.token, data.usuario);
    return data.usuario;
  };

  /** Cambia la contraseña propia y levanta la obligación de cambiarla. */
  const cambiarPassword = async (actual, nueva) => {
    const { data } = await api.put('/auth/password', { actual, nueva });
    const u = { ...usuario, debe_cambiar_password: false };
    localStorage.setItem('udec_usuario', JSON.stringify(u));
    setUsuario(u);
    return data;
  };

  const esAdmin = usuario?.rol === 'ADMINISTRADOR';
  const autenticado = Boolean(usuario);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        autenticado,
        esAdmin,
        cargando,
        iniciarSesion,
        registrarEmprendedor,
        cambiarPassword,
        cerrarSesion,
        setUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
