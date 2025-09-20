import * as bcrypt from 'bcryptjs';

export class UserAuth {
    constructor(private password: string | null) {}

    async setPassword(password: string): Promise<void> {
        if (!password || password.length < 6) {
            throw new Error("Senha deve ter pelo menos 6 caracteres");
        }
        this.password = await bcrypt.hash(password, 10);
    }

    async validatePassword(password: string): Promise<boolean> {
        if (!this.password) return false;
        return await bcrypt.compare(password, this.password);
    }

    getPassword(): string | null {
        return this.password;
    }

    hasPassword(): boolean {
        return this.password !== null;
    }
}

