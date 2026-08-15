'use client';
import { useEffect, useState } from 'react';
import { programasAPI, usuariosAPI } from '../../../../lib/api';
import { useAuth } from '../../../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, BookOpen, X, AlertTriangle, Users } from 'lucide-react';
import FeedbackModal from '../../../../components/FeedbackModal';

interface Programa {
  id: number;
  nombre: string;
  sector: string;
  activo: boolean;
  descripcion: string;
}

interface UsuarioAsignable {
  id: number;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  rol: string;
}

interface Asignacion {
  asignacion_id: number;
  id: number;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
}

const SECTORES = ['Tecnología', 'Gestión Empresarial', 'Arte y Diseño', 'Salud', 'Industria', 'Agropecuario', 'Turismo y Hotelería', 'Comercio y Ventas'];

export default function AdminProgramasPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [programas, setProgramas]       = useState<Programa[]>([]);
  const [loading, setLoading]           = useState(true);
  const [modal, setModal]               = useState<'crear' | 'editar' | null>(null);
  const [modalEliminar, setModalEliminar] = useState<Programa | null>(null);
  const [editandoId, setEditandoId]     = useState<number | null>(null);
  const [guardando, setGuardando]       = useState(false);
  const [eliminando, setEliminando]     = useState(false);
  const [mensaje, setMensaje]           = useState('');
  const [form, setForm] = useState({
    nombre: '', sector: '', descripcion: '',
    modalidad: 'Presencial', jornada: 'Mañana',
  });

  // ── Asignación de coordinadores/profesores ──────────────────
  const [modalAsignar, setModalAsignar]       = useState<Programa | null>(null);
  const [coordinadores, setCoordinadores]     = useState<Asignacion[]>([]);
  const [profesores, setProfesores]           = useState<Asignacion[]>([]);
  const [candidatosCoord, setCandidatosCoord] = useState<UsuarioAsignable[]>([]);
  const [candidatosProf, setCandidatosProf]   = useState<UsuarioAsignable[]>([]);
  const [seleccionCoord, setSeleccionCoord]   = useState('');
  const [seleccionProf, setSeleccionProf]     = useState('');
  const [asignando, setAsignando]             = useState(false);

  // Estado para el modal de feedback
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'alert' | 'confirm' | 'success';
    action?: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'alert' });

  const openAlert = (title: string, message: string) => {
    setModalState({ isOpen: true, title, message, type: 'alert' });
  };

  const openSuccess = (title: string, message: string) => {
    setModalState({ isOpen: true, title, message, type: 'success' });
  };

  const closeModalFeedback = () => setModalState(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    if (!isAdmin()) { router.push('/dashboard'); return; }
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const res = await programasAPI.listar();
      setProgramas(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  const resetForm = () => setForm({ nombre: '', sector: '', descripcion: '', modalidad: 'Presencial', jornada: 'Mañana' });

  const abrirCrear = () => { resetForm(); setModal('crear'); };
  const abrirEditar = (p: Programa) => {
    setForm({ nombre: p.nombre, sector: p.sector || '', descripcion: p.descripcion || '', modalidad: 'Presencial', jornada: 'Mañana' });
    setEditandoId(p.id);
    setModal('editar');
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (modal === 'crear') {
        await programasAPI.crear({
          nombre: form.nombre, sector: form.sector, descripcion: form.descripcion,
          horarios: [{ modalidad: form.modalidad, jornada: form.jornada, horarios: {} }],
        });
        setMensaje('Programa creado exitosamente.');
      } else if (modal === 'editar' && editandoId) {
        await programasAPI.actualizar(editandoId, { nombre: form.nombre, sector: form.sector, descripcion: form.descripcion });
        setMensaje('Programa actualizado.');
      }
      setModal(null);
      cargar();
      setTimeout(() => setMensaje(''), 3000);
    } catch (err: any) {
      openAlert('Error de guardado', err.response?.data?.message || 'Error al guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!modalEliminar) return;
    setEliminando(true);
    try {
      await programasAPI.eliminar(modalEliminar.id);
      setMensaje('Programa eliminado correctamente.');
      setModalEliminar(null);
      cargar();
      setTimeout(() => setMensaje(''), 3000);
    } catch {
      setMensaje('Error al eliminar.');
    } finally {
      setEliminando(false);
    }
  };

  const abrirAsignar = async (p: Programa) => {
    setModalAsignar(p);
    setSeleccionCoord('');
    setSeleccionProf('');
    try {
      const [coordRes, profRes, usuariosRes] = await Promise.all([
        programasAPI.listarCoordinadores(p.id),
        programasAPI.listarProfesores(p.id),
        usuariosAPI.listarUsuarios(),
      ]);
      setCoordinadores(coordRes.data);
      setProfesores(profRes.data);
      setCandidatosCoord(usuariosRes.data.filter((u: UsuarioAsignable) => u.rol === 'Coordinador'));
      setCandidatosProf(usuariosRes.data.filter((u: UsuarioAsignable) => u.rol === 'Profesor'));
    } catch {
      setMensaje('Error al cargar las asignaciones.');
    }
  };

  const recargarAsignaciones = async (programaId: number) => {
    const [coordRes, profRes] = await Promise.all([
      programasAPI.listarCoordinadores(programaId),
      programasAPI.listarProfesores(programaId),
    ]);
    setCoordinadores(coordRes.data);
    setProfesores(profRes.data);
  };

  const asignarCoordinador = async () => {
    if (!modalAsignar || !seleccionCoord) return;
    setAsignando(true);
    try {
      await programasAPI.asignarCoordinador(modalAsignar.id, Number(seleccionCoord));
      setSeleccionCoord('');
      await recargarAsignaciones(modalAsignar.id);
    } catch (err: any) {
      openAlert('Error al asignar', err.response?.data?.message || 'Error al asignar coordinador.');
    } finally {
      setAsignando(false);
    }
  };

  const quitarCoordinador = async (usuarioId: number) => {
    if (!modalAsignar) return;
    try {
      await programasAPI.quitarCoordinador(modalAsignar.id, usuarioId);
      await recargarAsignaciones(modalAsignar.id);
    } catch {
      openAlert('Error al quitar', 'Error al quitar el coordinador.');
    }
  };

  const asignarProfesor = async () => {
    if (!modalAsignar || !seleccionProf) return;
    setAsignando(true);
    try {
      await programasAPI.asignarProfesor(modalAsignar.id, Number(seleccionProf));
      setSeleccionProf('');
      await recargarAsignaciones(modalAsignar.id);
    } catch (err: any) {
      openAlert('Error al asignar', err.response?.data?.message || 'Error al asignar profesor.');
    } finally {
      setAsignando(false);
    }
  };

  const quitarProfesor = async (usuarioId: number) => {
    if (!modalAsignar) return;
    try {
      await programasAPI.quitarProfesor(modalAsignar.id, usuarioId);
      await recargarAsignaciones(modalAsignar.id);
    } catch {
      openAlert('Error al quitar', 'Error al quitar el profesor.');
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 relative">
      <FeedbackModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={() => {
          if (modalState.type === 'confirm' && modalState.action) {
            modalState.action();
          } else {
            closeModalFeedback();
          }
        }}
        onCancel={closeModalFeedback}
      />

      {/* ── MODAL ELIMINAR ─────────────────────────── */}
      {modalEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={22} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Eliminar programa</h3>
                <p className="text-gray-500 text-sm">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm bg-gray-50 rounded-xl p-4 mb-6">
              ¿Estás seguro de que deseas eliminar el programa{' '}
              <strong className="text-gray-900">"{modalEliminar.nombre}"</strong>?
              Los usuarios inscritos perderán acceso a este programa.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalEliminar(null)}
                className="btn-secondary flex-1"
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                disabled={eliminando}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {eliminando ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Eliminando...</>
                ) : (
                  <><Trash2 size={15} /> Sí, eliminar</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CREAR/EDITAR ─────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {modal === 'crear' ? 'Nuevo Programa' : 'Editar Programa'}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={guardar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input className="input-field" required value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                <select className="input-field" value={form.sector}
                  onChange={e => setForm({ ...form, sector: e.target.value })}>
                  <option value="">Seleccionar sector</option>
                  {SECTORES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea className="input-field resize-none" rows={3} value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })} />
              </div>
              {modal === 'crear' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
                    <select className="input-field" value={form.modalidad}
                      onChange={e => setForm({ ...form, modalidad: e.target.value })}>
                      <option>Presencial</option><option>Virtual</option><option>Mixto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jornada</label>
                    <select className="input-field" value={form.jornada}
                      onChange={e => setForm({ ...form, jornada: e.target.value })}>
                      <option>Mañana</option><option>Tarde</option><option>Noche</option><option>Fines de semana</option>
                    </select>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={guardando} className="btn-primary flex-1">
                  {guardando ? 'Guardando...' : modal === 'crear' ? 'Crear Programa' : 'Guardar Cambios'}
                </button>
                <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL ASIGNAR COORDINADORES/PROFESORES ─── */}
      {modalAsignar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Asignar responsables</h2>
                <p className="text-gray-500 text-sm">{modalAsignar.nombre}</p>
              </div>
              <button onClick={() => setModalAsignar(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            {/* Coordinadores */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Coordinadores</h3>
              <div className="space-y-2 mb-3">
                {coordinadores.length === 0 && (
                  <p className="text-xs text-gray-400">Sin coordinadores asignados todavía.</p>
                )}
                {coordinadores.map((c) => (
                  <div key={c.asignacion_id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-700">{c.nombres} {c.apellidos}</span>
                    <button onClick={() => quitarCoordinador(c.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <select className="input-field flex-1" value={seleccionCoord}
                  onChange={e => setSeleccionCoord(e.target.value)}>
                  <option value="">Seleccionar coordinador...</option>
                  {candidatosCoord
                    .filter(u => !coordinadores.some(c => c.id === u.id))
                    .map(u => (
                      <option key={u.id} value={u.id}>{u.nombres} {u.apellidos}</option>
                    ))}
                </select>
                <button onClick={asignarCoordinador} disabled={!seleccionCoord || asignando}
                  className="btn-primary px-4 text-sm">Agregar</button>
              </div>
            </div>

            {/* Profesores */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Profesores</h3>
              <div className="space-y-2 mb-3">
                {profesores.length === 0 && (
                  <p className="text-xs text-gray-400">Sin profesores asignados todavía.</p>
                )}
                {profesores.map((pr) => (
                  <div key={pr.asignacion_id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-700">{pr.nombres} {pr.apellidos}</span>
                    <button onClick={() => quitarProfesor(pr.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <select className="input-field flex-1" value={seleccionProf}
                  onChange={e => setSeleccionProf(e.target.value)}>
                  <option value="">Seleccionar profesor...</option>
                  {candidatosProf
                    .filter(u => !profesores.some(pr => pr.id === u.id))
                    .map(u => (
                      <option key={u.id} value={u.id}>{u.nombres} {u.apellidos}</option>
                    ))}
                </select>
                <button onClick={asignarProfesor} disabled={!seleccionProf || asignando}
                  className="btn-primary px-4 text-sm">Agregar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CABECERA ───────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Programas</h1>
          <p className="text-gray-500 text-sm mt-1">{programas.length} programas registrados</p>
        </div>
        <button onClick={abrirCrear} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nuevo Programa
        </button>
      </div>

      {mensaje && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-between
          ${mensaje.includes('Error') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
          {mensaje}
          <button onClick={() => setMensaje('')}><X size={14} /></button>
        </div>
      )}

      {/* ── GRID PROGRAMAS ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programas.map((p) => (
          <div key={p.id} className={`bg-white rounded-xl border shadow-sm p-5 ${!p.activo ? 'opacity-50' : 'border-gray-100'}`}>
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-primary-50 p-2 rounded-lg flex-shrink-0">
                <BookOpen size={18} className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">{p.nombre}</h3>
                <span className="text-xs text-gray-400">{p.sector}</span>
              </div>
              {!p.activo && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex-shrink-0">Inactivo</span>
              )}
            </div>
            {p.descripcion && (
              <p className="text-gray-400 text-xs line-clamp-2 mb-3">{p.descripcion}</p>
            )}
            <div className="flex gap-3 pt-3 border-t border-gray-100">
              <button onClick={() => abrirEditar(p)}
                className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-800 font-medium">
                <Edit2 size={13} /> Editar
              </button>
              <button onClick={() => abrirAsignar(p)}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium">
                <Users size={13} /> Asignar
              </button>
              {p.activo && (
                <button onClick={() => setModalEliminar(p)}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium ml-auto">
                  <Trash2 size={13} /> Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}