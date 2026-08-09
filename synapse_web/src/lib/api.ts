import axios, { AxiosInstance, AxiosError } from 'axios';


/**
 * CONFIGURACIÓN DEL API CLIENT
 * =============================
 * Cliente Axios centralizado para todas las peticiones HTTP
 * con manejo de autenticación y errores
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Crear instancia de Axios
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    // 🔧 FIX: Cambiar 'token' por 'nexus_token' para coincidir con AuthContext
    const token = typeof window !== 'undefined' ? localStorage.getItem('nexus_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado
      if (typeof window !== 'undefined') {
        // 🔧 FIX: Cambiar nombres de keys para coincidir con AuthContext
        localStorage.removeItem('nexus_token');
        localStorage.removeItem('nexus_usuario');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * FUNCIONES DE AUTENTICACIÓN
 */
export const authAPI = {
  login: (correo_electronico: string, password: string) =>
    api.post('/auth/login', { correo_electronico, password }),

  registrar: (data: any) =>
    api.post('/auth/registro', data),

  verifyEmail: (correo_electronico: string, token: string, codigo: string) => 
    // TODO: Implementar lógica de vericacion de email
    api.post('/auth/verify-email', { correo_electronico, token, codigo }),

  requestVerification: (data: { correo_electronico: string }) =>
    api.post('/auth/request-verification', data),

  // Alias para conservar compatibilidad.
  register: (data: any) =>
    api.post('/auth/registro', data),

  recuperarPassword: (data: { correo_electronico: string }) =>
    api.post('/auth/recuperar-password', data),

  verificarCodigo: (data: { correo_electronico: string; codigo: string }) =>
    api.post('/auth/verificar-codigo', data),

 restablecerPassword: (data: {
  correo_electronico: string;
  codigo: string;
  nueva_password: string;
}) =>
  api.post('/auth/restablecer-password', {
    correo_electronico: data.correo_electronico,
    codigo: data.codigo,
    nueva_password: data.nueva_password,
    password: data.nueva_password,
  }),

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nexus_token');
        localStorage.removeItem('nexus_usuario');
      }
    }
  },
};

/**
 * FUNCIONES DE GRUPOS
 */
export const gruposAPI = {
  // Obtener grupos de un programa
  obtenerGruposPorPrograma: (programaId: number) =>
    api.get(`/grupos/programa/${programaId}`),
  
  // Obtener miembros de un grupo específico
  obtenerMiembrosGrupo: (grupoId: number) =>
    api.get(`/grupos/${grupoId}/miembros`),
  
  // Obtener información completa de un grupo
  obtenerInfoCompletaGrupo: (grupoId: number) =>
    api.get(`/grupos/${grupoId}/info-completa`),
  
  // Obtener inscripciones pendientes
  obtenerInscripcionesPendientes: (programaId: number) =>
    api.get(`/grupos/${programaId}/pendientes`),
  
  // Obtener aprendices de un grupo (alternativa)
  obtenerAprendicesDelGrupo: (grupoId: number) =>
    api.get(`/grupos/${grupoId}/aprendices`),
  
  // Obtener estadísticas
  obtenerEstadisticas: (programaId: number) =>
    api.get(`/grupos/programa/${programaId}/estadisticas`),
  
  // Asignar aprendiz a grupo
  asignarAprendiz: (inscripcionId: number, grupoId: number) =>
    api.post('/grupos/asignar', { inscripcionId, grupoId }),
  
  // Cambiar aprendiz de grupo
  cambiarAprendiz: (usuarioId: number, programaId: number, nuevoGrupoId: number) =>
    api.put('/grupos/cambiar-grupo', { usuarioId, programaId, nuevoGrupoId }),
  
  // Remover aprendiz del grupo
  removerAprendiz: (grupoId: number, usuarioId: number) =>
    api.delete(`/grupos/${grupoId}/aprendices/${usuarioId}`),
  
  // Expulsar aprendiz (envía correo con motivo)
  expulsarAprendiz: (grupoId: number, usuarioId: number, motivo: string) =>
    api.post(`/grupos/${grupoId}/aprendices/${usuarioId}/expulsar`, { motivo }),

  // Suspender aprendiz (envía correo con motivo)
  suspenderAprendiz: (grupoId: number, usuarioId: number, motivo: string) =>
    api.post(`/grupos/${grupoId}/aprendices/${usuarioId}/suspender`, { motivo }),
  
  // Revertir expulsión (deshacer)
  revertExpulsion: (grupoId: number, usuarioId: number) =>
    api.post(`/grupos/${grupoId}/aprendices/${usuarioId}/revert-expulsion`),
};

/**
 * FUNCIONES DE COORDINADOR
 */
export const coordinadorAPI = {
  // Obtener mis programas
  misProgramas: () =>
    api.get('/coordinador/programas'),
  
  // Obtener detalle de programa
  obtenerPrograma: (programaId: number) =>
    api.get(`/coordinador/programas/${programaId}`),
  
  // Estadísticas generales
  estadisticas: () =>
    api.get('/coordinador/estadisticas'),
};

