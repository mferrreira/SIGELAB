export interface ILabResponsibility {
    id?: number;
    userId: number;
    userName: string;
    startTime: Date;
    endTime?: Date | null;
    notes?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export class LabResponsibility {
    private _id?: number;
    private _userId: number;
    private _userName: string;
    private _startTime: Date;
    private _endTime?: Date | null;
    private _notes?: string | null;
    private _createdAt?: Date;
    private _updatedAt?: Date;

    constructor(data: ILabResponsibility) {
        this._id = data.id;
        this._userId = data.userId;
        this._userName = data.userName;
        this._startTime = data.startTime;
        this._endTime = data.endTime;
        this._notes = data.notes;
        this._createdAt = data.createdAt;
        this._updatedAt = data.updatedAt;
    }

    static create(data: Omit<ILabResponsibility, 'id' | 'createdAt' | 'updatedAt'>): LabResponsibility {
        return new LabResponsibility({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    static fromPrisma(data: any): LabResponsibility {
        return new LabResponsibility({
            id: data.id,
            userId: data.userId,
            userName: data.userName,
            startTime: new Date(data.startTime),
            endTime: data.endTime ? new Date(data.endTime) : null,
            notes: data.notes,
            createdAt: undefined,
            updatedAt: undefined,
        });
    }

    // Getters
    get id(): number | undefined { return this._id; }
    get userId(): number { return this._userId; }
    get userName(): string { return this._userName; }
    get startTime(): Date { return this._startTime; }
    get endTime(): Date | null | undefined { return this._endTime; }
    get notes(): string | null | undefined { return this._notes; }
    get createdAt(): Date | undefined { return this._createdAt; }
    get updatedAt(): Date | undefined { return this._updatedAt; }

    // Business logic methods
    endResponsibility(notes?: string): LabResponsibility {
        if (this._endTime) {
            throw new Error("Responsabilidade já foi finalizada");
        }

        this._endTime = new Date();
        this._notes = notes || this._notes;
        this._updatedAt = new Date();
        return this;
    }

    updateNotes(notes: string): LabResponsibility {
        this._notes = notes.trim() || null;
        this._updatedAt = new Date();
        return this;
    }

    // Validation methods
    validate(): string[] {
        const errors: string[] = [];

        if (!this._userId || this._userId <= 0) {
            errors.push("ID do usuário é obrigatório");
        }

        if (!this._userName || this._userName.trim().length === 0) {
            errors.push("Nome do usuário é obrigatório");
        }

        if (!this._startTime || isNaN(this._startTime.getTime())) {
            errors.push("Horário de início é obrigatório e deve ser válido");
        }

        if (this._endTime && this._endTime <= this._startTime) {
            errors.push("Horário de fim deve ser posterior ao horário de início");
        }

        return errors;
    }

    // Utility methods
    isActive(): boolean {
        return !this._endTime;
    }

    getDuration(): number {
        if (!this._endTime) {
            // If still active, calculate duration from start to now
            const now = new Date();
            return now.getTime() - this._startTime.getTime();
        }
        
        return this._endTime.getTime() - this._startTime.getTime();
    }

    getDurationInMinutes(): number {
        return Math.floor(this.getDuration() / (1000 * 60));
    }

    getDurationInHours(): number {
        return this.getDurationInMinutes() / 60;
    }

    getFormattedDuration(): string {
        const hours = Math.floor(this.getDurationInHours());
        const minutes = this.getDurationInMinutes() % 60;
        return `${hours}h ${minutes}m`;
    }

    getFormattedStartTime(): string {
        return this._startTime.toLocaleString('pt-BR');
    }

    getFormattedEndTime(): string {
        return this._endTime ? this._endTime.toLocaleString('pt-BR') : 'Em andamento';
    }

    // Serialization
    toJSON(): any {
        return {
            id: this._id,
            userId: this._userId,
            userName: this._userName,
            startTime: this._startTime.toISOString(),
            endTime: this._endTime?.toISOString() || null,
            notes: this._notes,
            createdAt: this._createdAt?.toISOString(),
            updatedAt: this._updatedAt?.toISOString(),
            duration: this.getDurationInMinutes(),
            isActive: this.isActive(),
        };
    }

    toPrisma(): any {
        return {
            id: this._id,
            userId: this._userId,
            userName: this._userName,
            startTime: this._startTime.toISOString(),
            endTime: this._endTime ? this._endTime.toISOString() : null,
            notes: this._notes,
        };
    }
}
