import SessionService from '../services/SessionService';
import SessionRepository from '../repositories/SessionRespository';
import Session from '../models/Session';

export class WorkSessionController {
  private sessionService = new SessionService(new SessionRepository());

  async getSession(id: number) {
    return this.sessionService.findById(id);
  }

  async getAllSessions() {
    return this.sessionService.findAll();
  }

  async createSession(data: any) {
      const session = await this.sessionService.create(data);
      return session?.toPrisma();
  }

  async updateSession(id: number, data: any) {
      //TODO adicionar ao Repository do user

      if(data.status === "completed")
        this.sessionService.stopSession(id)
      
      return this.sessionService.update(id, data);
  }

  async deleteSession(id: number) {
    return this.sessionService.delete(id);
  }

  async getSessionsByUser(userId: number) {
    return this.sessionService.findByUserId(userId);
  }

  async getActiveSessions() {
    return this.sessionService.findActiveSessions();
  }

  async getSessionsByProjectLeader(leaderId: number) {
    return this.sessionService.findSessionsByProjectLeader(leaderId);
  }

  async stopSession(sessionId: number) {
    return await this.sessionService.stopSession(sessionId);
  }

  async getWeeklyHours() {

  }
} 