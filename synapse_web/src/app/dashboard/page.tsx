'use client';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { programasAPI, inscripcionesAPI } from '../../lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen, MessageSquare, ClipboardList, Users,
  ChevronRight, Sparkles, GraduationCap, BarChart2, Settings
} from 'lucide-react';
import { gruposAPI, coordinadorAPI } from '../../lib/api';

function ProgressRing({ value, size = 56, stroke = 6 }: { value: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = Math.max(0, Math.min(1, value / 100));
  const offset = circumference * (1 - dash);
  return (
    <svg width={size} height={size} className="inline-block">
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} />
        <circle
          r={radius}
          fill="none"
          stroke="#2563eb"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 600ms ease' }}
        />
      </g>
    </svg>
  );
}

export default function DashboardPage() {
  const { usuario, loading, isAdmin, isAprendiz, isProfesor } = useAuth();
  const esProfesor = isProfesor();
  const esCoordinador = usuario?.rol?.toLowerCase() === 'coordinador';
  const router = useRouter();
  const [stats, setStats] = useState({ programas: 0, inscripciones: 0 });
  const [displayStats, setDisplayStats] = useState({ programas: 0, inscripciones: 0 });
  const quotes = useMemo(() => [
    { emoji: '🚀', title: 'Atrévete a despegar', subtitle: 'Un pequeño paso hoy, un gran salto mañana.' },
    { emoji: '🔥', title: 'Enciende tu curiosidad', subtitle: 'La pasión impulsa el aprendizaje sostenido.' },
    { emoji: '💡', title: 'Transforma ideas en acción', subtitle: 'Las ideas valen cuando las compartes y aplicas.' },
    { emoji: '🤝', title: 'Multiplica tu impacto', subtitle: 'Enseñar es sembrar conocimientos que crecen.' },
    { emoji: '🌱', title: 'Cultiva constancia', subtitle: 'El progreso diario florece con disciplina.' },
    { emoji: '🎯', title: 'Apunta alto', subtitle: 'Define metas claras y conviértelas en hábitos.' },
  ], []);
  const [quoteIndex, setQuoteIndex] = useState(0);
  // Typing text state
  const [typingText, setTypingText] = useState('');
  // Quick access for coordinador
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickProgram, setQuickProgram] = useState<any | null>(null);
  const [quickGrupo, setQuickGrupo] = useState<any | null>(null);
  const [quickMiembros, setQuickMiembros] = useState<any[]>([]);
  const [quickModalOpen, setQuickModalOpen] = useState(false);
  const [quickAccionUsuario, setQuickAccionUsuario] = useState<any | null>(null);
  const [quickAccionTipo, setQuickAccionTipo] = useState<'expulsar'|'suspender'>('expulsar');
  const [quickMotivo, setQuickMotivo] = useState('');
  const [quickLoadingAction, setQuickLoadingAction] = useState(false);
  // Dashboard decorations / programas modal
  const [programasList, setProgramasList] = useState<any[]>([]);
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [programGrupos, setProgramGrupos] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && isAdmin()) {
      router.push('/dashboard/admin/overview');
      return;
    }

    let cancelled = false;

    const cargar = async () => {
      try {
        const [progRes, inscRes] = await Promise.all([
          programasAPI.listar(),
          isAprendiz() ? inscripcionesAPI.misInscripciones() : Promise.resolve({ data: [] }),
        ]);

        if (cancelled) return;

        const programas = progRes.data || [];
        setProgramasList(programas);
        setStats({
          programas: programas.length,
          inscripciones: inscRes.data.length,
        });
      } catch {}
    };

    if (!isAdmin()) cargar();

    const cargarQuick = async () => {
      if (usuario?.rol !== 'coordinador') return;
      try {
        setQuickLoading(true);
        const res = await coordinadorAPI.misProgramas();
        const programas = res.data;
        if (programas.length === 0) return;
        setQuickProgram(programas[0]);
        const gruposRes = await gruposAPI.obtenerGruposPorPrograma(programas[0].id);
        const grupos = gruposRes.data;
        if (grupos.length === 0) return;
        setQuickGrupo(grupos[0]);
        const detalles = await gruposAPI.obtenerInfoCompletaGrupo(grupos[0].id);
        setQuickMiembros(detalles.data.miembros || []);
      } catch (e) {
        // no crítico
      } finally {
        setQuickLoading(false);
      }
    };

    cargarQuick();

    return () => {
      cancelled = true;
    };
  }, [usuario, loading, isAdmin, isAprendiz, router]);

  // Rotar frases motivacionales cada 4 segundos
  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(id);
  }, [quotes.length]);

  useEffect(() => {
    const full = quotes[quoteIndex].title;
    let i = 0;
    setTypingText('');
    const t = setTimeout(() => {
      const run = () => {
        i += 1;
        setTypingText(full.slice(0, i));
        if (i < full.length) {
          setTimeout(run, 55);
        }
      };
      run();
    }, 80);
    return () => clearTimeout(t);
  }, [quoteIndex, quotes]);

  useEffect(() => {
    setDisplayStats(stats);
  }, [stats.programas, stats.inscripciones]);

  const ringValue = useMemo(() => {
    const value = Math.min(100, Math.max(20, stats.programas * 12 + 15));
    return value;
  }, [stats.programas]);

  // Stat detail modal
  const [statModalOpen, setStatModalOpen] = useState(false);
  const [statSelected, setStatSelected] = useState<{ label: string; value: number } | null>(null);
  const openStatModal = (label: string, value: number) => {
    setStatSelected({ label, value });
    setStatModalOpen(true);
  };

  const abrirQuickAccion = (miembro: any) => {
    setQuickAccionUsuario(miembro);
    setQuickAccionTipo('expulsar');
    setQuickMotivo('');
    setQuickModalOpen(true);
  };

  const enviarQuickAccion = async () => {
    if (!quickAccionUsuario) return;
    if (!quickMotivo || quickMotivo.trim().length === 0) {
      return;
    }
    try {
      setQuickLoadingAction(true);
      if (quickAccionTipo === 'expulsar') {
        await gruposAPI.expulsarAprendiz(quickGrupo.id, quickAccionUsuario.usuario_id, quickMotivo);
      } else {
        await gruposAPI.suspenderAprendiz(quickGrupo.id, quickAccionUsuario.usuario_id, quickMotivo);
      }
      // refrescar miembros
      const detalles = await gruposAPI.obtenerInfoCompletaGrupo(quickGrupo.id);
      setQuickMiembros(detalles.data.miembros || []);
      setQuickModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setQuickLoadingAction(false);
    }
  };

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100">

      {/* ── HERO BANNER ──────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 px-4 sm:px-8 py-4 sm:py-6 lg:py-10 shadow-2xl ring-1 ring-white/10 text-white">
        <div className="absolute top-0 right-0 h-32 sm:h-44 w-32 sm:w-44 rounded-full bg-white/10 blur-3xl opacity-50" />
        <div className="absolute -bottom-10 sm:-bottom-14 left-6 sm:left-10 h-48 sm:h-72 w-48 sm:w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="max-w-4xl relative">
          <div className="flex items-center gap-2 mb-2 sm:mb-3 text-blue-100 text-xs sm:text-sm font-semibold">
            <Sparkles size={14} />
            Plataforma Académica Inteligente
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mb-2 leading-tight text-white drop-shadow-sm">
            {saludo},<br />
            <span className="text-white drop-shadow-md">{usuario?.nombres} {usuario?.apellidos}</span>
          </h1>
          <p className="text-blue-50 text-xs sm:text-sm max-w-lg font-medium">
            {isAdmin()
              ? 'Gestiona usuarios, programas e inscripciones desde tu panel de administración.'
              : esProfesor
              ? 'Consulta tus cursos asignados y registra la asistencia de tus aprendices.'
              : 'Explora los programas disponibles, gestiona tus inscripciones y consulta al ChatBot con IA.'}
          </p>

          {/* Badges de rol */}
          <div className="flex items-center gap-2 mt-3">
            <span className="bg-slate-100/10 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/20">
              <GraduationCap size={12} />
              {usuario?.rol}
            </span>
            <span className="bg-slate-100/10 text-white text-xs px-3 py-1 rounded-full border border-white/20">
              {usuario?.correo_electronico}
            </span>
          </div>

          {/* Frase motivacional rotativa en el hero (más llamativa) */}
          <div className="mt-3 sm:mt-5">
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl px-3 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 shadow-2xl border border-white/10">
              <div className="text-2xl sm:text-3xl animate-pulse">{quotes[quoteIndex].emoji}</div>
              <div className="max-w-xl">
                <p key={quoteIndex} className="text-base sm:text-lg text-white font-extrabold leading-tight transform transition-all duration-700 ease-in-out">
                  {typingText}
                  <span className="text-white/80">|</span>
                </p>
                <p key={`sub-${quoteIndex}`} className="text-xs sm:text-sm text-white/90 mt-1 opacity-95">{quotes[quoteIndex].subtitle}</p>
                <div className="mt-2 sm:mt-3 flex items-center gap-2">
                  {quotes.map((_, i) => (
                    <span key={i} className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full transition-all ${i === quoteIndex ? 'bg-white scale-110' : 'bg-white/30'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal programas -> grupos */}
      {programModalOpen && selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950/95 rounded-[1.75rem] shadow-2xl max-w-2xl w-full p-6 border border-white/10 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Grupos de {selectedProgram.nombre}</h3>
              <button onClick={() => setProgramModalOpen(false)} className="text-slate-400">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {programGrupos.length === 0 ? (
                <div className="text-slate-400">No hay grupos para este programa</div>
              ) : (
                programGrupos.map(g => (
                  <div key={g.id} className="bg-slate-900/80 p-4 rounded-3xl border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Grupo {g.numero_grupo}</p>
                      <p className="text-xs text-slate-400">{g.nombre}</p>
                    </div>
                    <div>
                      <button onClick={() => { window.location.href = `/dashboard/coordinador/grupo/${selectedProgram.id}` }} className="bg-cyan-500 text-slate-950 px-3 py-1 rounded-full">Gestionar</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-8 py-4 sm:py-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">

        {/* ── ESTADÍSTICAS (diseño por rol) ───────────────── */}
        {esCoordinador ? (
          <div className="mt-6 rounded-[2rem] overflow-hidden shadow-2xl p-6 bg-slate-900/10 border border-slate-800/40 backdrop-blur-xl">
            <div className="rounded-[1.5rem] bg-gradient-to-r from-slate-950/80 via-slate-900/80 to-blue-950/80 p-6 ring-1 ring-white/10">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-indigo-600 uppercase">Coordinador</div>
                  <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Visión general de tus programas</h2>
                  <p className="mt-3 text-sm text-slate-600 max-w-xl">Revisa la carga de trabajo, accede a gestión de grupos y prioriza acciones desde este panel.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => router.push('/dashboard/coordinador') } className="bg-blue-600 text-white px-4 py-2 rounded-lg">Ir a panel</button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                <div className="absolute -top-12 -left-8 w-40 h-40 rounded-full bg-gradient-to-tr from-purple-200 to-indigo-200 opacity-60 blur-2xl transform rotate-[25deg] pointer-events-none" />
                <div className="absolute -bottom-16 -right-8 w-56 h-56 rounded-full bg-gradient-to-tr from-sky-100 to-blue-200 opacity-60 blur-3xl pointer-events-none" />
                <button onClick={() => openStatModal('Programas', displayStats.programas)} className="group bg-slate-900/95 text-white rounded-[2rem] p-6 shadow-2xl border border-white/10 hover:-translate-y-1 transform transition overflow-hidden relative">
                  <div className="absolute inset-x-0 -top-10 h-24 bg-gradient-to-r from-cyan-500/15 via-transparent to-sky-500/10 blur-2xl" />
                  <div className="relative mb-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-slate-400">
                        <div className="w-10 h-10 rounded-3xl bg-sky-500/20 flex items-center justify-center text-sky-200 shadow-inner">
                          <BookOpen size={18} />
                        </div>
                        Programas
                      </div>
                      <div className="text-4xl font-extrabold text-white mt-4">{displayStats.programas}</div>
                    </div>
                    <div className="rounded-3xl bg-slate-900/80 p-3 shadow-inner">
                      <ProgressRing value={ringValue} />
                    </div>
                  </div>
                  <div className="text-sm text-slate-400 leading-relaxed">Programas activos bajo tu coordinación, con todos los grupos y rutas de formación.</div>
                  <div className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-300">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" /> Visión 360
                  </div>
                </button>
                <button onClick={() => openStatModal('Sectores', 7)} className="bg-slate-950/95 text-white rounded-[2rem] p-6 shadow-2xl border border-white/10 hover:-translate-y-1 transform transition overflow-hidden relative">
                  <div className="absolute inset-x-0 -top-10 h-24 bg-gradient-to-r from-sky-500/15 via-transparent to-cyan-500/10 blur-2xl" />
                  <div className="relative mb-5">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-slate-400">
                      <div className="w-10 h-10 rounded-3xl bg-violet-500/20 flex items-center justify-center text-violet-200 shadow-inner">
                        <BarChart2 size={18} />
                      </div>
                      Sectores
                    </div>
                    <div className="text-4xl font-extrabold text-white mt-4">7</div>
                  </div>
                  <div className="text-sm text-slate-400 leading-relaxed">Las áreas temáticas en las que estás apoyando con contenidos, programas y grupos.</div>
                  <div className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-300">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" /> Mapa temático
                  </div>
                </button>
                <button onClick={() => openStatModal('Modalidades', 3)} className="bg-slate-950/95 text-white rounded-[2rem] p-6 shadow-2xl border border-white/10 hover:-translate-y-1 transform transition overflow-hidden relative">
                  <div className="absolute inset-x-0 -top-10 h-24 bg-gradient-to-r from-violet-500/15 via-transparent to-fuchsia-500/10 blur-2xl" />
                  <div className="relative mb-5">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-slate-400">
                      <div className="w-10 h-10 rounded-3xl bg-orange-500/20 flex items-center justify-center text-orange-200 shadow-inner">
                        <Sparkles size={18} />
                      </div>
                      Modalidades
                    </div>
                    <div className="text-4xl font-extrabold text-white mt-4">3</div>
                  </div>
                  <div className="text-sm text-slate-400 leading-relaxed">Distintas rutas y formatos de formación que puedes ofrecer a tus grupos.</div>
                  <div className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-violet-300">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-violet-300" /> Experiencia premium
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] bg-slate-950/95 border border-white/10 shadow-2xl p-6 backdrop-blur-xl">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <div className="text-sm font-semibold text-indigo-300 uppercase tracking-[0.2em]">Resumen inmediato</div>
                  <h3 className="text-2xl font-extrabold text-white mt-3">Acciones recomendadas para esta semana</h3>
                  <p className="mt-3 text-sm text-slate-400 max-w-2xl">Revisa los puntos clave de tus programas y atiende las tareas que más impacto tienen en la coordinación.</p>
                </div>
                <div className="inline-flex items-center gap-3 rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                  <div className="h-2.5 w-2.5 rounded-full bg-cyan-300" /> 3 tareas críticas
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-[1.75rem] bg-slate-900/80 border border-white/10 p-5 shadow-inner">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Progreso</div>
                  <div className="mt-3 text-3xl font-extrabold text-white">78%</div>
                  <p className="mt-3 text-sm text-slate-400">Porcentaje de avance promedio en tus programas activos.</p>
                </div>
                <div className="rounded-[1.75rem] bg-slate-900/80 border border-white/10 p-5 shadow-inner">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Interacción</div>
                  <div className="mt-3 text-3xl font-extrabold text-white">12</div>
                  <p className="mt-3 text-sm text-slate-400">Grupos con mensajes pendientes esta semana.</p>
                </div>
                <div className="rounded-[1.75rem] bg-slate-900/80 border border-white/10 p-5 shadow-inner">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Feedback</div>
                  <div className="mt-3 text-3xl font-extrabold text-white">4</div>
                  <p className="mt-3 text-sm text-slate-400">Alertas de seguimiento programadas para revisar.</p>
                </div>
              </div>
            </div>
          </div>
        ) : esProfesor ? (
          <div className="mt-6 rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 border border-white/10 shadow-2xl p-6 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-r from-teal-500/20 via-slate-950/0 to-slate-950/20 blur-3xl pointer-events-none" />
            <div className="relative grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
              <div className="rounded-[1.75rem] bg-slate-950/80 border border-white/10 p-6 shadow-inner">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-emerald-300 uppercase tracking-[0.2em]">Ritmo docente</div>
                    <h3 className="text-3xl font-extrabold text-white mt-3">Organiza tus clases con claridad</h3>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-200">Foco en la sesión</div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-slate-900/70 p-4 border border-white/10">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Tareas pendientes</div>
                    <div className="mt-3 text-4xl font-extrabold text-white">{stats.inscripciones}</div>
                    <p className="mt-3 text-sm text-slate-400">Revisión de entregas y feedback pendiente.</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-900/70 p-4 border border-white/10">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Sesiones activas</div>
                    <div className="mt-3 text-4xl font-extrabold text-white">4</div>
                    <p className="mt-3 text-sm text-slate-400">Clases que comienzan en las próximas 48 horas.</p>
                  </div>
                </div>
                <div className="mt-6 rounded-[1.75rem] bg-slate-900/70 p-5 border border-white/10 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Nivel de compromiso</div>
                      <div className="mt-3 text-3xl font-extrabold text-white">82%</div>
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-emerald-200">Meta del mes</div>
                  </div>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-2.5 w-4/5 rounded-full bg-emerald-400" />
                  </div>
                  <p className="mt-3 text-sm text-slate-400">Estrategia de interacción con estudiantes y horas de clase completadas.</p>
                </div>
              </div>
              <div className="rounded-[1.75rem] bg-slate-950/75 border border-white/10 p-6 shadow-inner">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-300 uppercase tracking-[0.2em]">Próximo bloque</div>
                    <h4 className="mt-3 text-xl font-bold text-white">Matemáticas aplicadas</h4>
                    <p className="mt-2 text-sm text-slate-400">Grupo 2A • 09:00 AM • Aula virtual</p>
                  </div>
                  <div className="rounded-3xl bg-emerald-500/15 px-3 py-2 text-xs text-emerald-200 uppercase tracking-[0.2em]">En curso</div>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-[1.5rem] bg-slate-900/70 p-4 border border-white/10">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Objetivo</div>
                    <p className="mt-2 text-sm text-slate-300">Preparar a los estudiantes para el proyecto final con ejercicios prácticos.</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-900/70 p-4 border border-white/10">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Recursos</div>
                    <p className="mt-2 text-sm text-slate-300">Material interactivo, rúbricas y retroalimentación previa.</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <button className="rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">Ver mi agenda</button>
                  <button className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900">Enviar recordatorio a alumnos</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Programas', value: displayStats.programas, icon: BookOpen, bg: 'bg-sky-500/20', color: 'text-sky-300' },
              { label: 'Mis inscripciones', value: displayStats.inscripciones, icon: ClipboardList, bg: 'bg-emerald-500/20', color: 'text-emerald-300', show: isAprendiz() },
              { label: 'Sectores', value: 7, icon: BarChart2, bg: 'bg-violet-500/20', color: 'text-violet-300' },
              { label: 'Modalidades', value: 3, icon: Sparkles, bg: 'bg-orange-500/20', color: 'text-orange-300' },
            ].filter(s => s.show !== false).map(({ label, value, icon: Icon, bg, color }) => (
              <div key={label} className="bg-slate-950/80 backdrop-blur-xl rounded-[1.75rem] border border-white/10 shadow-2xl p-5 hover:-translate-y-1 transform transition">
                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center mb-4 ${bg} shadow-inner`}>
                  <Icon size={24} className={color} />
                </div>
                <div className="text-3xl font-extrabold text-white">{value}</div>
                <div className="text-slate-400 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        )}

        {esProfesor ? (
          <div className="mt-6 rounded-[2rem] bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-emerald-950/80 border border-white/10 shadow-2xl p-6 backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="text-sm font-semibold text-emerald-300 uppercase tracking-[0.2em]">Panel pedagógico</div>
                <h3 className="text-2xl font-extrabold text-white mt-3">Lo esencial para tu clase</h3>
                <p className="mt-3 text-sm text-slate-300 max-w-2xl">Monitorea entregas, prepara tus sesiones y lleva el seguimiento de tus grupos sin perder el ritmo.</p>
              </div>
              <Link href="/dashboard/profesor" className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/15 transition">
                <MessageSquare size={16} /> Ir a mi panel docente
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-[1.75rem] bg-slate-900/80 border border-white/10 p-5 shadow-inner">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Programas a cargo</div>
                <div className="mt-3 text-3xl font-extrabold text-white">{displayStats.programas}</div>
                <p className="mt-3 text-sm text-slate-400">Cantidad de programas que coordinas como docente.</p>
              </div>
              <div className="rounded-[1.75rem] bg-slate-900/80 border border-white/10 p-5 shadow-inner">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Entregas por revisar</div>
                <div className="mt-3 text-3xl font-extrabold text-white">{stats.inscripciones}</div>
                <p className="mt-3 text-sm text-slate-400">Elementos que requieren tu revisión y feedback.</p>
              </div>
              <div className="rounded-[1.75rem] bg-slate-900/80 border border-white/10 p-5 shadow-inner">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Sesiones próximas</div>
                <div className="mt-3 text-3xl font-extrabold text-white">4</div>
                <p className="mt-3 text-sm text-slate-400">Clases agendadas y grupos activos para los próximos días.</p>
              </div>
            </div>
          </div>
        ) : isAprendiz() ? (
          <div className="mt-6 rounded-[2rem] bg-slate-950/95 border border-white/10 shadow-2xl p-6 backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="text-sm font-semibold text-indigo-300 uppercase tracking-[0.2em]">Insight rápido</div>
                <h3 className="text-2xl font-extrabold text-white mt-3">Lo más importante del día</h3>
                <p className="mt-3 text-sm text-slate-400 max-w-2xl">Revisa tus métricas clave, el estado de las inscripciones y los próximos pasos sin salir del dashboard.</p>
              </div>
              <div className="inline-flex items-center gap-3 rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                <div className="h-2.5 w-2.5 rounded-full bg-cyan-300" /> Recomendaciones al instante
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-[1.75rem] bg-slate-900/80 border border-white/10 p-5 shadow-inner">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Actividad</div>
                <div className="mt-3 text-3xl font-extrabold text-white">8</div>
                <p className="mt-3 text-sm text-slate-400">Elementos nuevos agregados a tus listas esta semana.</p>
              </div>
              <div className="rounded-[1.75rem] bg-slate-900/80 border border-white/10 p-5 shadow-inner">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Pendientes</div>
                <div className="mt-3 text-3xl font-extrabold text-white">2</div>
                <p className="mt-3 text-sm text-slate-400">Acciones recomendadas para completar antes de cerrar el día.</p>
              </div>
              <div className="rounded-[1.75rem] bg-slate-900/80 border border-white/10 p-5 shadow-inner">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Explorar</div>
                <div className="mt-3 text-3xl font-extrabold text-white">5</div>
                <p className="mt-3 text-sm text-slate-400">Nuevos programas y modalidades que podrían interesarte.</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* ── ACCESOS RÁPIDOS ───────────────────────────── */}
        {isAprendiz() && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">¿Qué quieres hacer hoy?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  href: '/dashboard/programas',
                  icon: BookOpen,
                  gradient: 'from-sky-500 to-cyan-500',
                  title: 'Explorar Programas',
                  desc: '20 programas disponibles en diferentes modalidades y horarios.',
                  cta: 'Ver programas',
                },
                {
                  href: '/dashboard/inscripciones',
                  icon: ClipboardList,
                  gradient: 'from-emerald-500 to-teal-500',
                  title: 'Mis Inscripciones',
                  desc: 'Consulta el estado de tus inscripciones activas y pendientes.',
                  cta: 'Ver inscripciones',
                },
                {
                  href: '/dashboard/chatbot',
                  icon: MessageSquare,
                  gradient: 'from-violet-500 to-fuchsia-500',
                  title: 'ChatBot con IA',
                  desc: 'Resuelve tus dudas sobre programas, requisitos e inscripciones.',
                  cta: 'Abrir ChatBot',
                },
              ].map(({ href, icon: Icon, gradient, title, desc, cta }) => (
                <Link key={href} href={href}
                  className="rounded-[1.75rem] overflow-hidden border border-white/10 shadow-2xl hover:shadow-2xl/50 transition-all transform hover:-translate-y-1 bg-slate-950/80">
                  <div className={`bg-gradient-to-r ${gradient} p-5`}>
                    <div className="bg-white/10 w-12 h-12 rounded-3xl flex items-center justify-center shadow-inner">
                      <Icon size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-white mb-2">{title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">{desc}</p>
                    <div className="flex items-center gap-1 text-sm font-semibold text-cyan-300 group-hover:gap-2 transition-all">
                      {cta} <ChevronRight size={15} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        

        {/* ── ACCESO RÁPIDO COORDINADOR ───────────────────── */}
        {esCoordinador && quickProgram && quickGrupo && (
          <div className="mt-6 rounded-[1.75rem] bg-slate-950/90 border border-white/10 shadow-2xl p-5 backdrop-blur-md">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-bold text-lg text-white">Acceso rápido: {quickProgram.nombre}</h3>
                <p className="text-sm text-slate-400">Grupo {quickGrupo.numero_grupo} — {quickGrupo.nombre}</p>
              </div>
              <button onClick={() => setQuickModalOpen(true)} className="bg-cyan-500 text-slate-950 px-4 py-2 rounded-full font-semibold shadow-lg hover:bg-cyan-400 transition">Gestionar ahora</button>
            </div>
            {/* Consejo rotativo específico para coordinador (más potente) */}
            <div className="mt-4 p-4 bg-slate-900/70 rounded-[1.5rem] border border-white/10 shadow-inner">
              <p className="text-sm text-slate-300 font-medium">Consejo para coordinadores:</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/20 text-2xl">{quotes[quoteIndex].emoji}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{quotes[quoteIndex].title}</p>
                  <p className="text-xs text-slate-400">{quotes[quoteIndex].subtitle}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {quickMiembros.slice(0,3).map(m => (
                <div key={m.usuario_id} className="bg-slate-900/80 p-4 rounded-3xl border border-white/10">
                  <p className="font-medium text-sm text-white">{m.nombre_completo}</p>
                  <p className="text-xs text-slate-400">{m.correo_electronico}</p>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => abrirQuickAccion(m)} className="text-sm bg-red-500 text-white px-2 py-1 rounded-full">Acción</button>
                  </div>
                </div>
              ))}
              {quickMiembros.length === 0 && (
                <div className="col-span-3 text-sm text-slate-400">No hay miembros asignados</div>
              )}
            </div>
          </div>
        )}

        {/* Stat detail modal */}
        {statModalOpen && statSelected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-slate-950/95 rounded-[1.75rem] shadow-2xl max-w-md w-full p-6 border border-white/10 backdrop-blur-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{statSelected.label}</h3>
                  <p className="text-sm text-slate-400">Valor actual: <span className="font-semibold text-white">{statSelected.value}</span></p>
                </div>
                <button onClick={() => setStatModalOpen(false)} className="text-slate-400">✕</button>
              </div>
              <p className="text-sm text-slate-300">Aquí puedes ver detalles y acciones rápidas relacionadas con <span className="font-semibold text-white">{statSelected.label}</span>. (Ejemplo: exportar lista, ver grupos asociados, ver inscripciones, etc.)</p>
              <div className="mt-4 flex gap-3">
                <button className="bg-cyan-500 text-slate-950 px-4 py-2 rounded-full">Ver detalles</button>
                <button onClick={() => setStatModalOpen(false)} className="bg-slate-800 text-slate-200 px-4 py-2 rounded-full">Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {/* ── MIS PROGRAMAS (DECORADO) ───────────────────── */}
        {esCoordinador && programasList.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-white mb-4">Mis Programas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {programasList.slice(0,8).map((p) => (
                <div
                  key={p.id}
                  onClick={async () => {
                    setSelectedProgram(p);
                    setProgramModalOpen(true);
                    try {
                      const res = await gruposAPI.obtenerGruposPorPrograma(p.id);
                      setProgramGrupos(res.data || []);
                    } catch (e) {
                      setProgramGrupos([]);
                    }
                  }}
                  className="cursor-pointer transform hover:-translate-y-1 transition bg-slate-900/80 rounded-[1.75rem] p-5 shadow-2xl border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{p.nombre}</h3>
                      <p className="text-xs text-slate-400 mt-1">{p.sector || 'Sin sector'}</p>
                    </div>
                    <div className="text-sm text-slate-300">{p.horarios?.length || '-'}</div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-slate-400">{p.activo ? 'Activo' : 'Inactivo'}</div>
                    <div className="text-sm font-bold text-cyan-300">Ver grupos →</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal rápido para acciones */}
        {quickModalOpen && quickAccionUsuario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-950/95 rounded-[1.75rem] shadow-2xl max-w-md w-full p-6 border border-white/10 backdrop-blur-xl">
              <h3 className="text-lg font-bold mb-2 text-white">Acción rápida: {quickAccionUsuario.nombre_completo}</h3>
              <div className="flex gap-2 mb-3">
                <button onClick={() => setQuickAccionTipo('expulsar')} className={`flex-1 py-2 rounded-full ${quickAccionTipo === 'expulsar' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-200'}`}>Expulsar</button>
                <button onClick={() => setQuickAccionTipo('suspender')} className={`flex-1 py-2 rounded-full ${quickAccionTipo === 'suspender' ? 'bg-yellow-600 text-slate-950' : 'bg-slate-800 text-slate-200'}`}>Suspender</button>
              </div>
              <textarea value={quickMotivo} onChange={(e) => setQuickMotivo(e.target.value)} rows={4} className="w-full border border-white/10 bg-slate-950/90 text-slate-100 p-3 rounded-2xl mb-3" placeholder="Motivo que se enviará por correo" />
              <div className="flex gap-3">
                <button onClick={enviarQuickAccion} disabled={quickLoadingAction} className="flex-1 bg-cyan-500 text-slate-950 py-2 rounded-full">{quickLoadingAction ? 'Enviando...' : 'Confirmar'}</button>
                <button onClick={() => setQuickModalOpen(false)} className="flex-1 bg-slate-800 text-slate-200 py-2 rounded-full">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* ── PANEL DOCENTE ─────────────────────────────── */}
        {esProfesor && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Panel Docente</h2>
            {/* Frase motivacional para docentes (más inspiradora) */}
            <div className="mb-4 p-5 rounded-[1.75rem] bg-slate-950/80 border border-white/10 shadow-2xl backdrop-blur-xl">
              <h4 className="text-sm font-semibold text-cyan-300">Frase del día</h4>
              <div className="mt-3 flex items-start gap-4">
                <div className="text-3xl">{quotes[quoteIndex].emoji}</div>
                <div>
                  <p className="text-base font-semibold text-white">{quotes[quoteIndex].title}</p>
                  <p className="text-sm text-slate-300 mt-1">{quotes[quoteIndex].subtitle}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  href: '/dashboard/profesor',
                  icon: Users,
                  gradient: 'from-teal-600 to-teal-400',
                  title: 'Mis Cursos',
                  desc: 'Consulta tus grupos asignados y registra la asistencia de tus aprendices.',
                  cta: 'Ir a mis cursos',
                },
                {
                  href: '/dashboard/programas',
                  icon: BookOpen,
                  gradient: 'from-blue-600 to-blue-400',
                  title: 'Explorar Programas',
                  desc: 'Consulta la oferta académica completa de la institución.',
                  cta: 'Ver programas',
                },
              ].map(({ href, icon: Icon, gradient, title, desc, cta }) => (
                <Link key={href} href={href}
                  className="rounded-[1.75rem] overflow-hidden border border-white/10 shadow-2xl bg-slate-950/80 hover:-translate-y-1 transition-all transform group">
                  <div className={`bg-gradient-to-r ${gradient} p-5`}>
                    <div className="bg-white/10 w-12 h-12 rounded-3xl flex items-center justify-center shadow-inner">
                      <Icon size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-white mb-1">{title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">{desc}</p>
                    <div className="flex items-center gap-1 text-sm font-semibold text-cyan-300 group-hover:gap-2 transition-all">
                      {cta} <ChevronRight size={15} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── PANEL ADMIN ───────────────────────────────── */}
        {isAdmin() && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Administración</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  href: '/dashboard/admin/usuarios',
                  icon: Users,
                  gradient: 'from-orange-500 to-orange-400',
                  title: 'Gestionar Usuarios',
                  desc: 'Ver, editar roles y administrar todos los usuarios registrados en la plataforma.',
                  cta: 'Ir a usuarios',
                },
                {
                  href: '/dashboard/admin/programas',
                  icon: Settings,
                  gradient: 'from-blue-600 to-blue-400',
                  title: 'Gestionar Programas',
                  desc: 'Crear, editar y desactivar programas de formación disponibles.',
                  cta: 'Ir a programas',
                },
              ].map(({ href, icon: Icon, gradient, title, desc, cta }) => (
                <Link key={href} href={href}
                  className="rounded-[1.75rem] overflow-hidden border border-white/10 shadow-2xl bg-slate-950/80 hover:-translate-y-1 transition-all transform group">
                  <div className={`bg-gradient-to-r ${gradient} p-5`}>
                    <div className="bg-white/10 w-12 h-12 rounded-3xl flex items-center justify-center shadow-inner">
                      <Icon size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-white mb-1">{title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">{desc}</p>
                    <div className="flex items-center gap-1 text-sm font-semibold text-cyan-300 group-hover:gap-2 transition-all">
                      {cta} <ChevronRight size={15} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── BANNER IA ─────────────────────────────────── */}
        {isAprendiz() && (
          <div className="bg-gradient-to-r from-purple-700 to-purple-500 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-slate-100/10 p-3 rounded-xl flex-shrink-0">
                <MessageSquare size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">¿Tienes alguna duda?</h3>
                <p className="text-purple-200 text-sm">
                  Nuestro ChatBot con IA responde tus preguntas al instante
                </p>
              </div>
            </div>
            <Link href="/dashboard/chatbot"
              className="w-full sm:w-auto text-center bg-slate-100/10 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-slate-100/20 transition-colors flex items-center justify-center gap-2 text-sm">
              Consultar ahora
              <ChevronRight size={15} />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}