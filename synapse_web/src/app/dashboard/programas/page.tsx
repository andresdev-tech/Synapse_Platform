'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { programasAPI, inscripcionesAPI } from '../../../lib/api';
import { useAuth } from '../../../lib/AuthContext';
import { BookOpen, Clock, CheckCircle, Search, Filter, ChevronRight } from 'lucide-react';

interface Programa {
  id: number;
  nombre: string;
  sector: string;
  descripcion: string;
  horarios: any[];
}

const sectorColores: Record<string, string> = {
  'Tecnología':          'bg-blue-100 text-blue-700',
  'Gestión Empresarial': 'bg-purple-100 text-purple-700',
  'Turismo y Hotelería': 'bg-orange-100 text-orange-700',
  'Comercio y Ventas':   'bg-green-100 text-green-700',
  'Industria':           'bg-gray-100 text-gray-700',
  'Salud':               'bg-red-100 text-red-700',
  'Agropecuario':        'bg-lime-100 text-lime-700',
};

export default function ProgramasPage() {
  const router = useRouter();
  const { isAprendiz } = useAuth();
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [filtrados, setFiltrados] = useState<Programa[]>([]);
  const [inscritos, setInscritos] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [sectorFiltro, setSectorFiltro] = useState('Todos');

  useEffect(() => {
    const cargar = async () => {
      try {
        const [progRes, inscRes] = await Promise.all([
          programasAPI.listar(),
          isAprendiz() ? inscripcionesAPI.misInscripciones() : Promise.resolve({ data: [] }),
        ]);
        setProgramas(progRes.data);
        setFiltrados(progRes.data);
        setInscritos(inscRes.data.map((i: any) => i.programa_id ?? i.id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    let resultado = programas;
    if (sectorFiltro !== 'Todos') resultado = resultado.filter(p => p.sector === sectorFiltro);
    if (busqueda.trim()) {
      const b = busqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(b) || p.sector?.toLowerCase().includes(b)
      );
    }
    setFiltrados(resultado);
  }, [busqueda, sectorFiltro, programas]);

  const sectores = ['Todos', ...Array.from(new Set(programas.map(p => p.sector).filter(Boolean)))];

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500">Cargando programas...</p>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Programas de Formación</h1>
        <p className="text-gray-500 mt-1">{programas.length} programas disponibles · Haz clic en un programa para ver detalles e inscribirte</p>
      </div>

      {/* Buscador + Filtro */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1 shadow-sm">
          <Search size={16} className="text-gray-400" />
          <input
            className="flex-1 text-sm focus:outline-none placeholder-gray-400"
            placeholder="Buscar programa..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
          <Filter size={16} className="text-gray-400" />
          <select
            className="text-sm focus:outline-none bg-transparent text-gray-700 pr-2"
            value={sectorFiltro}
            onChange={(e) => setSectorFiltro(e.target.value)}
          >
            {sectores.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Grid de programas */}
      {filtrados.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No se encontraron programas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((programa) => {
            const yaInscrito = inscritos.includes(programa.id);
            const colorSector = sectorColores[programa.sector] || 'bg-gray-100 text-gray-600';
            const totalHorarios = programa.horarios?.length || 0;

            return (
              <div
                key={programa.id}
                onClick={() => router.push(`/dashboard/programas/${programa.id}`)}
                className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group
                  ${yaInscrito ? 'border-green-200 hover:border-green-300' : 'border-gray-100 hover:border-primary-200'}`}
              >
                <div className="p-5">
                  {/* Encabezado */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 transition-colors
                      ${yaInscrito ? 'bg-green-100' : 'bg-primary-50 group-hover:bg-primary-100'}`}>
                      <BookOpen size={20} className={yaInscrito ? 'text-green-600' : 'text-primary-600'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1.5">
                        {programa.nombre}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorSector}`}>
                        {programa.sector}
                      </span>
                    </div>
                    {yaInscrito && <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />}
                  </div>

                  {/* Descripción corta */}
                  {programa.descripcion && (
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
                      {programa.descripcion}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={12} />
                      <span>{totalHorarios} horario{totalHorarios !== 1 ? 's' : ''}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold transition-colors
                      ${yaInscrito ? 'text-green-600' : 'text-primary-600 group-hover:text-primary-700'}`}>
                      {yaInscrito ? 'Ver detalles' : 'Ver e inscribirme'}
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}