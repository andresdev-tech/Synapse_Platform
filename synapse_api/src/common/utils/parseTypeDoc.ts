export const parseTypeDoc = (typeDoc: number) => {
    switch (typeDoc) {
        case 1:
            return '01a006d1-9c76-7385-85ea-df8421640bc5';
        case 2:
            return '01a006d1-9c76-7385-85ea-e2a5e4e33338';
        case 3:
            return '01a006d1-9c76-7385-85ea-e44c32284ec1';
        case 4:
            return '01a006d1-9c76-7385-85ea-ea719f69122e';
        default:
            return '01a006d1-9c76-7385-85ea-df8421640bc5';
    }
};