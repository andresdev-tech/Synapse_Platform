import brcrypt from 'bcrypt';

export class ComparedHash {
    static async compare(password: string, hash_user: string) {
        return await brcrypt.compare(password, hash_user);
    }
}