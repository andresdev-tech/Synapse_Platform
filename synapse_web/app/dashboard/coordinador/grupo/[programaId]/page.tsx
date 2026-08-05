'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  AlertCircle, 
  Check, 
  Clock, 
  Users, 
  BarChart3, 
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { gruposAPI } from '@/lib/api';

interface Grupo {
  id: number;
  numero_grupo: number;
  nombre: string;
  capacidad_maxima: number;
  capacidad_actual: number;
  espacios_disponibles: number;
  estado: string;
  total_aprendices: number;
}

interface Inscripcion {
  id: number;
  usuario_id: number;
  nombre_completo: string;
  correo_electronico: string;
  numero_documento: string;
  programa_nombre: string;
  estado: string;
  fecha_inscripcion: string;
  grupo_id: number | null;
}

interface Miembro {
  asignacion_id: number;
  usuario_id: number;
  nombre_completo: string;
  correo_electronico: string;
  numero_documento: string;
  telefono: string;
  estado_usuario: string;
  fecha_asignacion: string;
  estado_inscripcion: string;
}

interface DetallesGrupoEstadisticas {
  porcentajeOcupacion: number;
  totalMiembros: number;
  espaciosDisponibles: number;
  capacidadUtilizada: number;
}

interface Estadisticas {
  total_grupos: number;
  total_aprendices_asignados: number;
  capacidad_total: number;
  grupos_llenos: number;
  grupos_activos: number;
}

interface DetallesGrupo {
  grupo: any;
  miembros: Miembro[];
  totalMiembros: number;
  estadisticas: DetallesGrupoEstadisticas;
}

