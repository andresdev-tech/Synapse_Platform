'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { coordinadorAPI } from '../../../lib/api';
import { Users, BookOpen, ChevronRight, LayoutGrid, Sparkles, ArrowRightCircle } from 'lucide-react';

interface Programa {
  id: number;
  nombre: string;
  sector: string;
  activo: boolean;
  total_grupos?: number;
  aprendices_asignados?: number;
  inscripciones_pendientes?: number;
}

export default function CoordinadorPage() {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarProgramas = async () => {
      try {
        const response = await coordinadorAPI.misProgramas();
        setProgramas(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarProgramas();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-500 border-t-white mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Cargando el panel del coordinador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-10">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 opacity-90 blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-12">
          <div className="rounded-[2rem] bg-white/90 shadow-2xl border border-white/80 backdrop-blur-xl px-8 py-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-sky-800 font-semibold mb-3">Coordinador</p>
                <h1 className="text-5xl font-extrabold text-slate-900 leading-tight">Bienvenido de nuevo, Coordinador</h1>
                <p className="mt-4 max-w-2xl text-lg text-slate-600">Administra tus programas, asigna aprendices y revisa el estado de grupos desde un panel claro y moderno.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full sm:w-auto">
                <div className="rounded-3xl bg-slate-900/95 p-5 text-white shadow-xl">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Programas</p>
                  <p className="mt-3 text-3xl font-bold">{programas.length}</p>
                </div>
                <div className="rounded-3xl bg-sky-500/95 p-5 text-white shadow-xl">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-100">Sectores</p>
                  <p className="mt-3 text-3xl font-bold">{new Set(programas.map((programa) => programa.sector)).size}</p>
                </div>
                <div className="rounded-3xl bg-violet-500/95 p-5 text-white shadow-xl">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-100">Modalidades</p>
                  <p className="mt-3 text-3xl font-bold">3</p>
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-3xl bg-slate-50 p-6 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-5 text-slate-800">
                  <div className="rounded-2xl bg-sky-100 p-3 text-sky-600">
                    <LayoutGrid size={24} />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Estado general</p>
                    <h2 className="text-2xl font-semibold">Visión general de tus programas</h2>
                  </div>
                </div>
                <p className="text-slate-600">Revisa la carga de trabajo de cada programa y accede directo a la gestión de grupos desde los atajos más importantes.</p>
              </div>
              <div className="rounded-3xl bg-slate-900 p-6 shadow-xl border border-white/10 text-white">
                <div className="flex items-center gap-3 mb-5">
                  <div className="rounded-2xl bg-white/10 p-3 text-cyan-200">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Consejo rápido</p>
                    <h2 className="text-2xl font-semibold">Optimiza tus grupos</h2>
                  </div>
                </div>
                <p className="text-slate-300">Usa las tarjetas de programa para ver métricas rápidas, luego entra a cada grupo y gestiona expulsiones, suspensiones o reasignaciones con mayor facilidad.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {programas.map(programa => (
            <div key={programa.id} className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl transition hover:-translate-y-1 hover:shadow-2xl">
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 opacity-90"></div>
              <div className="relative p-6 pt-16">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-200">{programa.sector}</p>
                    <h2 className="text-2xl font-bold text-slate-900">{programa.nombre}</h2>
                  </div>
                  <div className="rounded-3xl bg-white/95 p-3 shadow-sm text-slate-900">
                    <BookOpen size={22} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Grupos</p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">{programa.total_grupos ?? 0}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Aprendices</p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">{programa.aprendices_asignados ?? 0}</p>
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200 mb-6">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Pendientes</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{programa.inscripciones_pendientes ?? 0}</p>
                </div>

                <div className="space-y-3">
                  <Link href={`/dashboard/coordinador/grupo/${programa.id}`}>
                    <button className="w-full inline-flex items-center justify-center gap-2 rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                      <ArrowRightCircle size={18} /> Gestionar programa
                    </button>
                  </Link>
                  <Link href={`/dashboard/coordinador/grupo/${programa.id}`}>
                    <button className="w-full inline-flex items-center justify-center gap-2 rounded-3xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
                      <ChevronRight size={18} /> Ver grupos
                    </button>
                  </Link>
                </div>

                <div className="mt-6 flex items-center justify-between text-sm font-medium">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 ${programa.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {programa.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="text-slate-400">Coordinación</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}