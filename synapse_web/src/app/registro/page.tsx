'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { authAPI } from '../../lib/api';
import { CheckCircle, XCircle } from 'lucide-react';

// Carga dinámica de Estrellas.jsx con SSR deshabilitado
const BackgroundStars = dynamic(
  () => import('../../components/Estrellas'),
  { ssr: false }
);

const reglas = [
  { id: 'longitud', label: 'Mínimo 7 caracteres', test: (p: string) => p.length >= 7 },
  { id: 'mayuscula', label: 'Al menos 1 letra mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'numeros', label: 'Al menos 2 números', test: (p: string) => (p.match(/[0-9]/g) || []).length >= 2 },
  { id: 'especial', label: 'Al menos 1 carácter especial (@#$%&*!...)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.com$/i;
const NOMBRE_REGEX = /^[A-Za-zÁÉÍÓÚÑÜáéíóúñü\s]{2,60}$/;
const DOCUMENTO_REGEX = /^[0-9]{5,15}$/;

const calcularFechaMaxima = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 16);
  return d.toISOString().split('T')[0];
};

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    tipo_documento_id: '1',
    numero_documento: '',
    fecha_nacimiento: '',
    correo_electronico: '',
    password: '',
    confirmar_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const reglasEstado = useMemo(
    () => reglas.map((r) => ({ ...r, ok: r.test(form.password) })),
    [form.password]
  );

  const passwordValida = reglasEstado.every((r) => r.ok);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const nombres = form.nombres.trim();
    const apellidos = form.apellidos.trim();
    const numeroDocumento = form.numero_documento.trim();
    const correo = form.correo_electronico.trim();

    if (!NOMBRE_REGEX.test(nombres)) {
      return setError('Los nombres deben contener solo letras (2 a 60 caracteres).');
    }
    if (!NOMBRE_REGEX.test(apellidos)) {
      return setError('Los apellidos deben contener solo letras (2 a 60 caracteres).');
    }
    if (!DOCUMENTO_REGEX.test(numeroDocumento)) {
      return setError('El número de documento debe contener solo números (5 a 15 dígitos).');
    }
    if (!EMAIL_REGEX.test(correo)) {
      return setError('Ingresa un correo electrónico válido.');
    }
    if (!passwordValida) {
      return setError('La contraseña no cumple los requisitos de seguridad.');
    }
    if (!form.fecha_nacimiento) {
      return setError('La fecha de nacimiento es obligatoria.');
    }
    const nacimiento = new Date(form.fecha_nacimiento);
    if (isNaN(nacimiento.getTime())) {
      return setError('La fecha de nacimiento no es válida.');
    }
    if (nacimiento > new Date()) {
      return setError('La fecha de nacimiento no puede ser futura.');
    }
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    if (edad < 16) {
      return setError('Debes tener al menos 16 años para crear una cuenta.');
    }
    if (form.password !== form.confirmar_password) {
      return setError('Las contraseñas no coinciden.');
    }

    setLoading(true);
    try {
      // Verificar email
      const response = await authAPI.requestVerification({
        correo_electronico: correo.toLowerCase(),
      });

      // Guardamos temporalmente la información necesaria para la verificación
      localStorage.setItem(
        'verification_session',
        JSON.stringify({
          token: response.data.verificationToken || '',
          email: correo.toLowerCase(),
        })
      );

      console.log('Registro exitoso, redirigiendo a verify-email');

      // Guardamos también TODOS los datos del registro temporalmente
      localStorage.setItem(
        'pending_registration',
        JSON.stringify({
          nombres,
          apellidos,
          tipo_documento_id: parseInt(form.tipo_documento_id),
          numero_documento: numeroDocumento,
          fecha_nacimiento: form.fecha_nacimiento || undefined,
          correo_electronico: correo.toLowerCase(),
          password: form.password,
          rol: 1,
        })
      );

      // Mandamos al usuario a verificar
      router.push('/verify-email');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Error al registrarse.' ||
          'No se pudo enviar el código de verificación.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#071a39]">
      <div className="auth-background" aria-hidden="true" />
      <div className="auth-overlay" aria-hidden="true" />

      {/* Estrellas 3D por encima del overlay del fondo y detrás del formulario */}
      <BackgroundStars />

      <div className="relative z-10 min-h-screen flex items-center justify-center py-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
          <div className="text-center mb-6">
            <div className="text-3xl font-extrabold text-primary-700">SYNAPSE</div>
            <p className="text-gray-500 text-sm mt-1">Crear nueva cuenta</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombres
                </label>
                <input
                  id="nombres"
                  name="nombres"
                  className="input-field"
                  required
                  value={form.nombres}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos
                </label>
                <input
                  id="apellidos"
                  name="apellidos"
                  className="input-field"
                  required
                  value={form.apellidos}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="tipo_documento_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de documento
                </label>
                <select
                  id="tipo_documento_id"
                  name="tipo_documento_id"
                  className="input-field"
                  value={form.tipo_documento_id}
                  onChange={handleChange}
                >
                  <option value="1">Cédula de Ciudadanía</option>
                  <option value="2">Tarjeta de Identidad</option>
                  <option value="3">Cédula de Extranjería</option>
                  <option value="4">Pasaporte</option>
                </select>
              </div>
              <div>
                <label htmlFor="numero_documento" className="block text-sm font-medium text-gray-700 mb-1">
                  N° Documento
                </label>
                <input
                  id="numero_documento"
                  name="numero_documento"
                  inputMode="numeric"
                  className="input-field"
                  required
                  value={form.numero_documento}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de nacimiento
              </label>
              <input
                id="fecha_nacimiento"
                type="date"
                name="fecha_nacimiento"
                className="input-field"
                required
                max={calcularFechaMaxima()}
                value={form.fecha_nacimiento}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="correo_electronico" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                id="correo_electronico"
                type="email"
                name="correo_electronico"
                className="input-field"
                required
                value={form.correo_electronico}
                onChange={handleChange}
              />
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                onFocus={() => setPasswordFocus(true)}
                onBlur={() => setPasswordFocus(false)}
                className={`input-field ${
                  form.password
                    ? passwordValida
                      ? 'border-green-400 focus:ring-green-300'
                      : 'border-red-300 focus:ring-red-200'
                    : ''
                }`}
              />

              {(passwordFocus || form.password.length > 0) && (
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

            {/* Confirmar contraseña */}
            <div>
              <label htmlFor="confirmar_password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña
              </label>
              <input
                id="confirmar_password"
                type="password"
                name="confirmar_password"
                required
                value={form.confirmar_password}
                onChange={handleChange}
                className={`input-field ${
                  form.confirmar_password
                    ? form.confirmar_password === form.password
                      ? 'border-green-400 focus:ring-green-300'
                      : 'border-red-300 focus:ring-red-200'
                    : ''
                }`}
              />
              {form.confirmar_password && form.confirmar_password !== form.password && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <XCircle size={12} /> Las contraseñas no coinciden
                </p>
              )}
              {form.confirmar_password && form.confirmar_password === form.password && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle size={12} /> Las contraseñas coinciden
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !passwordValida || form.password !== form.confirmar_password}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary-600 font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}