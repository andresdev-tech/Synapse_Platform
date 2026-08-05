'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nexus_usuario');
      const token = localStorage.getItem('nexus_token');
      if (stored && token) {
        setUsuario(JSON.parse(stored));
      }
    } catch {}
    setLoading(false);
  }, []);

  const login = async (correo_electronico: string, password: string) => {
    const res = await authAPI.login(correo_electronico, password);
    const { token, usuario } = res.data;
    localStorage.setItem('nexus_token', token);
    localStorage.setItem('nexus_usuario', JSON.stringify(usuario));
    setUsuario(usuario);
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch (_) {}
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_usuario');
    setUsuario(null);
    window.location.href = '/login';
  };

  const isAdmin    = () => usuario?.rol === 'Administrador';
  const isAprendiz = () => usuario?.rol === 'Aprendiz';
  const isProfesor = () => usuario?.rol === 'Profesor';

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, isAdmin, isAprendiz, isProfesor }}>
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