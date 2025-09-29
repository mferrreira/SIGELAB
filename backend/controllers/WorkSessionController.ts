import { WorkSessionService } from '../services/WorkSessionService';
import { WorkSessionRepository } from '../repositories/WorkSessionRepository';
import { HistoryService } from '../services/HistoryService';
import { HistoryRepository } from '../repositories/HistoryRepository';
import { UserRepository } from '../repositories/UserRepository';

export class WorkSessionController {
  private workSessionService: WorkSessionService;

  constructor() {
    const historyRepo = new HistoryRepository();
    const userRepo = new UserRepository();
    const historyService = new HistoryService(historyRepo, userRepo);
    this.workSessionService = new WorkSessionService(
      new WorkSessionRepository(),
      undefined,
      historyService
    );
  }

  async getSession(id: number) {
    try {
      const session = await this.workSessionService.getSessionById(id);
      return session ? session.toJSON() : null;
    } catch (error: any) {
      throw new Error(`Erro ao buscar sessão: ${error.message}`);
    }
  }

  async getAllSessions() {
    try {
      const sessions = await this.workSessionService.getAllSessions();
      return sessions.map(session => session.toJSON());
    } catch (error: any) {
      throw new Error(`Erro ao buscar sessões: ${error.message}`);
    }
  }

  async createSession(data: {
    userId: number;
    userName: string;
    activity?: string;
    location?: string;
    projectId?: number;
  }) {
    try {
      const session = await this.workSessionService.createSession(
        data.userId,
        data.userName,
        data.activity,
        data.location,
        data.projectId
      );
      return session.toJSON();
    } catch (error: any) {
      throw new Error(`Erro ao criar sessão: ${error.message}`);
    }
  }

  async updateSession(id: number, userId: number, data: {
    activity?: string;
    location?: string;
    status?: string;
    endTime?: string;
  }) {
    try {
      const session = await this.workSessionService.updateSession(id, userId, data);
      return session.toJSON();
    } catch (error: any) {
      throw new Error(`Erro ao atualizar sessão: ${error.message}`);
    }
  }

  async deleteSession(id: number, userId: number) {
    try {
      await this.workSessionService.deleteSession(id, userId);
      return { success: true };
    } catch (error: any) {
      throw new Error(`Erro ao excluir sessão: ${error.message}`);
    }
  }

  async getSessionsByUser(userId: number) {
    try {
      const sessions = await this.workSessionService.getUserSessions(userId);
      return sessions.map(session => session.toJSON());
    } catch (error: any) {
      throw new Error(`Erro ao buscar sessões do usuário: ${error.message}`);
    }
  }

  async getActiveSessions() {
    try {
      const sessions = await this.workSessionService.getSessionsByStatus('active');
      return sessions.map(session => session.toJSON());
    } catch (error: any) {
      throw new Error(`Erro ao buscar sessões ativas: ${error.message}`);
    }
  }
}