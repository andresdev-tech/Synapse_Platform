export interface CrearInscripcionDTO {
  programa_id: number;
}

export interface CambiarEstadoInscripcionDTO {
  estado: string;
}

export interface FiltrosInscripcion {
  usuario_id?: number;
  programa_id?: number;
}

export interface UsuarioAutenticado {
  id: number;
}