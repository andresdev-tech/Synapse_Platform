'use client';
import { useEffect, useState } from 'react';
import { usuariosAPI } from '../../../lib/api';
import { useAuth } from '../../../lib/AuthContext';
import { User, Save } from 'lucide-react';

interface Perfil {
  id: number;
  nombres: string;
  apellidos: string;
  tipo_documento: string;
  numero_documento: string;
  fecha_nacimiento: string;
  correo_electronico: string;
  rol: string;
  creado_en: string;
}

const calcularFechaMaxima = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 16);
  return d.toISOString().split('T')[0];
};

export default function PerfilPage() {
  const { usuario } = useAuth();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ nombres: '', apellidos: '', fecha_nacimiento: '' });
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    usuariosAPI.obtenerPerfil()
      .then((res) => {
        setPerfil(res.data);
        setForm({
          nombres: res.data.nombres,
          apellidos: res.data.apellidos,
          fecha_nacimiento: res.data.fecha_nacimiento
            ? res.data.fecha_nacimiento.split('T')[0]
            : '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    if (form.fecha_nacimiento) {
      const nacimiento = new Date(form.fecha_nacimiento);
      const hoy = new Date();
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
      if (edad < 16) {
        return setError('Debes tener al menos 16 años.');
      }
    }

    setGuardando(true);
    try {
      await usuariosAPI.actualizarPerfil(form);
      setPerfil((prev) => prev ? { ...prev, ...form } : null);
      setMensaje('Perfil actualizado correctamente.');
      setEditando(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Cargando perfil...</div>;
  if (!perfil) return <div className="p-8 text-gray-500">No se pudo cargar el perfil.</div>;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h1>

      {mensaje && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          {mensaje}
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="card">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User size={28} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {perfil.nombres} {perfil.apellidos}
            </h2>
            <span className="text-sm bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
              {perfil.rol}
            </span>
          </div>
        </div>

        {!editando ? (
          <>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400 block">Nombres</span>
                <span className="font-medium text-gray-800">{perfil.nombres}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Apellidos</span>
                <span className="font-medium text-gray-800">{perfil.apellidos}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Tipo de Documento</span>
                <span className="font-medium text-gray-800">{perfil.tipo_documento}</span>
              </div>
              <div>
                <span className="text-gray-400 block">N° Documento</span>
                <span className="font-medium text-gray-800">{perfil.numero_documento}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Correo electrónico</span>
                <span className="font-medium text-gray-800">{perfil.correo_electronico}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Fecha de nacimiento</span>
                <span className="font-medium text-gray-800">
                  {perfil.fecha_nacimiento
                    ? new Date(perfil.fecha_nacimiento).toLocaleDateString('es-CO')
                    : 'No registrada'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Miembro desde</span>
                <span className="font-medium text-gray-800">
                  {new Date(perfil.creado_en).toLocaleDateString('es-CO', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </span>
              </div>
            </div>
            <button onClick={() => setEditando(true)} className="btn-primary mt-6">
              Editar información
            </button>
          </>
        ) : (
          <form onSubmit={guardar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
                <input
                  className="input-field"
                  value={form.nombres}
                  onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                <input
                  className="input-field"
                  value={form.apellidos}
                  onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
              <input
                type="date"
                className="input-field"
                max={calcularFechaMaxima()}
                value={form.fecha_nacimiento}
                onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={guardando} className="btn-primary flex items-center gap-2">
                <Save size={16} />
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button
                type="button"
                onClick={() => { setEditando(false); setError(''); }}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}