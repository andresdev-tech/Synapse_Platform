import { log } from 'console';
import { v7 as uuidv7 } from 'uuid';

export const generateUUID = () => {
    const uuid = uuidv7();
    log('UUID generado:', uuid);
    return uuid;
};