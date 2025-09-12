import { WorkSession } from "@/contexts/types";
import { work_sessions } from "@prisma/client";

interface ISession {
        userId: number,
        userName: string,
        startTime: Date,
        endTime: Date | null,
        duration: number | null,
        activity: string | null,
        location: string | null,
        status: string,
        createdAt: Date,
        updatedAt: Date,
}

export default class Session {

    public id?: number;

    constructor(
            public userId: number,
            public userName: string,
            public startTime: Date,
            public endTime: Date | null,
            public duration: number | null,
            public activity: string | null,
            public location: string | null,
            public status: string,
            public createdAt: Date,
            public updatedAt: Date,
    ) {}

    static create(data: ISession) {
        return new Session(
            data.userId, 
            data.userName, 
            data.startTime ?? new Date(), 
            data.endTime ?? null, 
            data.duration ?? null, 
            data.activity ?? null, 
            data.location ?? null, 
            "active", 
            data.createdAt ?? new Date(), 
            data.updatedAt ?? new Date(), 
        );
    }

    static fromPrisma(data: work_sessions) {
        const session = new Session(
            data.userId,
            data.userName,
            new Date(data.startTime),
            data.endTime ? new Date(data.endTime) : null,
            data.duration,
            data.activity,
            data.location,
            data.status,
            new Date(data.createdAt),
            new Date(data.updatedAt),
        );
        session.id = data.id;
        return session;
    }

    toPrisma(): Omit<work_sessions, "id"> & {id?: number} {
        const data: Omit<work_sessions, "id"> & {id?: number} = {
            userId: this.userId,
            userName: this.userName,
            startTime: this.startTime,
            endTime: this.endTime,
            duration: this.duration,
            activity: this.activity,
            location: this.location,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
        if(this.id) 
            data.id = this.id;
        return data;
    }

    stop() {
        if(this.endTime || !this.startTime) 
            throw new Error("Erro ao finalizar sessão");
        
        this.endTime = new Date();
        this.duration = Math.floor(
            (this.endTime.getTime() - this.startTime.getTime() ) / 1000
        )

        return this
    }

}