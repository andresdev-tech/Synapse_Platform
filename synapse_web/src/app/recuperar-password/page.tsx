'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { authAPI } from '../../lib/api';
import { CheckCircle, XCircle } from 'lucide-react';

// Carga dinámica apuntando a Estrellas.jsx deshabilitando SSR
const BackgroundStars = dynamic(
  () => import('../../components/Estrellas'),
  { ssr: false }
);

type Step = 'correo' | 'codigo' | 'nueva';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const reglas = [
  { id: 'longitud', label: 'Mínimo 7 caracteres', test: (p: string) => p.length >= 7 },
  { id: 'mayuscula', label: 'Al menos 1 letra mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'numeros', label: 'Al menos 2 números', test: (p: string) => (p.match(/[0-9]/g) || []).length >= 2 },
  { id: 'especial', label: 'Al menos 1 carácter especial (@#$%&*!...)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function RecuperarPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('correo');
  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [codigoDev, setCodigoDev] = useState('');
  const [passwordFocus, setPasswordFocus] = useState(false);

  const reglasEstado = useMemo(
    () => reglas.map((r) => ({ ...r, ok: r.test(nuevaPassword) })),
    [nuevaPassword]
  );
  const passwordValida = reglasEstado.every((r) => r.ok);

  const handleSolicitarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    const correoNormalizado = correo.trim().toLowerCase();
    if (!EMAIL_REGEX.test(correoNormalizado)) {
      return setError('Ingresa un correo electrónico válido.');
    }

    setLoading(true);
    try {
      const res = await authAPI.recuperarPassword({ correo_electronico: correoNormalizado });
      setCorreo(correoNormalizado);
      if (res.data.codigo_dev) {
        setCodigoDev(res.data.codigo_dev);
        setMensaje(`Modo desarrollo: tu código es ${res.data.codigo_dev}`);
      } else {
        setMensaje(`Código enviado a ${correoNormalizado}. Revisa tu bandeja de entrada y spam.`);
      }
      setStep('codigo');
    } catch {
      setError('Error al solicitar recuperación. Verifica el correo.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const codigoLimpio = codigo.trim();
    if (!/^[0-9]{6}$/.test(codigoLimpio)) {
      return setError('El código debe tener exactamente 6 dígitos numéricos.');
    }

    setLoading(true);
    try {
      await authAPI.verificarCodigo({
        correo_electronico: correo,
        codigo: codigoLimpio,
      });
      setStep('nueva');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Código inválido o expirado. Solicita uno nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestablecerPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordValida) {
      return setError('La contraseña no cumple los requisitos de seguridad.');
    }
    if (nuevaPassword !== confirmar) {
      return setError('Las contraseñas no coinciden.');
    }

    setLoading(true);
    try {
      await authAPI.restablecerPassword({
        correo_electronico: correo,
        codigo: codigo.trim(),
        nueva_password: nuevaPassword,
      });
      router.push('/login?reset=true');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al restablecer. Intenta solicitar un nuevo código.');
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = ['correo', 'codigo', 'nueva'].indexOf(step);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#071a39]">
      <div className="auth-background" aria-hidden="true" />
      <div className="auth-overlay" aria-hidden="true" />

      {/* Estrellas 3D por encima del overlay del fondo y detrás de la tarjeta */}
      <BackgroundStars />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-3xl font-extrabold text-primary-700">SYNAPSE</div>
            <p className="text-gray-500 text-sm mt-1">Recuperar contraseña</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            {(['correo', 'codigo', 'nueva'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step === s
                      ? 'bg-primary-600 text-white'
                      : stepIndex > i
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {i + 1}
                </div>
                {i < 2 && <div className={`w-8 h-0.5 ${stepIndex > i ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {step === 'correo' && (
            <form onSubmit={handleSolicitarCodigo} noValidate className="space-y-4">
              <p className="text-gray-600 text-sm">
                Ingresa tu correo registrado y te enviaremos un código de verificación.
              </p>

              <div>
                <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
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

              {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              {mensaje && <p className="text-green-600 text-sm bg-green-50 rounded-lg px-3 py-2">{mensaje}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Enviando...' : 'Enviar código'}
              </button>
            </form>
          )}

          {step === 'codigo' && (
            <form onSubmit={handleValidarCodigo} noValidate className="space-y-4">
              <p className="text-gray-600 text-sm">
                Ingresa el código de 6 dígitos enviado a <strong>{correo}</strong>
              </p>

              {codigoDev && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-3 text-center">
                  <p className="text-yellow-700 text-xs font-medium mb-1">Modo desarrollo</p>
                  <p className="text-2xl font-bold tracking-widest text-yellow-800">{codigoDev}</p>
                </div>
              )}

              <label htmlFor="codigo" className="sr-only">
                Código de verificación
              </label>
              <input
                id="codigo"
                className="input-field text-center text-2xl tracking-widest font-bold"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />

              {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Verificando...' : 'Verificar código'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('correo');
                  setError('');
                  setCodigo('');
                }}
                className="btn-secondary w-full"
              >
                ← Cambiar correo
              </button>
            </form>
          )}

          {step === 'nueva' && (
            <form onSubmit={handleRestablecerPassword} noValidate className="space-y-4">
              <p className="text-gray-600 text-sm">Establece tu nueva contraseña.</p>

              <div>
                <label htmlFor="nuevaPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva contraseña
                </label>
                <input
                  id="nuevaPassword"
                  type="password"
                  className={`input-field ${
                    nuevaPassword
                      ? passwordValida
                        ? 'border-green-400 focus:ring-green-300'
                        : 'border-red-300 focus:ring-red-200'
                      : ''
                  }`}
                  placeholder="Mínimo 7 caracteres"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                  required
                  autoComplete="new-password"
                />

                {(passwordFocus || nuevaPassword.length > 0) && (
                  <div className="mt-2 bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-1.5">
                    {reglasEstado.map((r) => (
                      <div
                        key={r.id}
                        className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                          r.ok ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {r.ok ? (
                          <CheckCircle size={14} className="flex-shrink-0 text-green-500" />
                        ) : (
                          <XCircle size={14} className="flex-shrink-0 text-gray-300" />
                        )}
                        {r.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmar" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmar"
                  type="password"
                  className="input-field"
                  placeholder="Repite la contraseña"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  required
                  autoComplete="new-password"
                />

                {confirmar && confirmar !== nuevaPassword && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <XCircle size={12} /> Las contraseñas no coinciden
                  </p>
                )}
              </div>

              {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              <button
                type="submit"
                disabled={loading || !passwordValida || nuevaPassword !== confirmar}
                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Restablecer contraseña'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-4">
            <Link href="/login" className="text-primary-600 hover:underline">
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}