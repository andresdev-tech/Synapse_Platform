export interface LoginDto {
    correo_electronico: string;
    password: string;
}

export interface JwtPayload {
    id: number;
    correo_electronico: string;
    rol: number;
}

export interface RegisterDto {
    nombres: string;
    apellidos: string;
    tipo_documento: number;
    numero_documento: string;
    correo_electronico: string;
    fecha_nacimiento: Date;
    password: string;
    rol: number;
}