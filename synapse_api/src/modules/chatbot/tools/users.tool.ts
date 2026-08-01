import { prisma } from '../../../config/prisma';

// Tool para obtener información de usuarios por usuario loggeado
export const getUsersInfo = async (userId: any) => {
    const parsedUserId = Number(userId);
    if (isNaN(parsedUserId)) {
        return null;
    }
    const users = await prisma.usuarios.findUnique({
        where: {
            id: parsedUserId,
        },
        select: {
            id: true,
            nombres: true,
            apellidos: true,
            tipo_documento_id: true,
            numero_documento: true,
            fecha_nacimiento: true,
            correo_electronico: true,
            creado_en: true,
        },
    });

    return users;
};

// Tool para actualizar un dato específico del usuario
export const updateUser = async (userId: any, data: any) => {
    console.log('=== updateUser called ===');
    console.log('userId:', userId);
    console.log('data received:', data);

    try {
        const parsedUserId = Number(userId);
        if (isNaN(parsedUserId)) {
            throw new Error('El ID de usuario proporcionado no es un número válido');
        }

        // Mapear aliases comunes que el modelo de IA o usuario puedan enviar
        const normalizedData = { ...data };
        if (data.nombre && data.nombres === undefined) normalizedData.nombres = data.nombre;
        if (data.apellido && data.apellidos === undefined) normalizedData.apellidos = data.apellido;
        if (data.correo && data.correo_electronico === undefined) normalizedData.correo_electronico = data.correo;
        if (data.email && data.correo_electronico === undefined) normalizedData.correo_electronico = data.email;
        if (data.documento && data.numero_documento === undefined) normalizedData.numero_documento = data.documento;
        if (data.identificacion && data.numero_documento === undefined) normalizedData.numero_documento = data.identificacion;
        if (data.tipo_documento && data.tipo_documento_id === undefined) normalizedData.tipo_documento_id = data.tipo_documento;

        // Filtrar campos permitidos para actualizar
        const allowedFields = [
            'nombres',
            'apellidos',
            'correo_electronico',
            'fecha_nacimiento',
            'numero_documento',
            'tipo_documento_id'
        ];

        const updateData: any = {};

        for (const field of allowedFields) {
            if (normalizedData[field] !== undefined) {
                updateData[field] = normalizedData[field];
            }
        }

        // Tipar correctamente campos numéricos y de fecha
        if (updateData.tipo_documento_id !== undefined) {
            updateData.tipo_documento_id = Number(updateData.tipo_documento_id);
            if (isNaN(updateData.tipo_documento_id)) {
                throw new Error('El tipo de documento debe ser un número válido (entre 1 y 4)');
            }
        }

        if (updateData.fecha_nacimiento !== undefined && updateData.fecha_nacimiento !== null) {
            const parsedDate = new Date(updateData.fecha_nacimiento);
            if (isNaN(parsedDate.getTime())) {
                throw new Error('La fecha de nacimiento no tiene un formato válido (use YYYY-MM-DD)');
            }
            updateData.fecha_nacimiento = parsedDate;
        }

        console.log('updateData filtered and parsed:', updateData);

        if (Object.keys(updateData).length === 0) {
            console.error('No valid fields to update');
            throw new Error('No se proporcionaron campos válidos para actualizar');
        }

        console.log('Attempting Prisma update...');
        const user = await prisma.usuarios.update({
            where: {
                id: parsedUserId,
            },
            data: {
                ...updateData,
                actualizado_en: new Date(),
            },
            select: {
                id: true,
                nombres: true,
                apellidos: true,
                tipo_documento_id: true,
                numero_documento: true,
                fecha_nacimiento: true,
                correo_electronico: true,
                creado_en: true,
                actualizado_en: true,
            },
        });

        console.log('Update successful:', user);

        return {
            success: true,
            message: 'Datos actualizados correctamente',
            updatedFields: Object.keys(updateData),
            user
        };
    } catch (error: any) {
        console.error('Error in updateUser tool:', error);
        return {
            success: false,
            message: `Error al actualizar los datos: ${error.message || error}`,
        };
    }
};

// Tool para actualizar todos los datos del usuario
export const updateAllUser = async (userId: any, data: any) => {
    try {
        const parsedUserId = Number(userId);
        if (isNaN(parsedUserId)) {
            throw new Error('ID de usuario inválido');
        }
        const user = await prisma.usuarios.update({
            where: {
                id: parsedUserId,
            },
            data: {
                ...data,
                actualizado_en: new Date(),
            },
        });

        return user;
    } catch (error) {
        console.error('Error in updateAllUser tool:', error);
        throw error;
    }
};
