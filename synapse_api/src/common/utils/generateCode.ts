export const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateExpiration = () => {
    return new Date(Date.now() + 1000 * 60 * 10); // 10 minutes
};