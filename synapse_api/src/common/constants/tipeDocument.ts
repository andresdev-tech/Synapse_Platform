export const tipoDocumento = (documentId: string) => {

    switch (documentId) {
        case '01a006d1-9c76-7385-85ea-e2a5e4e33338':
            return 'Cédula de ciudadanía';
        case '01a006d1-9c76-7385-85ea-df8421640bc5':
            return 'Tarjeta de identidad';
        case '01a006d1-9c76-7385-85ea-e44c32284ec1':
            return 'Cédula de extranjería';
        case '01a006d1-9c76-7385-85ea-ea719f69122e':
            return 'Passport';
        default:
            return 'Otro';
    }
};