import { WorkSession } from "../models/WorkSession";
import { WorkSessionRepository, IWorkSessionRepository } from "../repositories/WorkSessionRepository";
import { UserRepository } from "../repositories/UserRepository";
import { HistoryService } from "./HistoryService";

export class WorkSessionService {
    private workSessionRepo: IWorkSessionRepository;
    private userRepo?: UserRepository;
    private historyService?: HistoryService;

    constructor(
        workSessionRepo?: IWorkSessionRepository,
        userRepo?: UserRepository,
        historyService?: HistoryService
    ) {
        this.workSessionRepo = workSessionRepo || new WorkSessionRepository();
        this.userRepo = userRepo;
        this.historyService = historyService;
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
        location?: string
    ): Promise<WorkSession> {
        // Check if user already has an active session
        const activeSession = await this.workSessionRepo.findActiveByUserId(userId);
        if (activeSession) {
            throw new Error("Usuário já possui uma sessão ativa");
        }

        const session = WorkSession.create(userId, userName, activity, location);
        const created = await this.workSessionRepo.create(session);

        // Record history
        if (this.historyService) {
            await this.historyService.recordAction(
                "WORK_SESSION",
                created.id!,
                "CREATE",
                userId,
                `Sessão de trabalho iniciada: ${activity || 'Atividade não especificada'}`,
                created.toJSON()
            );
        }

        return created;
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
        
        // Se estamos encerrando a sessão, fazer isso primeiro
        if (data.endTime !== undefined) {
            session.endSession(new Date(data.endTime));
        } else if (data.status !== undefined) {
            // Só atualizar status se não estamos encerrando
            session.setStatus(data.status);
        }
        
        // Atualizar outros campos
        if (data.activity !== undefined) {
            session.setActivity(data.activity);
        }
        if (data.location !== undefined) {
            session.setLocation(data.location);
        }

        const updated = await this.workSessionRepo.update(id, session);

        // Record history
        if (this.historyService) {
            await this.historyService.recordAction(
                "WORK_SESSION",
                id,
                "UPDATE",
                userId,
                "Sessão de trabalho atualizada",
                { oldData, newData: updated.toJSON() }
            );
        }

        return updated;
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

        // Record history
        if (this.historyService) {
            await this.historyService.recordAction(
                "WORK_SESSION",
                id,
                "DELETE",
                userId,
                "Sessão de trabalho excluída",
                sessionData
            );
        }
    }

    async getUserSessions(userId: number): Promise<WorkSession[]> {
        return await this.workSessionRepo.findByUserId(userId);
    }

    async getSessionsByStatus(status: string): Promise<WorkSession[]> {
        return await this.workSessionRepo.findByStatus(status);
    }
}