import { work_sessions } from '@prisma/client';

export class WorkSession {
    private _id?: number;
    private _userId: number;
    private _userName: string;
    private _startTime: Date;
    private _endTime?: Date | null;
    private _duration?: number | null;
    private _activity?: string | null;
    private _location?: string | null;
    private _status: string;
    private _createdAt?: Date;
    private _updatedAt?: Date;

    constructor(
        userId: number,
        userName: string,
        startTime: Date = new Date(),
        endTime?: Date | null,
        duration?: number | null,
        activity?: string | null,
        location?: string | null,
        status: string = "active",
        id?: number,
        createdAt?: Date,
        updatedAt?: Date
    ) {
        this._userId = userId;
        this._userName = userName;
        this._startTime = startTime;
        this._endTime = endTime;
        this._duration = duration;
        this._activity = activity;
        this._location = location;
        this._status = status;
        this._id = id;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

    // Getters
    get id(): number | undefined { return this._id; }
    get userId(): number { return this._userId; }
    get userName(): string { return this._userName; }
    get startTime(): Date { return this._startTime; }
    get endTime(): Date | null | undefined { return this._endTime; }
    get duration(): number | null | undefined { return this._duration; }
    get activity(): string | null | undefined { return this._activity; }
    get location(): string | null | undefined { return this._location; }
    get status(): string { return this._status; }
    get createdAt(): Date | undefined { return this._createdAt; }
    get updatedAt(): Date | undefined { return this._updatedAt; }

    // Setters
    setActivity(activity: string | null): WorkSession {
        this._activity = activity;
        return this;
    }

    setLocation(location: string | null): WorkSession {
        this._location = location;
        return this;
    }

    setStatus(status: string): WorkSession {
        this._status = status;
        return this;
    }

    // Business logic methods
    endSession(endTime?: Date): WorkSession {
        if (this._status !== "active") {
            throw new Error("Sessão não está ativa");
        }

        this._endTime = endTime || new Date();
        this._status = "completed";
        this._duration = this.calculateDuration();
        return this;
    }

    pauseSession(): WorkSession {
        if (this._status !== "active") {
            throw new Error("Sessão não está ativa");
        }

        this._status = "paused";
        return this;
    }

    resumeSession(): WorkSession {
        if (this._status !== "paused") {
            throw new Error("Sessão não está pausada");
        }

        this._status = "active";
        return this;
    }

    calculateDuration(): number {
        if (!this._endTime) {
            return 0;
        }

        const diffMs = this._endTime.getTime() - this._startTime.getTime();
        return diffMs / (1000 * 60 * 60); // Convert to hours
    }

    isActive(): boolean {
        return this._status === "active";
    }

    isPaused(): boolean {
        return this._status === "paused";
    }

    isCompleted(): boolean {
        return this._status === "completed";
    }

    getDurationFormatted(): string {
        const hours = this._duration || this.calculateDuration();
        const h = Math.floor(hours);
        const m = Math.floor((hours - h) * 60);
        return `${h}h ${m}m`;
    }

    // Validation
    isValid(): boolean {
        if (!this._userId || !this._userName?.trim()) {
            return false;
        }

        if (this._endTime && this._endTime <= this._startTime) {
            return false;
        }

        return true;
    }

    // Factory methods
    static create(
        userId: number,
        userName: string,
        activity?: string,
        location?: string
    ): WorkSession {
        const session = new WorkSession(
            userId,
            userName,
            new Date(),
            null,
            null,
            activity,
            location
        );

        if (!session.isValid()) {
            throw new Error("Dados inválidos para criar sessão de trabalho");
        }

        return session;
    }

    static fromPrisma(data: work_sessions): WorkSession {
        return new WorkSession(
            data.userId,
            data.userName,
            data.startTime,
            data.endTime,
            data.duration,
            data.activity,
            data.location,
            data.status,
            data.id,
            data.createdAt,
            data.updatedAt
        );
    }

    // Convert to Prisma format
    toPrisma(): Omit<work_sessions, 'id' | 'createdAt' | 'updatedAt'> {
        return {
            userId: this._userId,
            userName: this._userName,
            startTime: this._startTime,
            endTime: this._endTime,
            duration: this._duration,
            activity: this._activity,
            location: this._location,
            status: this._status
        };
    }

    // Convert to JSON
    toJSON(): any {
        return {
            id: this._id,
            userId: this._userId,
            userName: this._userName,
            startTime: this._startTime,
            endTime: this._endTime,
            duration: this._duration,
            activity: this._activity,
            location: this._location,
            status: this._status,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
            isActive: this.isActive(),
            isPaused: this.isPaused(),
            isCompleted: this.isCompleted(),
            durationFormatted: this.getDurationFormatted()
        };
    }
}

