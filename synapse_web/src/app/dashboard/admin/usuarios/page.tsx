'use client';
import { useEffect, useState } from 'react';
import { usuariosAPI } from '../../../../lib/api';
import { useAuth } from '../../../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, Trash2, Search, Shield } from 'lucide-react';

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

  useEffect(() => {
    if (!isAdmin()) { router.push('/dashboard'); return; }
    usuariosAPI.listarUsuarios()
      .then((res) => setUsuarios(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const eliminar = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await usuariosAPI.eliminarUsuario(id);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar usuario.');
    }
  };

  const cambiarRol = async (id: number, nuevoRolId: number) => {
    try {
      await usuariosAPI.cambiarRol(id, nuevoRolId);
      const rolesMap: Record<number, string> = { 1: 'Administrador', 2: 'Aprendiz', 3: 'Coordinador', 4: 'Profesor' };
      setUsuarios((prev) => prev.map((u) =>
        u.id === id ? { ...u, rol: rolesMap[nuevoRolId] } : u
      ));
    } catch {
      alert('Error al cambiar el rol.');
    }
  };

  const filtrados = usuarios.filter((u) =>
    `${u.nombres} ${u.apellidos} ${u.correo_electronico} ${u.numero_documento}`
      .toLowerCase()
      .includes(filtro.toLowerCase())
  );

  if (loading) return <div className="p-8 text-gray-500">Cargando usuarios...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">{usuarios.length} usuarios registrados</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-72">
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
        <div className="card text-center py-12">
          <Users size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No se encontraron usuarios.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Usuario</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Documento</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Correo</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Rol</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Registro</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {u.nombres} {u.apellidos}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {u.tipo_documento} {u.numero_documento}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.correo_electronico}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.rol === 'Administrador' ? 1 : u.rol === 'Aprendiz' ? 2 : u.rol === 'Coordinador' ? 3 : 4}
                      onChange={(e) => cambiarRol(u.id, parseInt(e.target.value))}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary-300 cursor-pointer ${rolColors[u.rol] || ''}`}
                    >
                      <option value={1}>Administrador</option>
                      <option value={2}>Aprendiz</option>
                      <option value={3}>Coordinador</option>
                      <option value={4}>Profesor</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(u.creado_en).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => eliminar(u.id, `${u.nombres} ${u.apellidos}`)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
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
      )}
    </div>
  );
}