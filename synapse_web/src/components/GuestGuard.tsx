'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';

// Protege rutas públicas (login, registro, recuperar contraseña):
// si el usuario YA tiene sesión iniciada, lo saca de ahí y lo manda
// al dashboard, en vez de dejarlo ver el formulario de login/registro.
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { usuario, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && usuario) {
      router.replace('/dashboard');
    }
  }, [usuario, loading, router]);

  if (loading || usuario) {
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