'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { usuario, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !usuario) {
      router.replace('/login');
    }
  }, [usuario, loading, router]);

  // Blindaje contra el botón "atrás" del navegador (bfcache):
  // si la página se restaura desde una foto congelada (persisted = true),
  // volvemos a comprobar la sesión leyendo localStorage en frío.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        const token = localStorage.getItem('nexus_token');
        const usuarioGuardado = localStorage.getItem('nexus_usuario');
        if (!token || !usuarioGuardado) {
          window.location.replace('/login');
        }
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  if (loading || !usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}