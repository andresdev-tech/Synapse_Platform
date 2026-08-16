'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { profesorAPI } from '../../../../../lib/api';
import {
  ArrowLeft, Users, AlertTriangle, CheckCircle,
  Search, ShieldOff, X, Minus, Plus,
} from 'lucide-react';

interface Aprendiz {
  inscripcion_id: number;
  estado: string;
  total_faltas: number;
  limite_faltas: number;
  suspendido: boolean;
  fecha_inscripcion: string;
  usuario_id: number;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  numero_documento: string;
  tipo_documento: string;
}

export default function GrupoProfesorPage() {
  const { programaId } = useParams();
  const router = useRouter();

  const [grupo, setGrupo]             = useState<Aprendiz[]>([]);
  const [loading, setLoading]         = useState(true);
  const [busqueda, setBusqueda]       = useState('');
  const [seleccionado, setSeleccionado] = useState<Aprendiz | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [mensaje, setMensaje]         = useState('');
  const [tipoMensaje, setTipoMensaje] = useState<'info' | 'success' | 'error'>('info');

  const [nuevasFaltas, setNuevasFaltas] = useState(0);
  const [procesando, setProcesando]     = useState(false);

  useEffect(() => { cargar(); }, [programaId]);

  const cargar = async () => {
    try {
      const res = await profesorAPI.obtenerGrupo(Number(programaId));
      setGrupo(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (texto: string, tipo: 'info' | 'success' | 'error' = 'info') => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setTimeout(() => setMensaje(''), 5000);
  };

  const filtrados = grupo.filter(a =>
    `${a.nombres} ${a.apellidos} ${a.numero_documento} ${a.correo_electronico}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const abrirFaltas = (a: Aprendiz) => {
    setSeleccionado(a);
    setNuevasFaltas(a.total_faltas);
    setModalAbierto(true);
  };

  const guardarFaltas = async () => {
    if (!seleccionado) return;
    setProcesando(true);
    try {
      const res = await profesorAPI.actualizarFaltas(seleccionado.inscripcion_id, nuevasFaltas);
      if (res.data.suspendido && !seleccionado.suspendido) {
        mostrarMensaje(`⚠️ ${seleccionado.nombres} alcanzó el límite de faltas. Se notificó al coordinador por correo.`, 'error');
      } else {
        mostrarMensaje('Asistencia registrada correctamente.', 'success');
      }
      setModalAbierto(false);
      cargar();
    } catch (err: any) {
      mostrarMensaje(err.response?.data?.message || 'Error al actualizar.', 'error');
    } finally {
      setProcesando(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const mensajeClases = {
    info:    'bg-blue-50 border-blue-200 text-blue-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    error:   'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className="bg-gray-50 min-h-screen">

      <div className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4">
        <button onClick={() => router.push('/dashboard/profesor')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
          <ArrowLeft size={18} /> Volver a mis cursos
        </button>
      </div>

      <div className="px-4 sm:px-8 py-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Grupo del Curso</h1>
            <p className="text-gray-500 text-sm mt-1">{filtrados.length} aprendices activos</p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm w-full sm:w-72">
            <Search size={16} className="text-gray-400" />
            <input className="flex-1 text-sm focus:outline-none placeholder-gray-400"
              placeholder="Buscar aprendiz..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
        </div>

        {mensaje && (
          <div className={`mb-4 border rounded-xl px-4 py-3 text-sm flex items-center justify-between ${mensajeClases[tipoMensaje]}`}>
            {mensaje}
            <button onClick={() => setMensaje('')}><X size={14} /></button>
          </div>
        )}

        {filtrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Users size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No hay aprendices inscritos en este curso.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtrados.map((a) => (
              <div key={a.inscripcion_id}
                className={`bg-white rounded-2xl border shadow-sm p-5 ${a.suspendido ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                      ${a.suspendido ? 'bg-red-100 text-red-600' : 'bg-primary-100 text-primary-600'}`}>
                      {a.nombres.charAt(0)}{a.apellidos.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {a.nombres} {a.apellidos}
                        </h3>
                        {a.suspendido && (
                          <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                            <ShieldOff size={11} /> Condicionado
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs truncate">{a.correo_electronico}</p>
                      <p className="text-gray-400 text-xs">{a.tipo_documento} {a.numero_documento}</p>
                    </div>
                  </div>

                  <button onClick={() => abrirFaltas(a)}
                    className="text-center flex-shrink-0 px-4 hover:bg-gray-50 rounded-xl py-1 transition-colors">
                    <div className={`text-2xl font-extrabold ${a.total_faltas >= a.limite_faltas ? 'text-red-600' : 'text-gray-700'}`}>
                      {a.total_faltas}<span className="text-sm text-gray-400">/{a.limite_faltas}</span>
                    </div>
                    <div className="text-xs text-gray-400">Faltas (clic para registrar)</div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL FALTAS */}
      {modalAbierto && seleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Registrar Asistencia</h3>
              <button onClick={() => setModalAbierto(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <p className="text-gray-500 text-sm mb-5">{seleccionado.nombres} {seleccionado.apellidos}</p>
            <div className="flex items-center justify-center gap-4 mb-5">
              <button onClick={() => setNuevasFaltas(Math.max(0, nuevasFaltas - 1))}
                className="w-11 h-11 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors">
                <Minus size={18} className="text-gray-600" />
              </button>
              <input type="number" min={0}
                className={`w-24 text-center text-4xl font-extrabold border-2 rounded-xl py-2 focus:outline-none
                  ${nuevasFaltas >= seleccionado.limite_faltas ? 'border-red-300 text-red-600' : 'border-gray-200 text-gray-800'}`}
                value={nuevasFaltas}
                onChange={e => setNuevasFaltas(Math.max(0, parseInt(e.target.value) || 0))} />
              <button onClick={() => setNuevasFaltas(nuevasFaltas + 1)}
                className="w-11 h-11 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors">
                <Plus size={18} className="text-gray-600" />
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mb-5">
              Límite permitido: <strong>{seleccionado.limite_faltas} faltas</strong>
            </p>
            {nuevasFaltas >= seleccionado.limite_faltas && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-xs text-red-600 flex items-center gap-2">
                <AlertTriangle size={14} className="flex-shrink-0" />
                Al guardar, se notificará automáticamente por correo.
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setModalAbierto(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={guardarFaltas} disabled={procesando} className="btn-primary flex-1">
                {procesando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}