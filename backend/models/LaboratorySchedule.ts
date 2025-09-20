export interface ILaboratorySchedule {
    id?: number;
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    notes?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export class LaboratorySchedule {
    private _id?: number;
    private _dayOfWeek: number;
    private _startTime: string;
    private _endTime: string;
    private _notes?: string | null;
    private _createdAt?: Date;
    private _updatedAt?: Date;

    constructor(data: ILaboratorySchedule) {
        this._id = data.id;
        this._dayOfWeek = data.dayOfWeek;
        this._startTime = data.startTime;
        this._endTime = data.endTime;
        this._notes = data.notes;
        this._createdAt = data.createdAt;
        this._updatedAt = data.updatedAt;
    }

    static create(data: Omit<ILaboratorySchedule, 'id' | 'createdAt' | 'updatedAt'>): LaboratorySchedule {
        return new LaboratorySchedule({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    static fromPrisma(data: any): LaboratorySchedule {
        return new LaboratorySchedule({
            id: data.id,
            dayOfWeek: data.dayOfWeek,
            startTime: data.startTime,
            endTime: data.endTime,
            notes: data.notes,
            createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        });
    }

    // Getters
    get id(): number | undefined { return this._id; }
    get dayOfWeek(): number { return this._dayOfWeek; }
    get startTime(): string { return this._startTime; }
    get endTime(): string { return this._endTime; }
    get notes(): string | null | undefined { return this._notes; }
    get createdAt(): Date | undefined { return this._createdAt; }
    get updatedAt(): Date | undefined { return this._updatedAt; }

    // Business logic methods
    updateSchedule(startTime: string, endTime: string, notes?: string): LaboratorySchedule {
        this.validateTimeFormat(startTime);
        this.validateTimeFormat(endTime);
        
        if (this.isTimeConflict(startTime, endTime)) {
            throw new Error("Horário de início deve ser anterior ao horário de fim");
        }

        this._startTime = startTime;
        this._endTime = endTime;
        this._notes = notes || null;
        this._updatedAt = new Date();
        return this;
    }

    updateNotes(notes: string): LaboratorySchedule {
        this._notes = notes.trim() || null;
        this._updatedAt = new Date();
        return this;
    }

    // Validation methods
    validate(): string[] {
        const errors: string[] = [];

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

    isActive(): boolean {
        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
        
        if (currentDay !== this._dayOfWeek) {
            return false;
        }

        return currentTime >= this._startTime && currentTime <= this._endTime;
    }

    // Serialization
    toJSON(): any {
        return {
            id: this._id,
            dayOfWeek: this._dayOfWeek,
            startTime: this._startTime,
            endTime: this._endTime,
            notes: this._notes,
            createdAt: this._createdAt?.toISOString(),
            updatedAt: this._updatedAt?.toISOString(),
        };
    }

    toPrisma(): any {
        return {
            id: this._id,
            dayOfWeek: this._dayOfWeek,
            startTime: this._startTime,
            endTime: this._endTime,
            notes: this._notes,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        };
    }
}
