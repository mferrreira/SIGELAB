import { WorkSession } from "../models/WorkSession";
import { WorkSessionRepository, IWorkSessionRepository } from "../repositories/WorkSessionRepository";
import { UserRepository } from "../repositories/UserRepository";

export class WorkSessionService {
    private workSessionRepo: IWorkSessionRepository;
    private userRepo?: UserRepository;

    constructor(
        workSessionRepo?: IWorkSessionRepository,
        userRepo?: UserRepository,
    ) {
        this.workSessionRepo = workSessionRepo || new WorkSessionRepository();
        this.userRepo = userRepo || new UserRepository();
    }

    async getSessionById(id: number): Promise<WorkSession | null> {
        return await this.workSessionRepo.findById(id);
    }

    async getAllSessions(): Promise<WorkSession[]> {
        return await this.workSessionRepo.findAll();
    }

    async createSession(
        userId: number,
        userName: string,
        activity?: string,
        location?: string,
        projectId?: number
    ): Promise<WorkSession> {
        // Encerrar automaticamente qualquer sessão ativa existente para este usuário
        const activeSession = await this.workSessionRepo.findActiveByUserId(userId);
        if (activeSession) {
            console.log(`Encerrando sessão ativa ID ${activeSession.id} para usuário ${userId} antes de criar nova sessão`);
            const endTime = new Date();
            const duration = (endTime.getTime() - activeSession.startTime.getTime()) / (1000 * 60 * 60); // em horas
            
            await this.workSessionRepo.update(activeSession.id!, {
                endTime: endTime,
                duration: duration,
                status: 'completed'
            });
        }

        const session = WorkSession.create(userId, userName, activity, location, projectId);
        return await this.workSessionRepo.create(session);
    }

    async updateSession(id: number, userId: number, data: {
        activity?: string;
        location?: string;
        status?: string;
        endTime?: string;
    }): Promise<WorkSession> {
        const session = await this.workSessionRepo.findById(id);
        if (!session) {
            throw new Error("Sessão não encontrada");
        }
        
        if (session.userId !== userId) {
            throw new Error("Não autorizado a atualizar esta sessão");
        }

        const oldData = session.toJSON();
        
        if (data.endTime !== undefined) {
            session.endSession(new Date(data.endTime));
        } else if (data.status !== undefined) {
            session.setStatus(data.status);
        }
        
        if (data.activity !== undefined) {
            session.setActivity(data.activity);
        }
        if (data.location !== undefined) {
            session.setLocation(data.location);
        }

        return await this.workSessionRepo.update(id, session);
    }

    async deleteSession(id: number, userId: number): Promise<void> {
        const session = await this.workSessionRepo.findById(id);
        if (!session) {
            throw new Error("Sessão não encontrada");
        }

        if (session.userId !== userId) {
            throw new Error("Não autorizado a excluir esta sessão");
        }

        const sessionData = session.toJSON();
        await this.workSessionRepo.delete(id);
    }

    async getUserSessions(userId: number): Promise<WorkSession[]> {
        return await this.workSessionRepo.findByUserId(userId);
    }

    async getSessionsByStatus(status: string): Promise<WorkSession[]> {
        return await this.workSessionRepo.findByStatus(status);
    }
}