'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { programasAPI } from '../../../../lib/api';
import { useAuth } from '../../../../lib/AuthContext';
import { BookOpen, Clock, MapPin, Monitor, ArrowLeft, CheckCircle, FileText, Calendar, Tag, ChevronRight, Users } from 'lucide-react';

interface Horario {
  id: number;
  modalidad: string;
  jornada: string;
  horarios: Record<string, string>;
}
interface Programa {
  id: number;
  nombre: string;
  sector: string;
  descripcion: string;
  horarios: Horario[];
}

const diasNombres: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
};

const requisitos = [
  'Ser colombiano o extranjero con documento válido',
  'Tener mínimo 14 años de edad',
  'Haber cursado mínimo 9° grado de bachillerato (para técnicos)',
  'Haber cursado mínimo 11° grado de bachillerato (para tecnólogos)',
  'No tener matrícula activa en otro programa SENA',
  'Presentarse con documento de identidad original',
];

const documentosRequeridos = [
  'Fotocopia del documento de identidad (ampliada al 150%)',
  'Fotocopia del último diploma o constancia de estudio',
  'Foto tipo documento fondo blanco (2x2)',
];

export default function DetallePrograma() {
  const { id } = useParams();
  const router = useRouter();
  const { isAprendiz, isAdmin, usuario } = useAuth();
  const [programa, setPrograma] = useState<Programa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    programasAPI.obtener(Number(id))
      .then(res => {
        const data = res.data;
        if (data.horarios && Array.isArray(data.horarios)) {
          data.horarios = data.horarios.map((h: any) => ({
            ...h,
            horarios: typeof h.horarios === 'string' ? JSON.parse(h.horarios) : (h.horarios || {}),
          }));
        } else {
          data.horarios = [];
        }
        setPrograma(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  if (!programa) return (
    <div className="p-8 text-center">
      <p className="text-gray-500">Programa no encontrado.</p>
      <button onClick={() => router.back()} className="btn-primary mt-4">Volver</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra superior */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => router.push('/dashboard/programas')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          <ArrowLeft size={18} /> Volver a programas
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Hero del programa */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-500 rounded-2xl p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <BookOpen size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight mb-2">{programa.nombre}</h1>
              <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
                {programa.sector}
              </span>
            </div>
          </div>
        </div>

        {/* Descripción */}
        {programa.descripcion && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={16} className="text-primary-600" />
              <h2 className="font-semibold text-gray-800">Descripción del programa</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">{programa.descripcion}</p>
          </div>
        )}

        {/* Horarios */}
        {programa.horarios?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-primary-600" />
              <h2 className="font-semibold text-gray-800">Horarios disponibles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programa.horarios.map((h) => (
                <div key={h.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {h.modalidad !== 'Presencial'
                        ? <Monitor size={15} className="text-primary-600" />
                        : <MapPin size={15} className="text-primary-600" />}
                      <span className="font-semibold text-sm text-gray-800">{h.modalidad}</span>
                    </div>
                    <span className="text-xs bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full font-medium">
                      {h.jornada}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {Object.entries(h.horarios).map(([dia, hora]) => (
                      <div key={dia} className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 w-24">{diasNombres[dia] || dia}</span>
                        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1">
                          <Clock size={11} className="text-primary-500" />
                          <span className="text-xs font-semibold text-gray-700">{hora}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requisitos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-primary-600" />
            <h2 className="font-semibold text-gray-800">Requisitos de ingreso</h2>
          </div>
          <ul className="space-y-2">
            {requisitos.map((req, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Documentos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-primary-600" />
            <h2 className="font-semibold text-gray-800">Documentos requeridos</h2>
          </div>
          <ul className="space-y-2">
            {documentosRequeridos.map((doc, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-600">{i + 1}</span>
                </div>
                {doc}
              </li>
            ))}
          </ul>
        </div>

        {/* Botón inscribirse — solo Aprendiz */}
        {isAprendiz() && (
          <button
            onClick={() => router.push(`/dashboard/programas/${programa.id}/inscribirse`)}
            className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 shadow-lg rounded-xl"
          >
            Inscribirme a este programa
            <ChevronRight size={18} />
          </button>
        )}

        {/* Coordinador: acceso al grupo del programa */}
        {usuario?.rol === 'Coordinador' && (
          <button
            onClick={() => router.push(`/dashboard/coordinador/grupo/${programa.id}`)}
            className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 shadow-lg rounded-xl"
          >
            <Users size={18} />
            Ver grupo de este programa
          </button>
        )}

        {/* Admin: solo informativo */}
        {isAdmin() && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-sm text-gray-500">
            Como administrador, gestiona este programa desde el Panel Admin.
          </div>
        )}
      </div>
    </div>
  );
}