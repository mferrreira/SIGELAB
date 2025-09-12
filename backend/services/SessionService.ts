import SessionRepository from "@/backend/repositories/SessionRespository"
import Session from "../models/Session"
import { DailyLogService } from "./DailyLogService"
import { DailyLogRepository } from "../repositories/DailyLogRepository"

export default class SessionService {
    private dailyLogService: DailyLogService;

    constructor(private repo: SessionRepository) {
        this.dailyLogService = new DailyLogService(new DailyLogRepository());
    }

    async create(data: any): Promise<Session | null> {
        console.log("SessionService.create called with:", data);
        
        // Validate user exists
        const user = await this.repo.findUserById(data.userId);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const session = Session.create({
            ...data,
            userName: user.name
        });
        
        console.log("Session created:", session);
        
        const result = await this.repo.create(session);
        console.log("Session saved to DB:", result);
        
        return result;
    }

    async update(id: number, data: Partial<Session>) {
        const currentSession = await this.repo.findById(id);
        if (!currentSession)
            throw new Error("Sessão não encontrada");

        // Update the session with new data
        Object.assign(currentSession, data);
        
        return await this.repo.update(currentSession);
    }

    async delete(id: number) {
        return await this.repo.delete(id);
    }

    async stopSession(sessionId: number): Promise<Session> {
        const session = await this.repo.findById(sessionId);

        if (!session) 
            throw new Error("Sessão não encontrada");

        session.stop();

        const updated = await this.repo.update(session);

        // Auto-create daily log when session is completed
        try {
            await this.dailyLogService.createFromWorkSession({
                id: updated.id,
                userId: updated.userId,
                projectId: null, // Could be enhanced to track project in work sessions
                duration: updated.duration,
                activity: updated.activity,
                location: updated.location
            });
        } catch (error) {
            console.error("Failed to create daily log from work session:", error);
            // Don't fail the session stop if daily log creation fails
        }

        return updated;
    }


    async findByUserId(userId: number): Promise<Session[] | null> {
        const sessions = await this.repo.findByUserId(userId);
        return sessions;
    }

    async deleteSession(id: number) {
        await this.repo.delete(id);
    }

    async findById(id: number): Promise<Session | null> {
        const session = await this.repo.findById(id);
        return session;
    }

    async findActiveSessions() {
        return await this.repo.findActiveSessions();
    }

    async findSessionsByProjectLeader(leaderId: number) {
        return await this.repo.findSessionsByProjectLeader(leaderId);
    }

    async findAll() {
        return await this.repo.findAll();
    }
}