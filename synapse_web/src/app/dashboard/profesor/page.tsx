'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { profesorAPI } from '../../../lib/api';
import {
  GraduationCap, BookOpen, ChevronRight, Users,
  ShieldAlert, Mail, Sparkles
} from 'lucide-react';

interface Programa {
  id: number;
  nombre: string;
  sector: string;
}

interface ProgramaConDatos extends Programa {
  totalAprendices: number;
  totalCondicionados: number;
}

export default function ProfesorPage() {
  const { usuario } = useAuth();
  const router = useRouter();
  const [programas, setProgramas] = useState<ProgramaConDatos[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (usuario && usuario.rol !== 'Profesor' && usuario.rol !== 'Administrador') {
      router.push('/dashboard');
      return;
    }
    cargar();
  }, [usuario]);

  const cargar = async () => {
    try {
      const res = await profesorAPI.misProgramas();
      const base: Programa[] = res.data;

      // Enriquecer cada curso con el tamaño real del grupo
      const conDatos = await Promise.all(
        base.map(async (p) => {
          try {
            const grupoRes = await profesorAPI.obtenerGrupo(p.id);
            const grupo = grupoRes.data as any[];
            return {
              ...p,
              totalAprendices: grupo.length,
              totalCondicionados: grupo.filter((a) => a.suspendido).length,
            };
          } catch {
            return { ...p, totalAprendices: 0, totalCondicionados: 0 };
          }
        })
      );
      setProgramas(conDatos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalCursos = programas.length;
  const totalAprendices = programas.reduce((acc, p) => acc + p.totalAprendices, 0);
  const totalCondicionados = programas.reduce((acc, p) => acc + p.totalCondicionados, 0);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-teal-800 via-teal-600 to-emerald-500 px-4 sm:px-8 py-6 sm:py-8 text-white">
        <div className="flex items-center gap-2 mb-1 text-teal-100 text-sm font-medium">
          <GraduationCap size={16} />
          Panel Docente
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">Hola, {usuario?.nombres}</h1>
        <p className="text-teal-50 text-sm">Consulta tus grupos asignados y registra la asistencia de tus aprendices</p>
      </div>

      <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-5xl space-y-8">

        {/* ── ESTADÍSTICAS ─────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Cursos a cargo',      value: totalCursos,        icon: BookOpen,    bg: 'bg-teal-50',   color: 'text-teal-600' },
            { label: 'Aprendices totales',  value: totalAprendices,    icon: Users,       bg: 'bg-blue-50',   color: 'text-blue-600' },
            { label: 'Condicionados',       value: totalCondicionados, icon: ShieldAlert, bg: totalCondicionados > 0 ? 'bg-red-50' : 'bg-gray-50', color: totalCondicionados > 0 ? 'text-red-600' : 'text-gray-400' },
          ].map(({ label, value, icon: Icon, bg, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <div className="text-3xl font-extrabold text-gray-900">{value}</div>
              <div className="text-gray-400 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* ── MIS CURSOS ────────────────────────────────── */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Mis Cursos</h2>

          {programas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} className="text-teal-400" />
              </div>
              <h3 className="text-gray-800 font-semibold mb-1">Aún no tienes cursos asignados</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto mb-5">
                Cuando un Coordinador te asigne un programa, aparecerá aquí junto con la lista de
                aprendices y el control de asistencia.
              </p>
              <a
                href="mailto:admin@nexus.edu.co?subject=Solicitud%20de%20asignaci%C3%B3n%20de%20curso"
                className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2.5 rounded-xl transition-colors"
              >
                <Mail size={15} />
                Solicitar asignación al administrador
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => router.push(`/dashboard/profesor/grupo/${p.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-md hover:border-teal-200 transition-all group"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-teal-50 p-2.5 rounded-xl group-hover:bg-teal-100 transition-colors">
                      <GraduationCap size={20} className="text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">{p.nombre}</h3>
                      <span className="text-xs text-gray-400">{p.sector}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Users size={13} className="text-gray-400" />
                      <span className="font-semibold text-gray-700">{p.totalAprendices}</span> aprendices
                    </div>
                    {p.totalCondicionados > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                        <ShieldAlert size={13} />
                        {p.totalCondicionados} condicionado{p.totalCondicionados > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-sm font-semibold text-teal-600">
                    Ver grupo y asistencia <ChevronRight size={14} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── BANNER MOTIVACIONAL ───────────────────────── */}
        {programas.length > 0 && (
          <div className="bg-gradient-to-r from-teal-700 to-emerald-500 rounded-2xl p-6 flex items-center gap-4 text-white">
            <div className="bg-white/20 p-3 rounded-xl flex-shrink-0">
              <Sparkles size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold">Mantén la asistencia al día</h3>
              <p className="text-teal-50 text-sm">
                Registrar las faltas a tiempo permite detectar a tiempo a los aprendices en riesgo de condicionamiento.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}