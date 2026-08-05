'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { ClipboardList, Search, Filter, CheckCircle, Clock, XCircle, Award, Download } from 'lucide-react';

interface Inscripcion {
  id: number;
  usuario: string;
  correo_electronico: string;
  programa: string;
  estado: string;
  fecha_inscripcion: string;
}

const estadoConfig: Record<string, { color: string; icon: any; label: string }> = {
  activa:     { color: 'bg-green-100 text-green-700',  icon: CheckCircle, label: 'Activa' },
  pendiente:  { color: 'bg-yellow-100 text-yellow-700',icon: Clock,       label: 'Pendiente' },
  cancelada:  { color: 'bg-red-100 text-red-700',      icon: XCircle,     label: 'Cancelada' },
  completada: { color: 'bg-blue-100 text-blue-700',    icon: Award,       label: 'Completada' },
};

export default function AdminInscripcionesPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [filtradas, setFiltradas] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');

  useEffect(() => {
    if (!isAdmin()) { router.push('/dashboard'); return; }
    api.get('/inscripciones')
      .then(res => { setInscripciones(res.data); setFiltradas(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let res = inscripciones;
    if (estadoFiltro !== 'Todos') res = res.filter(i => i.estado === estadoFiltro.toLowerCase());
    if (busqueda.trim()) {
      const b = busqueda.toLowerCase();
      res = res.filter(i =>
        i.usuario?.toLowerCase().includes(b) ||
        i.programa?.toLowerCase().includes(b) ||
        i.correo_electronico?.toLowerCase().includes(b)
      );
    }
    setFiltradas(res);
  }, [busqueda, estadoFiltro, inscripciones]);

  const exportarCSV = () => {
    const headers = ['ID', 'Usuario', 'Correo', 'Programa', 'Estado', 'Fecha'];
    const rows = filtradas.map(i => [
      i.id, i.usuario, i.correo_electronico, i.programa, i.estado,
      new Date(i.fecha_inscripcion).toLocaleDateString('es-CO')
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'inscripciones_nexus.csv'; a.click();
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Todas las Inscripciones</h1>
          <p className="text-gray-500 text-sm mt-1">{filtradas.length} inscripciones encontradas</p>
        </div>
        <button onClick={exportarCSV}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1 shadow-sm">
          <Search size={16} className="text-gray-400" />
          <input className="flex-1 text-sm focus:outline-none placeholder-gray-400"
            placeholder="Buscar por usuario, correo o programa..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
          <Filter size={16} className="text-gray-400" />
          <select className="text-sm focus:outline-none bg-transparent text-gray-700"
            value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}>
            <option>Todos</option>
            <option>Activa</option>
            <option>Pendiente</option>
            <option>Cancelada</option>
            <option>Completada</option>
          </select>
        </div>
      </div>

      {/* Resumen estados */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(estadoConfig).map(([estado, cfg]) => {
          const Icon = cfg.icon;
          const count = inscripciones.filter(i => i.estado === estado).length;
          return (
            <button key={estado}
              onClick={() => setEstadoFiltro(estadoFiltro === cfg.label ? 'Todos' : cfg.label)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                ${estadoFiltro === cfg.label ? 'border-primary-400 bg-primary-50' : 'border-gray-100 bg-white'}`}>
              <div className={`p-2 rounded-lg ${cfg.color}`}>
                <Icon size={14} />
              </div>
              <div>
                <div className="font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-400">{cfg.label}s</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tabla */}
      {filtradas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <ClipboardList size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No se encontraron inscripciones</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">#</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Usuario</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Programa</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Estado</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtradas.map((ins) => {
                const cfg = estadoConfig[ins.estado] || estadoConfig.pendiente;
                const Icon = cfg.icon;
                return (
                  <tr key={ins.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">{ins.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600 flex-shrink-0">
                          {ins.usuario?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{ins.usuario}</div>
                          <div className="text-gray-400 text-xs">{ins.correo_electronico}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                      <span className="truncate block">{ins.programa}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${cfg.color}`}>
                        <Icon size={11} /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(ins.fecha_inscripcion).toLocaleDateString('es-CO', {
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
  );
}