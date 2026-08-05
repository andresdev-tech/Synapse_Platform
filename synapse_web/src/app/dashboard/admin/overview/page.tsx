'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import Link from 'next/link';
import {
  Users, BookOpen, ClipboardList, TrendingUp,
  CheckCircle, Clock, XCircle, ChevronRight,
  Activity, Award, BarChart2
} from 'lucide-react';

interface Stats {
  totalUsuarios: number;
  totalProgramas: number;
  totalInscripciones: number;
  inscripcionesActivas: number;
  inscripcionesPendientes: number;
  inscripcionesCanceladas: number;
  usuariosPorRol: { rol: string; total: number }[];
  programasMasInscritos: { programa: string; sector: string; total: number }[];
  inscripcionesPorSector: { sector: string; total: number }[];
  ultimasInscripciones: {
    id: number;
    usuario: string;
    programa: string;
    estado: string;
    fecha: string;
  }[];
}

export default function AdminOverviewPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) { router.push('/dashboard'); return; }
    cargarStats();
  }, []);

  const cargarStats = async () => {
    try {
      const [usuariosRes, programasRes, inscripcionesRes] = await Promise.all([
        api.get('/usuarios'),
        api.get('/programas'),
        api.get('/inscripciones'),
      ]);

      const usuarios     = usuariosRes.data;
      const programas    = programasRes.data;
      const inscripciones = inscripcionesRes.data;

      // Usuarios por rol
      const roleCount: Record<string, number> = {};
      usuarios.forEach((u: any) => {
        roleCount[u.rol] = (roleCount[u.rol] || 0) + 1;
      });

      // Programas más inscritos
      const progCount: Record<string, { programa: string; sector: string; total: number }> = {};
      inscripciones.forEach((i: any) => {
        if (!progCount[i.programa]) {
          progCount[i.programa] = { programa: i.programa, sector: '', total: 0 };
        }
        progCount[i.programa].total++;
      });
      const programasMasInscritos = Object.values(progCount)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Inscripciones por sector
      const sectorCount: Record<string, number> = {};
      programas.forEach((p: any) => {
        const total = inscripciones.filter((i: any) => i.programa === p.nombre).length;
        if (total > 0) {
          sectorCount[p.sector] = (sectorCount[p.sector] || 0) + total;
        }
      });

      setStats({
        totalUsuarios:           usuarios.length,
        totalProgramas:          programas.length,
        totalInscripciones:      inscripciones.length,
        inscripcionesActivas:    inscripciones.filter((i: any) => i.estado === 'activa').length,
        inscripcionesPendientes: inscripciones.filter((i: any) => i.estado === 'pendiente').length,
        inscripcionesCanceladas: inscripciones.filter((i: any) => i.estado === 'cancelada').length,
        usuariosPorRol:          Object.entries(roleCount).map(([rol, total]) => ({ rol, total })),
        programasMasInscritos,
        inscripcionesPorSector:  Object.entries(sectorCount)
          .map(([sector, total]) => ({ sector, total }))
          .sort((a, b) => b.total - a.total),
        ultimasInscripciones: inscripciones.slice(0, 8).map((i: any) => ({
          id:       i.id,
          usuario:  i.usuario,
          programa: i.programa,
          estado:   i.estado,
          fecha:    i.fecha_inscripcion,
        })),
      });
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

  if (!stats) return null;

  const estadoConfig: Record<string, { color: string; icon: any; label: string }> = {
    activa:     { color: 'bg-green-100 text-green-700',   icon: CheckCircle, label: 'Activa' },
    pendiente:  { color: 'bg-yellow-100 text-yellow-700', icon: Clock,       label: 'Pendiente' },
    cancelada:  { color: 'bg-red-100 text-red-700',       icon: XCircle,     label: 'Cancelada' },
    completada: { color: 'bg-blue-100 text-blue-700',     icon: Award,       label: 'Completada' },
  };

  const maxInscritos = Math.max(...stats.programasMasInscritos.map(p => p.total), 1);
  const maxSector    = Math.max(...stats.inscripcionesPorSector.map(s => s.total), 1);

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f2d6b] via-[#1a4ab5] to-[#2563eb] px-8 py-8 text-white">
        <div className="flex items-center gap-3 mb-1">
          <Activity size={20} className="text-blue-200" />
          <span className="text-blue-200 text-sm font-medium">Panel de Control</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-1">Dashboard Administrativo</h1>
        <p className="text-blue-100 text-sm">Resumen general de la plataforma SYNAPSE </p>
      </div>

      <div className="px-8 py-8 space-y-8 max-w-7xl">

        {/* ── KPIs PRINCIPALES ─────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Usuarios',       value: stats.totalUsuarios,       icon: Users,         bg: 'bg-blue-50',   color: 'text-blue-600',   border: 'border-blue-100' },
            { label: 'Programas Activos',    value: stats.totalProgramas,      icon: BookOpen,      bg: 'bg-purple-50', color: 'text-purple-600', border: 'border-purple-100' },
            { label: 'Inscripciones',        value: stats.totalInscripciones,  icon: ClipboardList, bg: 'bg-green-50',  color: 'text-green-600',  border: 'border-green-100' },
            { label: 'Tasa de actividad',    value: `${stats.totalInscripciones > 0 ? Math.round((stats.inscripcionesActivas / stats.totalInscripciones) * 100) : 0}%`, icon: TrendingUp, bg: 'bg-orange-50', color: 'text-orange-600', border: 'border-orange-100' },
          ].map(({ label, value, icon: Icon, bg, color, border }) => (
            <div key={label} className={`bg-white rounded-2xl border ${border} shadow-sm p-5`}>
              <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className={color} />
              </div>
              <div className="text-3xl font-extrabold text-gray-900">{value}</div>
              <div className="text-gray-400 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* ── ESTADO DE INSCRIPCIONES ───────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Activas',    value: stats.inscripcionesActivas,    icon: CheckCircle, bg: 'bg-green-500',  light: 'bg-green-50 border-green-100' },
            { label: 'Pendientes', value: stats.inscripcionesPendientes, icon: Clock,       bg: 'bg-yellow-500', light: 'bg-yellow-50 border-yellow-100' },
            { label: 'Canceladas', value: stats.inscripcionesCanceladas, icon: XCircle,     bg: 'bg-red-500',    light: 'bg-red-50 border-red-100' },
          ].map(({ label, value, icon: Icon, bg, light }) => (
            <div key={label} className={`bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4 ${light}`}>
              <div className={`${bg} p-3 rounded-xl`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-gray-500 text-sm">Inscripciones {label}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-lg font-bold text-gray-700">
                  {stats.totalInscripciones > 0
                    ? `${Math.round((value / stats.totalInscripciones) * 100)}%`
                    : '0%'}
                </div>
                <div className="text-xs text-gray-400">del total</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── PROGRAMAS MÁS INSCRITOS ───────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BarChart2 size={18} className="text-primary-600" />
                <h2 className="font-bold text-gray-900">Programas más inscritos</h2>
              </div>
              <Link href="/dashboard/admin/inscripciones"
                className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                Ver todo <ChevronRight size={12} />
              </Link>
            </div>
            {stats.programasMasInscritos.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">Sin datos aún</p>
            ) : (
              <div className="space-y-4">
                {stats.programasMasInscritos.map((p, i) => (
                  <div key={p.programa}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                          {p.programa}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{p.total}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(p.total / maxInscritos) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── USUARIOS POR ROL ──────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Users size={18} className="text-primary-600" />
              <h2 className="font-bold text-gray-900">Usuarios por rol</h2>
            </div>
            <div className="space-y-4">
              {stats.usuariosPorRol.map((r) => {
                const cfg: Record<string, { bg: string; bar: string; icon: string }> = {
                  Administrador: { bg: 'bg-red-50',    bar: 'bg-red-500',    icon: '👑' },
                  Aprendiz:      { bg: 'bg-blue-50',   bar: 'bg-blue-500',   icon: '🎓' },
                  Coordinador:   { bg: 'bg-purple-50', bar: 'bg-purple-500', icon: '📋' },
                };
                const c = cfg[r.rol] || { bg: 'bg-gray-50', bar: 'bg-gray-400', icon: '👤' };
                const pct = Math.round((r.total / stats.totalUsuarios) * 100);
                return (
                  <div key={r.rol} className={`${c.bg} rounded-xl p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{c.icon}</span>
                        <span className="font-semibold text-gray-800 text-sm">{r.rol}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{r.total}</span>
                        <span className="text-gray-400 text-xs ml-1">({pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-white rounded-full h-2">
                      <div className={`${c.bar} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <Link href="/dashboard/admin/usuarios"
                className="flex items-center justify-center gap-2 text-sm text-primary-600 font-semibold hover:text-primary-700">
                Gestionar usuarios <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── INSCRIPCIONES POR SECTOR ──────────────── */}
        {stats.inscripcionesPorSector.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 size={18} className="text-primary-600" />
              <h2 className="font-bold text-gray-900">Inscripciones por sector</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.inscripcionesPorSector.map((s) => {
                const sectorEmoji: Record<string, string> = {
                  'Tecnología':           '💻',
                  'Gestión Empresarial':  '📊',
                  'Turismo y Hotelería':  '🏨',
                  'Comercio y Ventas':    '🛍️',
                  'Industria':            '⚙️',
                  'Salud':                '🏥',
                  'Agropecuario':         '🌱',
                };
                const pct = Math.round((s.total / maxSector) * 100);
                return (
                  <div key={s.sector} className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2">{sectorEmoji[s.sector] || '📚'}</div>
                    <div className="text-2xl font-extrabold text-gray-900">{s.total}</div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-tight">{s.sector}</div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ÚLTIMAS INSCRIPCIONES ─────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <ClipboardList size={18} className="text-primary-600" />
              <h2 className="font-bold text-gray-900">Últimas inscripciones</h2>
            </div>
            <Link href="/dashboard/admin/inscripciones"
              className="text-xs text-primary-600 hover:underline flex items-center gap-1 font-medium">
              Ver todas <ChevronRight size={12} />
            </Link>
          </div>
          {stats.ultimasInscripciones.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Sin inscripciones aún</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs">Usuario</th>
                    <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs">Programa</th>
                    <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs">Estado</th>
                    <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.ultimasInscripciones.map((ins) => {
                    const cfg = estadoConfig[ins.estado] || estadoConfig.pendiente;
                    const Icon = cfg.icon;
                    return (
                      <tr key={ins.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
                              {ins.usuario?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-800 truncate max-w-[150px]">{ins.usuario}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-gray-500 truncate max-w-[180px]">{ins.programa}</td>
                        <td className="py-3 px-3">
                          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full w-fit ${cfg.color}`}>
                            <Icon size={11} /> {cfg.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-400 text-xs">
                          {new Date(ins.fecha).toLocaleDateString('es-CO', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── ACCESOS RÁPIDOS ADMIN ─────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8">
          {[
            { href: '/dashboard/admin/usuarios',      icon: Users,         gradient: 'from-orange-500 to-orange-400', title: 'Gestionar Usuarios',      desc: 'Ver, editar roles y eliminar usuarios' },
            { href: '/dashboard/admin/programas',     icon: BookOpen,      gradient: 'from-blue-600 to-blue-400',     title: 'Gestionar Programas',     desc: 'Crear, editar y desactivar programas' },
            { href: '/dashboard/admin/inscripciones', icon: ClipboardList, gradient: 'from-green-600 to-green-400',   title: 'Ver Inscripciones',       desc: 'Todas las inscripciones del sistema' },
          ].map(({ href, icon: Icon, gradient, title, desc }) => (
            <Link key={href} href={href}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
              <div className={`bg-gradient-to-r ${gradient} p-5`}>
                <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center">
                  <Icon size={20} className="text-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
                <p className="text-gray-400 text-xs">{desc}</p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}