import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';


/**
 * CONFIGURACIÓN DEL API CLIENT
 * =============================
 * Cliente Axios centralizado para todas las peticiones HTTP
 * con manejo de autenticación y errores
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const getCacheKey = (url: string, params?: any) => `${url}?${JSON.stringify(params ?? {})}`;
const getCache = new Map<string, { expiresAt: number; data: any }>();

const readCache = (key: string) => {
  const item = getCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    getCache.delete(key);
    return null;
  }
  return item.data;
};

const writeCache = (key: string, data: any, ttlMs = 30000) => {
  getCache.set(key, { expiresAt: Date.now() + ttlMs, data });
};

const invalidateCache = (url?: string) => {
  if (!url) {
    getCache.clear();
    return;
  }

  for (const key of Array.from(getCache.keys())) {
    if (key.startsWith(url)) getCache.delete(key);
  }
};

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
  (response) => {
    if (response.config.method?.toLowerCase() === 'get' && response.config.url) {
      const key = getCacheKey(response.config.url, response.config.params);
      writeCache(key, response);
    }

    return response;
  },
  (error: AxiosError) => {
    if (error.config && error.config.method && error.config.method.toLowerCase() !== 'get') {
      invalidateCache(error.config.url || '');
    }

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
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
const cachedGet = async <T = any>(url: string, params?: any): Promise<AxiosResponse<T>> => {
  const key = getCacheKey(url, params);
  const cached = readCache(key) as AxiosResponse<T> | null;
  if (cached) return cached;

  const response = await api.get<T>(url, { params });
  writeCache(key, response);
  return response;
};

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
      invalidateCache();
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
    cachedGet(`/grupos/programa/${programaId}`),
  
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
    cachedGet('/coordinador/programas'),
  
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
    cachedGet('/programas'),
  listar: () =>
    cachedGet('/programas'),
  
  // Obtener detalle de programa
  obtenerPorId: (programaId: number) =>
    cachedGet(`/programas/${programaId}`),
  obtener: (programaId: number) =>
    cachedGet(`/programas/${programaId}`),
  
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
    cachedGet('/inscripciones'),

  obtenerPorPrograma: (programaId: number) =>
    cachedGet(`/inscripciones/programa/${programaId}`),

  inscribirse: (programaId: number) =>
  api.post('/inscripciones', { programa_id: programaId }),

  cancelar: (inscripcionId: number) =>
    api.delete(`/inscripciones/${inscripcionId}`),

  cambiarEstado: (inscripcionId: number, estado: string) =>
    api.put(`/inscripciones/${inscripcionId}`, { estado }),

  misInscripciones: () =>
    cachedGet('/inscripciones/mis-inscripciones'),
};

/**
 * FUNCIONES DE USUARIOS
 */
export const usuariosAPI = {
  // Obtener perfil actual
  obtenerPerfil: () =>
    cachedGet('/usuarios/perfil'),
  
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
    cachedGet('/profesor/programas'),

  misGrupos: () =>
    api.get('/profesor/programas'),

  obtenerGrupo: (programaId: number) =>
    cachedGet(`/profesor/programas/${programaId}/grupo`),

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
    cachedGet('/chatbot/historial'),

  // Conexión SSE para mensajes en tiempo real
  conectarSSE: (onMessage: (data: any) => void, onError?: (error: Event) => void) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nexus_token') : null;
    if (!token) {
      console.error('SSE: No hay token de autenticación');
      throw new Error('No hay token de autenticación');
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const sseUrl = `${apiUrl}/chatbot/stream?token=${token}`;
    
    console.log('SSE: Conectando a:', sseUrl);
    console.log('SSE: Token:', token.substring(0, 20) + '...');
    
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      console.log('SSE: Conexión abierta exitosamente');
    };

    eventSource.onmessage = (event) => {
      console.log('SSE: Mensaje recibido:', event.data);
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      console.error('SSE: EventSource readyState:', eventSource.readyState);
      
      if (onError) {
        onError(error);
      }
      
      // Si el error es de conexión, EventSource intentará reconectar automáticamente
      // pero si es un error de autenticación, cerramos la conexión
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('SSE: Conexión cerrada permanentemente');
      }
    };

    return eventSource;
  },
};

export const storageAPI = {
  obtenerUrlsFotos: () =>
    api.get('/storage/photos').then((response) => response.data),
};

/**
 * EXPORTAR API POR DEFECTO
 */
export default api;