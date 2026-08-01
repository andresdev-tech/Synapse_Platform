export interface User {
    id: number;
    email: string;
    password: string;
    name: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserDTO {
    email: string;
    password: string;
    name: string;
    role: string;
}

export interface UpdateUserDTO {
    email?: string;
    password?: string;
    name?: string;
    role?: string;
}

