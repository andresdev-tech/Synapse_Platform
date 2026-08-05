'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { programasAPI, inscripcionesAPI, usuariosAPI } from '../../../../../lib/api';
import { useAuth } from '../../../../../lib/AuthContext';
import {
  ArrowLeft, CheckCircle, AlertCircle, Clock,
  MapPin, Monitor, User, BookOpen, Wifi
} from 'lucide-react';

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
  horarios: Horario[];
}
interface Perfil {
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  tipo_documento: string;
  numero_documento: string;
  fecha_nacimiento: string;
}

const diasNombres: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
};

const modalidadConfig: Record<string, { icon: any; color: string; bg: string }> = {
  'Presencial': { icon: MapPin,  color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200' },
  'Virtual':    { icon: Wifi,    color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  'Mixto':      { icon: Monitor, color: 'text-green-600',  bg: 'bg-green-50 border-green-200' },
};

export default function FormularioInscripcion() {
  const { id } = useParams();
  const router = useRouter();
  const { isAprendiz, usuario, loading: authLoading } = useAuth();

  const [programa, setPrograma]               = useState<Programa | null>(null);
  const [perfil, setPerfil]                   = useState<Perfil | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [enviando, setEnviando]               = useState(false);
  const [error, setError]                     = useState('');
  const [exito, setExito]                     = useState(false);

  const [horarioSeleccionado, setHorarioSeleccionado] = useState<Horario | null>(null);
  const [nivelEducativo, setNivelEducativo]           = useState('');
  const [trabaja, setTrabaja]                         = useState('');
  const [motivacion, setMotivacion]                   = useState('');
  const [checks, setChecks] = useState({
    requisitos: false,
    documentos: false,
    terminos:   false,
  });

  useEffect(() => {
    if (!authLoading && usuario && !isAprendiz()) {
      router.replace(`/dashboard/programas/${id}`);
    }
  }, [usuario, authLoading]);

  useEffect(() => {
    Promise.all([
      programasAPI.obtener(Number(id)),
      usuariosAPI.obtenerPerfil(),
    ])
      .then(([progRes, perfilRes]) => {
        setPrograma(progRes.data);
        setPerfil(perfilRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnviar = async () => {
    setError('');
    if (!horarioSeleccionado)  return setError('Debes seleccionar un horario y modalidad.');
    if (!nivelEducativo)       return setError('Selecciona tu nivel educativo.');
    if (!trabaja)              return setError('Indica si trabajas actualmente.');
    if (!motivacion.trim())    return setError('Escribe tu motivación para inscribirte.');
    if (!checks.requisitos || !checks.documentos || !checks.terminos)
      return setError('Debes aceptar todas las declaraciones para continuar.');

    setEnviando(true);
    try {
      await inscripcionesAPI.inscribirse(Number(id));
      setExito(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar la inscripción.');
    } finally {
      setEnviando(false);
    }
  };

  // ── PANTALLA ÉXITO ─────────────────────────────────────────
  if (exito) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={42} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Inscripción exitosa!</h1>
        <p className="text-gray-500 mb-1">Te inscribiste al programa:</p>
        <p className="font-bold text-primary-700 text-lg mb-2">{programa?.nombre}</p>

        {horarioSeleccionado && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-6 text-sm text-gray-600">
            <span className="font-medium">{horarioSeleccionado.modalidad}</span>
            {' · '}
            <span>{horarioSeleccionado.jornada}</span>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 text-left mb-6">
          <p className="font-semibold mb-2">📋 Próximos pasos:</p>
          <ul className="space-y-1.5">
            <li>• Revisa tu correo de confirmación</li>
            <li>• Prepara los documentos requeridos</li>
            <li>• Preséntate en el centro de formación asignado</li>
            <li>• Espera la confirmación de cupo disponible</li>
          </ul>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push('/dashboard/inscripciones')} className="btn-primary flex-1">
            Ver mis inscripciones
          </button>
          <button onClick={() => router.push('/dashboard/programas')} className="btn-secondary flex-1">
            Más programas
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const horarios = programa?.horarios ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra superior */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            <ArrowLeft size={18} /> Volver al programa
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BookOpen size={15} className="text-primary-600" />
            <span className="font-medium text-gray-700 truncate max-w-xs">{programa?.nombre}</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Formulario de Inscripción</h1>
          <p className="text-gray-500 text-sm">Completa todos los campos para confirmar tu inscripción</p>
        </div>

        {/* ── 1. DATOS DEL ASPIRANTE ─────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-primary-100 p-1.5 rounded-lg">
              <User size={15} className="text-primary-600" />
            </div>
            <h2 className="font-semibold text-gray-800">1. Datos del aspirante</h2>
          </div>
          {perfil ? (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Nombres',         value: perfil.nombres },
                { label: 'Apellidos',        value: perfil.apellidos },
                { label: 'Tipo documento',   value: perfil.tipo_documento },
                { label: 'N° Documento',     value: perfil.numero_documento },
                { label: 'Correo',           value: perfil.correo_electronico },
                { label: 'Fecha nacimiento', value: perfil.fecha_nacimiento
                    ? new Date(perfil.fecha_nacimiento).toLocaleDateString('es-CO')
                    : 'No registrada' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <span className="text-xs text-gray-400 block mb-0.5">{label}</span>
                  <span className="text-sm font-medium text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Cargando datos...</p>
          )}
          <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
            <AlertCircle size={11} />
            Si hay errores en tus datos, actualiza tu perfil antes de continuar.
          </p>
        </div>

        {/* ── 2. SELECCIÓN DE MODALIDAD Y HORARIO ────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary-100 p-1.5 rounded-lg">
              <Clock size={15} className="text-primary-600" />
            </div>
            <h2 className="font-semibold text-gray-800">2. Modalidad y horario preferido</h2>
            <span className="text-red-500 text-sm">*</span>
          </div>
          <p className="text-gray-400 text-xs mb-4 ml-8">
            Selecciona la modalidad y jornada que más se adapte a ti
          </p>

          {horarios.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
              No hay horarios disponibles para este programa.
            </div>
          ) : (
            <div className="space-y-3">
              {horarios.map((h) => {
                const cfg = modalidadConfig[h.modalidad] || modalidadConfig['Presencial'];
                const Icono = cfg.icon;
                const seleccionado = horarioSeleccionado?.id === h.id;

                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setHorarioSeleccionado(h)}
                    className={`w-full text-left border-2 rounded-xl p-4 transition-all ${
                      seleccionado
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Modalidad badge */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg border ${cfg.bg}`}>
                          <Icono size={18} className={cfg.color} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900">{h.modalidad}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                              {h.jornada}
                            </span>
                          </div>

                          {/* Días y horas */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                            {Object.entries(h.horarios).map(([dia, hora]) => (
                              <div key={dia} className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 w-20">{diasNombres[dia] || dia}</span>
                                <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                                  {hora}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Indicador seleccionado */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                        seleccionado ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                      }`}>
                        {seleccionado && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 3. INFORMACIÓN ADICIONAL ───────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="bg-primary-100 p-1.5 rounded-lg">
              <BookOpen size={15} className="text-primary-600" />
            </div>
            <h2 className="font-semibold text-gray-800">3. Información adicional</h2>
          </div>

          {/* Nivel educativo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nivel educativo <span className="text-red-500">*</span>
            </label>
            <select
              className="input-field"
              value={nivelEducativo}
              onChange={(e) => setNivelEducativo(e.target.value)}
            >
              <option value="">Selecciona una opción</option>
              <option value="primaria">Primaria completa</option>
              <option value="secundaria_incompleta">Bachillerato incompleto</option>
              <option value="secundaria">Bachillerato completo</option>
              <option value="tecnico">Técnico</option>
              <option value="tecnologo">Tecnólogo</option>
              <option value="universitario">Universitario</option>
              <option value="posgrado">Posgrado</option>
            </select>
          </div>

          {/* Trabaja actualmente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ¿Trabajas actualmente? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {['Sí', 'No'].map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setTrabaja(op)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    trabaja === op
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          {/* Motivación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ¿Por qué deseas inscribirte a este programa? <span className="text-red-500">*</span>
            </label>
            <textarea
              className="input-field resize-none"
              rows={4}
              placeholder="Describe brevemente tu motivación..."
              value={motivacion}
              onChange={(e) => setMotivacion(e.target.value)}
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{motivacion.length}/500</p>
          </div>
        </div>

        {/* ── 4. DECLARACIONES ───────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-primary-100 p-1.5 rounded-lg">
              <CheckCircle size={15} className="text-primary-600" />
            </div>
            <h2 className="font-semibold text-gray-800">4. Declaraciones</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: 'requisitos' as const, texto: 'Declaro que cumplo con los requisitos de ingreso y que la información proporcionada es veraz y verificable.' },
              { key: 'documentos'  as const, texto: 'Me comprometo a entregar todos los documentos requeridos en el plazo establecido por el centro de formación.' },
              { key: 'terminos'    as const, texto: 'Acepto los términos y condiciones de la plataforma NEXUS y el reglamento del aprendiz.' },
            ].map(({ key, texto }) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  checked={checks[key]}
                  onChange={(e) => setChecks({ ...checks, [key]: e.target.checked })}
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-800 leading-relaxed">
                  {texto}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Resumen selección */}
        {horarioSeleccionado && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 text-sm text-primary-700 flex items-center gap-2">
            <CheckCircle size={16} className="flex-shrink-0" />
            <span>
              Horario seleccionado: <strong>{horarioSeleccionado.modalidad}</strong> — {horarioSeleccionado.jornada}
            </span>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pb-8">
          <button onClick={() => router.back()} className="btn-secondary flex-1 py-3">
            Cancelar
          </button>
          <button
            onClick={handleEnviar}
            disabled={enviando}
            className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
          >
            {enviando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Enviar inscripción
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}