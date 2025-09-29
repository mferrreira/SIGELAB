export interface ILabEvent {
    id?: number;
    userId: number;
    userName: string;
    date: Date;
    note: string;
    createdAt?: Date;
}

export class LabEvent {
    private _id?: number;
    private _userId: number;
    private _userName: string;
    private _date: Date;
    private _note: string;
    private _createdAt?: Date;

    constructor(data: ILabEvent) {
        this._id = data.id;
        this._userId = data.userId;
        this._userName = data.userName;
        this._date = data.date;
        this._note = data.note;
        this._createdAt = data.createdAt;
    }

    static create(data: Omit<ILabEvent, 'id' | 'createdAt'>): LabEvent {
        return new LabEvent({
            ...data,
            createdAt: new Date(),
        });
    }

    static fromPrisma(data: any): LabEvent {
        return new LabEvent({
            id: data.id,
            userId: data.userId,
            userName: data.userName,
            date: new Date(data.date),
            note: data.note,
            createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        });
    }

    // Getters
    get id(): number | undefined { return this._id; }
    get userId(): number { return this._userId; }
    get userName(): string { return this._userName; }
    get date(): Date { return this._date; }
    get note(): string { return this._note; }
    get createdAt(): Date | undefined { return this._createdAt; }

    // Business logic methods
    updateNote(note: string): LabEvent {
        if (!note || note.trim().length === 0) {
            throw new Error("Nota do evento é obrigatória");
        }
        this._note = note.trim();
        return this;
    }

    updateDate(date: Date): LabEvent {
        if (!date || isNaN(date.getTime())) {
            throw new Error("Data do evento é obrigatória e deve ser válida");
        }
        this._date = date;
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

        if (!this._date || isNaN(this._date.getTime())) {
            errors.push("Data do evento é obrigatória e deve ser válida");
        }

        if (!this._note || this._note.trim().length === 0) {
            errors.push("Nota do evento é obrigatória");
        }

        return errors;
    }

    // Utility methods
    getFormattedDate(): string {
        return this._date.toLocaleDateString('pt-BR');
    }

    getFormattedDateTime(): string {
        return this._date.toLocaleString('pt-BR');
    }

    isToday(): boolean {
        const today = new Date();
        return this._date.toDateString() === today.toDateString();
    }

    isPast(): boolean {
        const now = new Date();
        return this._date < now;
    }

    isFuture(): boolean {
        const now = new Date();
        return this._date > now;
    }

    // Serialization
    toJSON(): any {
        return {
            id: this._id,
            userId: this._userId,
            userName: this._userName,
            date: this._date.toISOString(),
            note: this._note,
            createdAt: this._createdAt?.toISOString(),
        };
    }

    toPrisma(): any {
        return {
            id: this._id,
            userId: this._userId,
            userName: this._userName,
            date: this._date,
            note: this._note,
            createdAt: this._createdAt,
        };
    }
}
