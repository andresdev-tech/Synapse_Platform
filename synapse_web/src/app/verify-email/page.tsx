'use client'

import React from 'react'
import { authAPI } from '@/lib/api'
import { useRouter } from 'next/navigation';
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

        const stored = localStorage.getItem(
            'verification_session'
        );

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
        // TODO: Call API to verify email
        try {
            console.log('Verifying email with code:', code);
            // TODO: Call API to verify email
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
                    numero_documento: pendingData.numero_documento
                });
                console.log('User registered:', user);
                //localStorage.removeItem('verification_session');
                router.push('/login?registered=true');
                console.log('Email verified successfully');
                setSuccess(true);
                setLoading(false);
                setError('');
            }
        } catch (err: any) {
            console.error('Error verifying email:', err);
            setError(
                err.response?.data?.message ||
                'Código incorrecto.'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="h-screen w-screen bg-white flex justify-center items-center">
            <div className='bg-blue-900 h-96 w-96 rounded-3xl flex flex-col justify-center items-center'>
                <div className='flex flex-col gap-4 w-full px-8'>
                    <h1 className='text-white text-2xl font-bold text-center'>Verificar Email</h1>
                    <input className='rounded-lg p-2 bg-white text-black' value={code} onChange={(e) => setCode(e.target.value)} />
                    {error && <p className='text-red-500 text-center'>{error}</p>}
                    {success && <p className='text-green-500 text-center'>Email verificado correctamente</p>}
                    <button onClick={handleVerify} disabled={loading} className='bg-white text-blue-900 rounded-lg px-4 py-2'>{loading ? 'Verificando...' : 'Verificar'}</button>
                </div>
            </div>
        </div>
    )
}
