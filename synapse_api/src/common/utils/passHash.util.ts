import brcrypt from 'bcrypt';

export class PassHash {
    static async hash(password: string) {
        return await brcrypt.hash(password, 10);
    }
}