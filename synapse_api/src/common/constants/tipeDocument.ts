export const tipoDocumento = (documentId: number) => {

    switch (documentId) {
        case 1:
            return 'Cédula de ciudadanía';
        case 2:
            return 'Tarjeta de identidad';
        case 3:
            return 'Cédula de extranjería';
        case 4:
            return 'Passport';
        default:
            return 'Otro';
    }
};