import { DailyLogModel } from '../models/DailyLogModel';

export class DailyLogController {
  private dailyLogModel = new DailyLogModel();

  async getLog(id: number) {
    return this.dailyLogModel.findById(id);
  }

  async getAllLogs() {
    return this.dailyLogModel.findAll();
  }

  async createLog(data: any) {
    return this.dailyLogModel.create(data);
  }

  async updateLog(id: number, data: any) {
    return this.dailyLogModel.update(id, data);
  }

  async deleteLog(id: number) {
    return this.dailyLogModel.delete(id);
  }

  async getLogsByUser(userId: number) {
    return this.dailyLogModel.findByUserId(userId);
  }

  async getLogsByProject(projectId: number) {
    return this.dailyLogModel.findByProjectId(projectId);
  }
} 