export default function GestorGruposPage() {
  const params = useParams();
  const programaId = params?.programaId as string;

  // Estados principales
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [asignando, setAsignando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Estados para acción (expulsar / suspender)
  const [accionModalOpen, setAccionModalOpen] = useState(false);
  const [accionUsuario, setAccionUsuario] = useState<{ usuarioId: number; nombre?: string } | null>(null);
  const [accionTipo, setAccionTipo] = useState<'expulsar' | 'suspender'>('expulsar');
  const [accionMotivo, setAccionMotivo] = useState('');
  const [accionLoading, setAccionLoading] = useState(false);
  const [accionSuccess, setAccionSuccess] = useState('');
  const [suspensionDias, setSuspensionDias] = useState<number | null>(7);
  const motivoTemplates = [
    'Incumplimiento de normas del programa',
    'Faltas reiteradas a clases',
    'Comportamiento inapropiado',
    'No entrega de actividades fundamentales'
  ];
  const [lastAction, setLastAction] = useState<null | { tipo: 'expulsar' | 'suspender'; usuarioId: number; grupoId: number; }>(null);
  const [undoLoading, setUndoLoading] = useState(false);

  // Estados para modal de detalles
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<Grupo | null>(null);
  const [detallesGrupo, setDetallesGrupo] = useState<DetallesGrupo | null>(null);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Función para cargar todos los datos
  useEffect(() => {
    cargarDatos();
  }, [programaId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const programaIdNumber = Number(programaId);

      // Cargar grupos
      const gruposRes = await gruposAPI.obtenerGruposPorPrograma(programaIdNumber);
      setGrupos(gruposRes.data);

      // Cargar inscripciones pendientes
      const inscripcionesRes = await gruposAPI.obtenerInscripcionesPendientes(programaIdNumber);
      setInscripciones(inscripcionesRes.data);

      // Cargar estadísticas
      const estadisticasRes = await gruposAPI.obtenerEstadisticas(programaIdNumber);
      setEstadisticas(estadisticasRes.data);

      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar detalles de un grupo específico
  const cargarDetallesGrupo = async (grupo: Grupo) => {
    try {
      setLoadingDetalles(true);

      const detallesRes = await gruposAPI.obtenerInfoCompletaGrupo(grupo.id);

      setGrupoSeleccionado(grupo);
      setDetallesGrupo(detallesRes.data);
      setMostrarModal(true);
    } catch (err: any) {
      console.error('Error cargando detalles del grupo:', err);
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message;
      setError(serverMsg || err.message || 'Error al cargar detalles del grupo');
    } finally {
      setLoadingDetalles(false);
    }
  };

  // Asignar aprendiz a grupo
  const asignarAprendiz = async (inscripcionId: number, grupoId: number) => {
    try {
      setAsignando(true);

      await gruposAPI.asignarAprendiz(inscripcionId, grupoId);

      setExito('¡Asignado correctamente!');
      setTimeout(() => setExito(''), 3000);
      cargarDatos();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al asignar');
    } finally {
      setAsignando(false);
    }
  };

  // Abrir modal para acción (expulsar / suspender)
  const abrirAccionModal = (usuarioId: number, nombre?: string) => {
    setAccionUsuario({ usuarioId, nombre });
    setAccionTipo('expulsar');
    setAccionMotivo('');
    setAccionModalOpen(true);
  };

  const cerrarAccionModal = () => {
    setAccionModalOpen(false);
    setAccionUsuario(null);
    setAccionMotivo('');
  };

  const enviarAccion = async () => {
    if (!accionUsuario) return;
    if (!accionMotivo || accionMotivo.trim().length === 0) {
      setError('Debes indicar el motivo');
      return;
    }

    try {
      setAccionLoading(true);
      // Agregar información adicional en caso de suspensión
      if (accionTipo === 'expulsar') {
        await gruposAPI.expulsarAprendiz(grupoSeleccionado!.id, accionUsuario.usuarioId, accionMotivo);
      } else {
        // enviar motivo + días de suspensión si aplica
        await gruposAPI.suspenderAprendiz(grupoSeleccionado!.id, accionUsuario.usuarioId, accionMotivo);
      }

      const message = accionTipo === 'expulsar' ? 'Aprendiz expulsado correctamente' : `Aprendiz suspendido correctamente${suspensionDias ? ' por ' + suspensionDias + ' días' : ''}`;
      setAccionSuccess(message);
      // Si fue expulsión, ofrecer Deshacer
      if (accionTipo === 'expulsar' && grupoSeleccionado) {
        setLastAction({ tipo: 'expulsar', usuarioId: accionUsuario.usuarioId, grupoId: grupoSeleccionado.id });
        setTimeout(() => setLastAction(null), 8000);
      }
      setTimeout(() => setAccionSuccess(''), 5000);
      cerrarAccionModal();
      await cargarDatos();
      if (grupoSeleccionado) await cargarDetallesGrupo(grupoSeleccionado);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al ejecutar la acción');
    }
    finally {
      setAccionLoading(false);
    }
  };

  // Deshacer expulsión
  const undoExpulsion = async () => {
    if (!lastAction) return;
    try {
      setUndoLoading(true);
      await gruposAPI.revertExpulsion(lastAction.grupoId, lastAction.usuarioId);
      setLastAction(null);
      await cargarDatos();
      if (grupoSeleccionado) await cargarDetallesGrupo(grupoSeleccionado);
      setExito('Expulsión revertida con éxito');
      setTimeout(() => setExito(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al revertir expulsión');
    } finally {
      setUndoLoading(false);
    }
  };

  // Cerrar modal
  const cerrarModal = () => {
    setMostrarModal(false);
    setGrupoSeleccionado(null);
    setDetallesGrupo(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4 mx-auto"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestor de Grupos</h1>
        <p className="text-gray-600 mb-8">Asigna y gestiona aprendices en los grupos del programa</p>

        {/* MENSAJES DE ERROR Y ÉXITO */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {exito && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <Check className="text-green-600 flex-shrink-0" size={20} />
            <p className="text-green-800">{exito}</p>
          </div>
        )}

        {/* ESTADÍSTICAS */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <p className="text-gray-600 text-sm font-medium">Total Grupos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{estadisticas.total_grupos}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <p className="text-gray-600 text-sm font-medium">Asignados</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{estadisticas.total_aprendices_asignados}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <p className="text-gray-600 text-sm font-medium">Capacidad Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{estadisticas.capacidad_total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
              <p className="text-gray-600 text-sm font-medium">Grupos Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{estadisticas.grupos_activos}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <p className="text-gray-600 text-sm font-medium">Grupos Llenos</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{estadisticas.grupos_llenos}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMNA IZQUIERDA - GRUPOS */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users size={24} className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Grupos Disponibles</h2>
              <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                {grupos.length}
              </span>
            </div>

            <div className="space-y-3">
              {grupos.length === 0 ? (
                <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-600">
                  No hay grupos disponibles
                </div>
              ) : (
                grupos.map(grupo => {
                  const porcentajeOcupacion = (grupo.capacidad_actual / grupo.capacidad_maxima) * 100;
                  return (
                    <div 
                      key={grupo.id} 
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                      onClick={() => cargarDetallesGrupo(grupo)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900">Grupo {grupo.numero_grupo}</h3>
                        <Eye size={18} className="text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{grupo.nombre}</p>
                      
                      {/* BARRA DE OCUPACIÓN */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-700">
                            {grupo.capacidad_actual}/{grupo.capacidad_maxima}
                          </span>
                          <span className="text-xs font-medium text-gray-500">
                            {Math.round(porcentajeOcupacion)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full transition-all ${
                              grupo.estado === 'lleno' ? 'bg-red-500' : 
                              porcentajeOcupacion > 75 ? 'bg-yellow-500' : 
                              'bg-blue-500'
                            }`}
                            style={{ width: `${porcentajeOcupacion}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* ESTADO */}
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          grupo.estado === 'lleno' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {grupo.estado === 'lleno' ? '🔴 Lleno' : '🟢 Activo'}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {grupo.espacios_disponibles} espacios
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA - PENDIENTES */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={24} className="text-yellow-600" />
              <h2 className="text-2xl font-bold text-gray-900">Pendientes de Asignar</h2>
              <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full">
                {inscripciones.length}
              </span>
            </div>

            {inscripciones.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                <Check size={48} className="mx-auto text-green-600 mb-3" />
                <p className="text-green-800 font-semibold">¡Todos los aprendices están asignados!</p>
                <p className="text-green-700 text-sm mt-1">No hay inscripciones pendientes</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {inscripciones.map(inscripcion => (
                  <div 
                    key={inscripcion.id} 
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="mb-3">
                      <h3 className="font-bold text-gray-900">{inscripcion.nombre_completo}</h3>
                      <p className="text-sm text-gray-600">{inscripcion.correo_electronico}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Doc: {inscripcion.numero_documento}
                      </p>
                    </div>

                    {/* BOTONES DE ASIGNACIÓN */}
                    <div className="grid grid-cols-2 gap-2">
                      {grupos
                        .filter(g => g.estado !== 'lleno')
                        .slice(0, 4)
                        .map(grupo => (
                          <button
                            key={grupo.id}
                            onClick={() => asignarAprendiz(inscripcion.id, grupo.id)}
                            disabled={asignando}
                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-xs rounded font-semibold transition flex items-center justify-center gap-1"
                          >
                            <ArrowRight size={14} />
                            Gr. {grupo.numero_grupo}
                          </button>
                        ))}
                    </div>

                    {grupos.filter(g => g.estado !== 'lleno').length > 4 && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        +{grupos.filter(g => g.estado !== 'lleno').length - 4} grupos más
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE DETALLES DEL GRUPO */}
      {mostrarModal && grupoSeleccionado && detallesGrupo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* HEADER */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold">Grupo {grupoSeleccionado.numero_grupo}</h3>
                <p className="text-blue-100 mt-1">{grupoSeleccionado.nombre}</p>
              </div>
              <button
                onClick={cerrarModal}
                className="text-white hover:bg-blue-800 p-2 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* CONTENIDO */}
            <div className="p-6">
              {loadingDetalles ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
                  <p className="text-gray-600">Cargando detalles...</p>
                </div>
              ) : (
                <>
                  {/* ESTADÍSTICAS DEL GRUPO */}
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-600 font-semibold">Ocupación</p>
                      <p className="text-xl font-bold text-blue-900">{detallesGrupo.estadisticas.porcentajeOcupacion}%</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-green-600 font-semibold">Miembros</p>
                      <p className="text-xl font-bold text-green-900">{detallesGrupo.estadisticas.totalMiembros}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-xs text-yellow-600 font-semibold">Espacios</p>
                      <p className="text-xl font-bold text-yellow-900">{detallesGrupo.estadisticas.espaciosDisponibles}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs text-purple-600 font-semibold">Capacidad</p>
                      <p className="text-xl font-bold text-purple-900">{detallesGrupo.estadisticas.capacidadUtilizada}</p>
                    </div>
                  </div>

                  {/* LISTA DE MIEMBROS */}
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Miembros del Grupo</h4>
                  
                  {detallesGrupo.miembros.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
                      Este grupo no tiene miembros asignados aún
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {detallesGrupo.miembros.map((miembro, idx) => (
                        <div key={miembro.asignacion_id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {idx + 1}. {miembro.nombre_completo}
                              </p>
                              <p className="text-sm text-gray-600">{miembro.correo_electronico}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Doc: {miembro.numero_documento}
                                {miembro.telefono && ` • Tel: ${miembro.telefono}`}
                              </p>
                              {miembro.fecha_asignacion && (
                                <p className="text-xs text-gray-400 mt-2">
                                  Asignado: {new Date(miembro.fecha_asignacion).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); abrirAccionModal(miembro.usuario_id, miembro.nombre_completo); }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
                                title="Acciones (expulsar/suspender)"
                              >
                                <Trash2 size={18} />
                              </button>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                              miembro.estado_usuario === 'activo'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {miembro.estado_usuario}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                              miembro.estado_inscripcion === 'activa'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {miembro.estado_inscripcion}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* BOTÓN CERRAR */}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={cerrarModal}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition"
                    >
                      Cerrar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* MODAL DE ACCIÓN: expulsar / suspender */}
      {accionModalOpen && accionUsuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6" role="dialog" aria-modal="true">
            <h3 className="text-xl font-bold mb-2">Acción sobre aprendiz</h3>
            <p className="text-sm text-gray-600 mb-4">{accionUsuario.nombre}</p>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setAccionTipo('expulsar')}
                className={`flex-1 py-2 rounded ${accionTipo === 'expulsar' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800'}`}
              >
                Expulsar
              </button>
              <button
                onClick={() => setAccionTipo('suspender')}
                className={`flex-1 py-2 rounded ${accionTipo === 'suspender' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-800'}`}
              >
                Suspender
              </button>
            </div>

            <div className="mb-3 flex gap-2 items-center">
              <label className="block text-sm font-medium text-gray-700">Motivo</label>
              <div className="text-xs text-gray-400">(elige plantilla o escribe uno)</div>
            </div>

            <div className="flex gap-2 mb-3">
              {motivoTemplates.map((t) => (
                <button
                  key={t}
                  onClick={() => setAccionMotivo(t)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  {t.split(' ').slice(0,3).join(' ')}...
                </button>
              ))}
            </div>

            <textarea
              id="accion-motivo"
              value={accionMotivo}
              onChange={(e) => setAccionMotivo(e.target.value)}
              rows={4}
              className="w-full border border-gray-200 rounded p-2 mb-2"
              placeholder="Describe el motivo que se enviará por correo"
              autoFocus
            />

            {accionTipo === 'suspender' && (
              <div className="mb-4 flex items-center gap-3">
                <label className="text-sm text-gray-700">Duración (días)</label>
                <input
                  type="number"
                  min={1}
                  value={suspensionDias ?? ''}
                  onChange={(e) => setSuspensionDias(e.target.value ? Number(e.target.value) : null)}
                  className="w-24 border border-gray-200 rounded p-2"
                />
                <div className="text-xs text-gray-400">Opcional: especifica por cuánto tiempo</div>
              </div>
            )}

            {/* Vista previa del correo */}
            <div className="mb-4 p-3 border border-gray-100 rounded bg-gray-50">
              <p className="text-xs text-gray-500 mb-2">Vista previa del correo</p>
              <div className="bg-white border border-gray-100 rounded p-3">
                <p className="text-sm font-semibold mb-1">Asunto: {accionTipo === 'expulsar' ? `Has sido expulsado del grupo ${grupoSeleccionado?.numero_grupo}` : `Has sido suspendido del grupo ${grupoSeleccionado?.numero_grupo}`}</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{`Hola ${accionUsuario?.nombre || ''},\n\nHas sido ${accionTipo === 'expulsar' ? 'expulsado' : 'suspendido'} del grupo ${grupoSeleccionado?.numero_grupo} (${grupoSeleccionado?.nombre}) por el siguiente motivo:\n\n${accionMotivo || '(sin motivo)' }${accionTipo === 'suspender' && suspensionDias ? '\n\nDuración: ' + suspensionDias + ' días' : ''}\n\nSi crees que esto es un error, contacta al coordinador.`}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={enviarAccion}
                disabled={accionLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded flex items-center justify-center gap-2"
              >
                {accionLoading ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                ) : 'Confirmar'}
              </button>
              <button
                onClick={cerrarAccionModal}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}