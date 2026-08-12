'use client'

import React from 'react';
import { authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function VerifyEmail() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const stored = localStorage.getItem('verification_session');
    const pending = localStorage.getItem('pending_registration');

    if (!pending) {
      setError('No existe un registro pendiente.');
      setLoading(false);
      return;
    }

    if (!stored) {
      setError('No existe una verificación pendiente.');
      setLoading(false);
      return;
    }

    const session = JSON.parse(stored);
    const pendingData = JSON.parse(pending);

    if (code.length !== 6) {
      console.log('Code must be 6 characters long');
      setLoading(false);
      return;
    }

    try {
      console.log('Verifying email with code:', code);
      const response = await authAPI.verifyEmail(
        session.email,
        session.token,
        code
      );

      if (response.data.ok) {
        const userData = localStorage.getItem('pending_registration');
        console.log('User data:', userData?.length);

        console.log('User verified:', response.data);
        console.log('Pending registration data:', pendingData);
        const user = await authAPI.registrar({
          nombres: pendingData.nombres,
          apellidos: pendingData.apellidos,
          correo_electronico: pendingData.correo_electronico,
          fecha_nacimiento: pendingData.fecha_nacimiento,
          password: pendingData.password,
          rol: pendingData.rol,
          tipo_documento_id: pendingData.tipo_documento_id,
          numero_documento: pendingData.numero_documento,
        });
        console.log('User registered:', user);
        router.push('/login?registered=true');
        console.log('Email verified successfully');
        setSuccess(true);
        setLoading(false);
        setError('');
      }
    } catch (err: any) {
      console.error('Error verifying email:', err);
      setError(err.response?.data?.message || 'Código incorrecto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-900 to-primary-600 px-4">
      <div className="w-full max-w-md mb-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-blue-100 hover:text-white transition-colors"
        >
          ← Volver al inicio
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl font-extrabold text-primary-700 tracking-tight">SYNAPSE</div>
          <p className="text-gray-500 text-sm mt-1">Verifica tu correo electrónico</p>
        </div>

        <form onSubmit={handleVerify} noValidate className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            Hemos enviado un código de 6 dígitos a tu correo para confirmar tu cuenta.
          </div>

          <div>
            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
              Código de verificación
            </label>
            <input
              id="codigo"
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="input-field text-center tracking-[0.5em] font-semibold"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
              Email verificado correctamente
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Verificando...' : 'Verificar correo'}
          </button>
        </form>
      </div>
    </div>
  );
}
