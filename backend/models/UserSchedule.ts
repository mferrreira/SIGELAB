export interface IUserSchedule {
    id?: number;
    userId: number;
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class UserSchedule {
    private _id?: number;
    private _userId: number;
    private _dayOfWeek: number;
    private _startTime: string;
    private _endTime: string;
    private _isActive: boolean;
    private _createdAt?: Date;
    private _updatedAt?: Date;

    constructor(data: IUserSchedule) {
        this._id = data.id;
        this._userId = data.userId;
        this._dayOfWeek = data.dayOfWeek;
        this._startTime = data.startTime;
        this._endTime = data.endTime;
        this._isActive = data.isActive;
        this._createdAt = data.createdAt;
        this._updatedAt = data.updatedAt;
    }

    static create(data: Omit<IUserSchedule, 'id' | 'createdAt' | 'updatedAt'>): UserSchedule {
        return new UserSchedule({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    static fromPrisma(data: any): UserSchedule {
        return new UserSchedule({
            id: data.id,
            userId: data.userId,
            dayOfWeek: data.dayOfWeek,
            startTime: data.startTime,
            endTime: data.endTime,
            isActive: data.isActive ?? true,
            createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        });
    }

    // Getters
    get id(): number | undefined { return this._id; }
    get userId(): number { return this._userId; }
    get dayOfWeek(): number { return this._dayOfWeek; }
    get startTime(): string { return this._startTime; }
    get endTime(): string { return this._endTime; }
    get isActive(): boolean { return this._isActive; }
    get createdAt(): Date | undefined { return this._createdAt; }
    get updatedAt(): Date | undefined { return this._updatedAt; }

    // Business logic methods
    updateSchedule(startTime: string, endTime: string): UserSchedule {
        this.validateTimeFormat(startTime);
        this.validateTimeFormat(endTime);
        
        if (this.isTimeConflict(startTime, endTime)) {
            throw new Error("Horário de início deve ser anterior ao horário de fim");
        }

        this._startTime = startTime;
        this._endTime = endTime;
        this._updatedAt = new Date();
        return this;
    }

    activate(): UserSchedule {
        this._isActive = true;
        this._updatedAt = new Date();
        return this;
    }

    deactivate(): UserSchedule {
        this._isActive = false;
        this._updatedAt = new Date();
        return this;
    }

    toggleActive(): UserSchedule {
        this._isActive = !this._isActive;
        this._updatedAt = new Date();
        return this;
    }

    // Validation methods
    validate(): string[] {
        const errors: string[] = [];

        if (!this._userId || this._userId <= 0) {
            errors.push("ID do usuário é obrigatório");
        }

        if (this._dayOfWeek < 0 || this._dayOfWeek > 6) {
            errors.push("Dia da semana deve estar entre 0 (domingo) e 6 (sábado)");
        }

        if (!this._startTime || !this.validateTimeFormat(this._startTime)) {
            errors.push("Horário de início deve estar no formato HH:MM");
        }

        if (!this._endTime || !this.validateTimeFormat(this._endTime)) {
            errors.push("Horário de fim deve estar no formato HH:MM");
        }

        if (this._startTime && this._endTime && this.isTimeConflict(this._startTime, this._endTime)) {
            errors.push("Horário de início deve ser anterior ao horário de fim");
        }

        return errors;
    }

    private validateTimeFormat(time: string): boolean {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    private isTimeConflict(startTime: string, endTime: string): boolean {
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        return startMinutes >= endMinutes;
    }

    // Utility methods
    getDayName(): string {
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return days[this._dayOfWeek] || 'Dia inválido';
    }

    getFormattedSchedule(): string {
        return `${this.getDayName()}: ${this._startTime} - ${this._endTime}`;
    }

    getDuration(): number {
        const [startHour, startMin] = this._startTime.split(':').map(Number);
        const [endHour, endMin] = this._endTime.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        return endMinutes - startMinutes; // Duration in minutes
    }

    getDurationInHours(): number {
        return this.getDuration() / 60;
    }

    isActiveToday(): boolean {
        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
        
        if (!this._isActive || currentDay !== this._dayOfWeek) {
            return false;
        }

        return currentTime >= this._startTime && currentTime <= this._endTime;
    }

    // Serialization
    toJSON(): any {
        return {
            id: this._id,
            userId: this._userId,
            dayOfWeek: this._dayOfWeek,
            startTime: this._startTime,
            endTime: this._endTime,
            isActive: this._isActive,
            createdAt: this._createdAt?.toISOString(),
            updatedAt: this._updatedAt?.toISOString(),
        };
    }

    toPrisma(): any {
        return {
            id: this._id,
            userId: this._userId,
            dayOfWeek: this._dayOfWeek,
            startTime: this._startTime,
            endTime: this._endTime,
            isActive: this._isActive,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        };
    }
}
