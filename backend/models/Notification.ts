export interface INotification {
    id?: number;
    userId: number;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    read: boolean;
    createdAt: string;
    readAt?: string | null;
}

export enum NotificationType {
    TASK_REVIEW_REQUEST = 'TASK_REVIEW_REQUEST',
    TASK_APPROVED = 'TASK_APPROVED',
    TASK_REJECTED = 'TASK_REJECTED',
    TASK_ASSIGNED = 'TASK_ASSIGNED',
    PROJECT_INVITATION = 'PROJECT_INVITATION',
    SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT'
}

export class Notification {
    private _id?: number;
    private _userId: number;
    private _type: NotificationType;
    private _title: string;
    private _message: string;
    private _data?: any;
    private _read: boolean;
    private _createdAt: string;
    private _readAt?: string | null;

    constructor(data: INotification) {
        this._id = data.id;
        this._userId = data.userId;
        this._type = data.type;
        this._title = data.title;
        this._message = data.message;
        this._data = data.data;
        this._read = data.read;
        this._createdAt = data.createdAt;
        this._readAt = data.readAt;
    }

    // Getters
    get id(): number | undefined {
        return this._id;
    }

    get userId(): number {
        return this._userId;
    }

    get type(): NotificationType {
        return this._type;
    }

    get title(): string {
        return this._title;
    }

    get message(): string {
        return this._message;
    }

    get data(): any {
        return this._data;
    }

    get read(): boolean {
        return this._read;
    }

    get createdAt(): string {
        return this._createdAt;
    }

    get readAt(): string | null {
        return this._readAt || null;
    }

    // Setters
    markAsRead(): void {
        this._read = true;
        this._readAt = new Date().toISOString();
    }

    markAsUnread(): void {
        this._read = false;
        this._readAt = null;
    }

    updateData(data: any): void {
        this._data = data;
    }

    // Validation
    validate(): string[] {
        const errors: string[] = [];

        if (!this._userId || this._userId <= 0) {
            errors.push('ID do usuário é obrigatório');
        }

        if (!this._title || this._title.trim().length === 0) {
            errors.push('Título é obrigatório');
        }

        if (!this._message || this._message.trim().length === 0) {
            errors.push('Mensagem é obrigatória');
        }

        if (!this._type) {
            errors.push('Tipo de notificação é obrigatório');
        }

        return errors;
    }

    toJSON(): INotification {
        return {
            id: this._id,
            userId: this._userId,
            type: this._type,
            title: this._title,
            message: this._message,
            data: this._data,
            read: this._read,
            createdAt: this._createdAt,
            readAt: this._readAt
        };
    }

    toPrisma(): any {
        return {
            userId: this._userId,
            type: this._type,
            title: this._title,
            message: this._message,
            data: this._data ? JSON.stringify(this._data) : null,
            read: this._read,
            createdAt: new Date(this._createdAt),
            readAt: this._readAt ? new Date(this._readAt) : null
        };
    }

    static fromPrisma(data: any): Notification {
        return new Notification({
            id: data.id,
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            data: data.data ? JSON.parse(data.data) : null,
            read: data.read,
            createdAt: data.createdAt.toISOString(),
            readAt: data.readAt ? data.readAt.toISOString() : null
        });
    }

    static create(data: Omit<INotification, 'id' | 'read' | 'createdAt' | 'readAt'>): Notification {
        const notification = new Notification({
            ...data,
            read: false,
            createdAt: new Date().toISOString(),
            readAt: null
        });

        const errors = notification.validate();
        if (errors.length > 0) {
            throw new Error(`Dados inválidos: ${errors.join(', ')}`);
        }

        return notification;
    }
}