/**
 * FUNCIONES DE PROGRAMAS
 */
export const programasAPI = {
  // Obtener todos los programas
  obtenerTodos: () =>
    api.get('/programas'),
  listar: () =>
    api.get('/programas'),
  
  // Obtener detalle de programa
  obtenerPorId: (programaId: number) =>
    api.get(`/programas/${programaId}`),
  obtener: (programaId: number) =>
    api.get(`/programas/${programaId}`),
  
  // Crear programa (Admin)
  crear: (data: any) =>
    api.post('/programas', data),
  
  // Actualizar programa (Admin)
  actualizar: (programaId: number, data: any) =>
    api.put(`/programas/${programaId}`, data),
  
  // Eliminar programa (Admin)
  eliminar: (programaId: number) =>
    api.delete(`/programas/${programaId}`),
  
  // Alias para admin
  listarCoordinadores: (programaId: number) =>
    api.get(`/programas/${programaId}/coordinadores`),
  asignarCoordinador: (programaId: number, usuarioId: number) =>
    api.post(`/programas/${programaId}/coordinadores`, { usuario_id: usuarioId }),
  quitarCoordinador: (programaId: number, usuarioId: number) =>
    api.delete(`/programas/${programaId}/coordinadores/${usuarioId}`),
  listarProfesores: (programaId: number) =>
    api.get(`/programas/${programaId}/profesores`),
  asignarProfesor: (programaId: number, usuarioId: number) =>
    api.post(`/programas/${programaId}/profesores`, { usuario_id: usuarioId }),
  quitarProfesor: (programaId: number, usuarioId: number) =>
    api.delete(`/programas/${programaId}/profesores/${usuarioId}`),
};

/**
 * FUNCIONES DE INSCRIPCIONES
 */
export const inscripcionesAPI = {
  obtenerTodas: () =>
    api.get('/inscripciones'),

  obtenerPorPrograma: (programaId: number) =>
    api.get(`/inscripciones/programa/${programaId}`),

  inscribirse: (programaId: number) =>
  api.post('/inscripciones', { programa_id: programaId }),

  cancelar: (inscripcionId: number) =>
    api.delete(`/inscripciones/${inscripcionId}`),

  cambiarEstado: (inscripcionId: number, estado: string) =>
    api.put(`/inscripciones/${inscripcionId}`, { estado }),

  misInscripciones: () =>
    api.get('/inscripciones/mis-inscripciones'),
};

/**
 * FUNCIONES DE USUARIOS
 */
export const usuariosAPI = {
  // Obtener perfil actual
  obtenerPerfil: () =>
    api.get('/usuarios/perfil'),
  
  // Actualizar perfil
  actualizarPerfil: (data: any) =>
    api.put('/usuarios/perfil', data),
  
  // Obtener usuario por ID
  obtenerPorId: (usuarioId: number) =>
    api.get(`/usuarios/${usuarioId}`),
  
  // Cambiar contraseña
  cambiarPassword: (passwordActual: string, passwordNueva: string) =>
    api.post('/usuarios/cambiar-password', { passwordActual, passwordNueva }),
  
  // Listar todos (Admin)
  listarTodos: () =>
    api.get('/usuarios'),
  listarUsuarios: () =>
    api.get('/usuarios'),
  
  // Crear usuario (Admin)
  crear: (data: any) =>
    api.post('/usuarios', data),
  
  // Alias para acciones del admin
  eliminarUsuario: (usuarioId: number) =>
    api.delete(`/usuarios/${usuarioId}`),
  cambiarRol: (usuarioId: number, rolId: number) =>
    api.put(`/usuarios/${usuarioId}/rol`, { rolId }),
} as const;

/**
 * FUNCIONES DEL PROFESOR
 */
export const profesorAPI = {
  misProgramas: () =>
    api.get('/profesor/programas'),

  misGrupos: () =>
    api.get('/profesor/programas'),

  obtenerGrupo: (programaId: number) =>
    api.get(`/profesor/programas/${programaId}/grupo`),

  actualizarFaltas: (inscripcionId: number, faltas: number) =>
    api.put(`/profesor/inscripcion/${inscripcionId}/faltas`, { faltas }),

  calificar: (grupoId: number, usuarioId: number, calificacion: number) =>
    api.post('/profesor/calificar', { grupoId, usuarioId, calificacion }),
};

/**
 * FUNCIONES DEL CHATBOT
 */
export const chatbotAPI = {
  enviarMensaje: (mensaje: string) =>
    api.post('/chatbot/consulta', { mensaje }),

  // Alias por si otra pantalla usa el nombre anterior.
  consultar: (mensaje: string) =>
    api.post('/chatbot/consulta', { mensaje }),

  obtenerHistorial: () =>
    api.get('/chatbot/historial'),
};

/**
 * EXPORTAR API POR DEFECTO
 */
export default api;