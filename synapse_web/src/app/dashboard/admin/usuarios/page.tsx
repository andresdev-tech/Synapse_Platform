'use client';
import { useEffect, useState } from 'react';
import { usuariosAPI } from '../../../../lib/api';
import { useAuth } from '../../../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, Trash2, Search, Shield } from 'lucide-react';
import FeedbackModal from '../../../../components/FeedbackModal';

interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  tipo_documento: string;
  numero_documento: string;
  correo_electronico: string;
  rol: string;
  creado_en: string;
}

const rolColors: Record<string, string> = {
  Administrador: 'bg-red-100 text-red-700',
  Aprendiz:      'bg-blue-100 text-blue-700',
  Coordinador:   'bg-purple-100 text-purple-700',
  Profesor:      'bg-teal-100 text-teal-700',
};

export default function AdminUsuariosPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  // Estado para el modal de feedback
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'alert' | 'confirm' | 'success';
    action?: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'alert' });

  useEffect(() => {
    if (!isAdmin()) { router.push('/dashboard'); return; }
    usuariosAPI.listarUsuarios()
      .then((res) => setUsuarios(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  const confirmarEliminar = (id: number, nombre: string) => {
    openConfirm('Confirmar Eliminación', `¿Eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`, async () => {
      closeModal();
      try {
        await usuariosAPI.eliminarUsuario(id);
        setUsuarios((prev) => prev.filter((u) => u.id !== id));
        openSuccess('Eliminado', 'El usuario fue eliminado correctamente.');
      } catch (err: any) {
        openAlert('Error al eliminar', err.response?.data?.message || 'Hubo un problema al eliminar el usuario.');
      }
    });
  };

  const cambiarRol = async (id: number, nuevoRolId: number) => {
    try {
      await usuariosAPI.cambiarRol(id, nuevoRolId);
      const rolesMap: Record<number, string> = { 1: 'Aprendiz', 2: 'Estudiante', 3: 'Profesor', 4: 'Coordinador', 5: 'Administrador' };
      setUsuarios((prev) => prev.map((u) =>
        u.id === id ? { ...u, rol: rolesMap[nuevoRolId] } : u
      ));
      openSuccess('Rol actualizado', 'El rol del usuario se cambió con éxito.');
    } catch (err: any) {
      openAlert('Error de actualización', err.response?.data?.message || 'Ocurrió un error al intentar cambiar el rol.');
    }
  };

  const filtrados = usuarios.filter((u) =>
    `${u.nombres} ${u.apellidos} ${u.correo_electronico} ${u.numero_documento}`
      .toLowerCase()
      .includes(filtro.toLowerCase())
  );

  if (loading) return <div className="p-8 text-gray-500">Cargando usuarios...</div>;

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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">{usuarios.length} usuarios registrados</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-72 shadow-sm">
          <Search size={16} className="text-gray-400" />
          <input
            className="flex-1 text-sm focus:outline-none placeholder-gray-400"
            placeholder="Buscar por nombre, correo o documento..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-12">
          <Users size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No se encontraron usuarios.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Usuario</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium hidden sm:table-cell">Documento</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Correo</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Rol</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium hidden md:table-cell">Registro</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {u.nombres} {u.apellidos}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    {u.tipo_documento} {u.numero_documento}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.correo_electronico}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.rol === 'Administrador' ? 5 : u.rol === 'Coordinador' ? 4 : u.rol === 'Profesor' ? 3 : u.rol === 'Estudiante' ? 2 : 1}
                      onChange={(e) => cambiarRol(u.id, parseInt(e.target.value))}
                      className={`text-xs font-medium px-2 py-1 rounded-full border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-300 cursor-pointer shadow-sm ${rolColors[u.rol] || ''}`}
                    >
                      <option value={5}>Administrador</option>
                      <option value={4}>Coordinador</option>
                      <option value={3}>Profesor</option>
                      <option value={2}>Estudiante</option>
                      <option value={1}>Aprendiz</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                    {new Date(u.creado_en).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => confirmarEliminar(u.id, `${u.nombres} ${u.apellidos}`)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
                      title="Eliminar usuario"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}