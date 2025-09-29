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

            if (this.historyService) {
                await this.historyService.recordAction(
                    "WORK_SESSION",
                    activeSession.id!,
                    "AUTO-END",
                    userId,
                    `Sessão automaticamente encerrada ao iniciar nova sessão`,
                    { oldData: activeSession.toJSON(), newData: { status: 'completed', endTime, duration } }
                );
            }
        }

        const session = WorkSession.create(userId, userName, activity, location, projectId);
        const created = await this.workSessionRepo.create(session);

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

        const updated = await this.workSessionRepo.update(id, session);

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