'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '../../lib/AuthContext';
import { GuestGuard } from '../../components/GuestGuard';

// Carga dinámica apuntando a tu archivo Estrellas.jsx deshaciendo SSR
const BackgroundStars = dynamic(
  () => import('../../components/Estrellas'), 
  { ssr: false }
);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const correoNormalizado = correo.trim().toLowerCase();

    if (!EMAIL_REGEX.test(correoNormalizado)) {
      return setError('Ingresa un correo electrónico válido.');
    }
    if (!password) {
      return setError('La contraseña es obligatoria.');
    }

    setLoading(true);
    try {
      await login(correoNormalizado, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestGuard>
      <div className="relative min-h-screen overflow-hidden bg-[#071a39]">
        <div className="auth-background" aria-hidden="true" />
        <div className="auth-overlay" aria-hidden="true" />

        {/* Las estrellas de React Three Fiber cargadas solo en el cliente */}
        <BackgroundStars />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-md mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-blue-100 hover:text-white transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="text-4xl font-extrabold text-primary-700 tracking-tight">SYNAPSE</div>
              <p className="text-gray-500 text-sm mt-1">Plataforma Académica Inteligente</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                <input
                  id="correo"
                  type="email"
                  className="input-field"
                  placeholder="correo@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <Link href="/recuperar-password" className="text-primary-600 text-sm hover:underline block">
                ¿Olvidaste tu contraseña?
              </Link>
              <p className="text-gray-500 text-sm">
                ¿No tienes cuenta?{' '}
                <Link href="/registro" className="text-primary-600 font-medium hover:underline">
                  Regístrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}