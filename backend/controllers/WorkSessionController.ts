import { WorkSessionModel } from '../models/WorkSessionModel';

export class WorkSessionController {
  private workSessionModel = new WorkSessionModel();

  async getSession(id: number) {
    return this.workSessionModel.findById(id);
  }

  async getAllSessions() {
    return this.workSessionModel.findAll();
  }

  async createSession(data: any) {
    // Add validation if needed
    return this.workSessionModel.create(data);
  }

  async updateSession(id: number, data: any) {
    // Add validation if needed
    return this.workSessionModel.update(id, data);
  }

  async deleteSession(id: number) {
    return this.workSessionModel.delete(id);
  }

  async getSessionsByUser(userId: number) {
    return this.workSessionModel.findByUserId(userId);
  }

  async getActiveSessions() {
    return this.workSessionModel.findActiveSessions();
  }
} 