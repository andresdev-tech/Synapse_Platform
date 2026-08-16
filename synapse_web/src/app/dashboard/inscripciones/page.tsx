'use client';
import { useEffect, useState } from 'react';
import { inscripcionesAPI } from '../../../lib/api';
import { ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react';
import FeedbackModal from '../../../components/FeedbackModal';

interface Inscripcion {
  id: number;
  estado: string;
  fecha_inscripcion: string;
  programa: string;
  sector: string;
  descripcion: string;
}

const estadoConfig: Record<string, { color: string; icon: any; label: string }> = {
  pendiente:  { color: 'bg-yellow-100 text-yellow-700', icon: Clock,         label: 'Pendiente' },
  activa:     { color: 'bg-green-100 text-green-700',   icon: CheckCircle,   label: 'Activa' },
  cancelada:  { color: 'bg-red-100 text-red-700',       icon: XCircle,       label: 'Cancelada' },
  completada: { color: 'bg-blue-100 text-blue-700',     icon: CheckCircle,   label: 'Completada' },
};

export default function InscripcionesPage() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState<number | null>(null);

  // Estado para el modal de feedback
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'alert' | 'confirm' | 'success';
    action?: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'alert' });

  const cargar = async () => {
    try {
      const res = await inscripcionesAPI.misInscripciones();
      setInscripciones(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const openAlert = (title: string, message: string) => {
    setModalState({ isOpen: true, title, message, type: 'alert' });
  };

  const openSuccess = (title: string, message: string) => {
    setModalState({ isOpen: true, title, message, type: 'success' });
  };

  const openConfirm = (title: string, message: string, action: () => void) => {
    setModalState({ isOpen: true, title, message, type: 'confirm', action });
  };

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  const cancelar = (id: number) => {
    openConfirm('Cancelar Inscripción', '¿Deseas cancelar esta inscripción?', async () => {
      closeModal();
      setCancelando(id);
      try {
        await inscripcionesAPI.cancelar(id);
        cargar();
        openSuccess('Cancelada', 'Inscripción cancelada correctamente.');
      } catch (err: any) {
        openAlert('Error al cancelar', err.response?.data?.message || 'Hubo un problema al cancelar.');
      } finally {
        setCancelando(null);
      }
    });
  };

  if (loading) return <div className="p-4 sm:p-6 lg:p-8 text-gray-500">Cargando inscripciones...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 relative">
      <FeedbackModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={() => {
          if (modalState.type === 'confirm' && modalState.action) {
            modalState.action();
          } else {
            closeModal();
          }
        }}
        onCancel={closeModal}
      />

      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Mis Inscripciones</h1>
      <p className="text-gray-500 mb-6">Programas en los que estás inscrito</p>

      {inscripciones.length === 0 ? (
        <div className="card text-center py-12">
          <ClipboardList size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tienes inscripciones aún.</p>
          <a href="/dashboard/programas" className="btn-primary mt-4 inline-block">
            Ver programas disponibles
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {inscripciones.map((inscripcion) => {
            const cfg = estadoConfig[inscripcion.estado] || estadoConfig.pendiente;
            const Icon = cfg.icon;
            return (
              <div key={inscripcion.id} className="card">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{inscripcion.programa}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {inscripcion.sector}
                    </span>
                    {inscripcion.descripcion && (
                      <p className="text-gray-500 text-sm mt-2 line-clamp-2">{inscripcion.descripcion}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Inscrito el {new Date(inscripcion.fecha_inscripcion).toLocaleDateString('es-CO', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-3 sm:ml-4">
                    <span className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${cfg.color}`}>
                      <Icon size={12} />
                      {cfg.label}
                    </span>
                    {inscripcion.estado === 'pendiente' || inscripcion.estado === 'activa' ? (
                      <button
                        onClick={() => cancelar(inscripcion.id)}
                        disabled={cancelando === inscripcion.id}
                        className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                      >
                        {cancelando === inscripcion.id ? 'Cancelando...' : 'Cancelar inscripción'}
                      </button>
                    ) : null}
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
