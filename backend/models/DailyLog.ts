import { daily_logs } from '@prisma/client';

export interface IDailyLog {
    id?: number;
    userId: number;
    projectId?: number | null;
    date: Date;
    note?: string | null;
    workSessionId?: number | null;
    createdAt?: Date;
}

export class DailyLog {
    public id?: number;
    public userId: number;
    public projectId?: number | null;
    public date: Date;
    public note?: string | null;
    public workSessionId?: number | null;
    public createdAt?: Date;

    constructor(
        userId: number,
        date: Date,
        projectId?: number | null,
        note?: string | null,
        workSessionId?: number | null,
        id?: number,
        createdAt?: Date
    ) {
        this.id = id;
        this.userId = userId;
        this.projectId = projectId;
        this.date = date;
        this.note = note;
        this.workSessionId = workSessionId;
        this.createdAt = createdAt;
    }

    static fromPrisma(data: daily_logs): DailyLog {
        const dailyLog = new DailyLog(
            data.userId,
            new Date(data.date),
            data.projectId,
            data.note,
            data.workSessionId || null,
            data.id,
            new Date(data.createdAt)
        );
        return dailyLog;
    }

    toPrisma(): any {
        const data: any = {
            userId: this.userId,
            projectId: this.projectId,
            date: this.date,
            note: this.note,
            workSessionId: this.workSessionId
        };
        
        if (this.id !== undefined) {
            data.id = this.id;
        }
        if (this.createdAt !== undefined) {
            data.createdAt = this.createdAt;
        }
        
        return data;
    }

    static create(data: IDailyLog): DailyLog {
        return new DailyLog(
            data.userId,
            data.date,
            data.projectId,
            data.note,
            data.workSessionId,
            data.id,
            data.createdAt
        );
    }

    updateNote(note: string): DailyLog {
        this.note = note;
        return this;
    }

    updateProject(projectId: number | null): DailyLog {
        this.projectId = projectId;
        return this;
    }

    linkToWorkSession(workSessionId: number): DailyLog {
        this.workSessionId = workSessionId;
        return this;
    }

    isValid(): boolean {
        return !!(this.userId && this.date);
    }

    getFormattedDate(): string {
        return this.date.toISOString().split('T')[0];
    }

    getFormattedDateTime(): string {
        return this.date.toISOString();
    }

    toJSON(): any {
        return {
            id: this.id,
            userId: this.userId,
            projectId: this.projectId,
            date: this.date,
            note: this.note,
            workSessionId: this.workSessionId,
            createdAt: this.createdAt
        };
    }
}
