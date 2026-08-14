'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';

// Protege rutas públicas (login, registro, recuperar contraseña):
// si el usuario YA tiene sesión iniciada, lo redirige al dashboard.
// A diferencia de la versión anterior, NO bloquea el render con un
// spinner: el contenido (formulario de login, etc.) se muestra de
// inmediato mientras el auth resuelve en segundo plano.
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { usuario, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir cuando ya tenemos certeza de que hay sesión
    if (!loading && usuario) {
      router.replace('/dashboard');
    }
  }, [usuario, loading, router]);

  // Si el auth ya terminó de cargar y hay usuario, no mostrar nada
  // mientras se ejecuta la redirección (evita flash del formulario)
  if (!loading && usuario) {
    return null;
  }

  // En todos los demás casos (cargando O sin usuario) mostrar children
  return <>{children}</>;
}