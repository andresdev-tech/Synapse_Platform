'use client';
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { authAPI } from '../lib/api';

interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  rol: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  isAprendiz: () => boolean;
  isProfesor: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Leer usuario de localStorage de forma SÍNCRONA en la inicialización
// del estado, para evitar el ciclo extra de render con loading=true.
// Solo se ejecuta en el cliente (typeof window check).
function getInitialUsuario(): Usuario | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('nexus_usuario');
    const token = localStorage.getItem('nexus_token');
    if (stored && token) return JSON.parse(stored) as Usuario;
  } catch {}
  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado inicializado síncronamente desde localStorage → loading=false de entrada
  const [usuario, setUsuario] = useState<Usuario | null>(getInitialUsuario);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (correo_electronico: string, password: string) => {
    const res = await authAPI.login(correo_electronico, password);
    const { token, usuario } = res.data;
    localStorage.setItem('nexus_token', token);
    localStorage.setItem('nexus_usuario', JSON.stringify(usuario));
    setUsuario(usuario);
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch (_) {}
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_usuario');
    setUsuario(null);
    window.location.href = '/login';
  }, []);

  const isAdmin = useCallback(() => usuario?.rol === 'Administrador', [usuario?.rol]);
  const isAprendiz = useCallback(() => usuario?.rol === 'Aprendiz', [usuario?.rol]);
  const isProfesor = useCallback(() => usuario?.rol === 'Profesor', [usuario?.rol]);

  const value = useMemo(
    () => ({ usuario, loading, login, logout, isAdmin, isAprendiz, isProfesor }),
    [usuario, loading, login, logout, isAdmin, isAprendiz, isProfesor]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Retornar valores seguros en vez de explotar
    return {
      usuario: null,
      loading: true,
      login: async () => {},
      logout: async () => {},
      isAdmin: () => false,
      isAprendiz: () => false,
      isProfesor: () => false,
    };
  }
  return ctx;
};