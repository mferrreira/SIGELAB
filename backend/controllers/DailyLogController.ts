import { DailyLogService } from '../services/DailyLogService';
import { DailyLogRepository } from '../repositories/DailyLogRepository';
import { DailyLog } from '../models/DailyLog';

export class DailyLogController {
  private dailyLogService = new DailyLogService(new DailyLogRepository());

  async getLog(id: number) {
    return this.dailyLogService.findById(id);
  }

  async getAllLogs() {
    return this.dailyLogService.findAll();
  }

  async createLog(data: any) {
    const dailyLog = await this.dailyLogService.create(data);
    return dailyLog.toPrisma();
  }

  async updateLog(id: number, data: any) {
    const dailyLog = await this.dailyLogService.update(id, data);
    return dailyLog.toPrisma();
  }

  async deleteLog(id: number) {
    return this.dailyLogService.delete(id);
  }

  async getLogsByUser(userId: number) {
    return this.dailyLogService.findByUserId(userId);
  }

  async getLogsByProject(projectId: number) {
    return this.dailyLogService.findByProjectId(projectId);
  }

  async getLogsByWorkSession(workSessionId: number) {
    return this.dailyLogService.findByWorkSessionId(workSessionId);
  }

  async getLogsByDateRange(userId: number, startDate: Date, endDate: Date) {
    return this.dailyLogService.findByDateRange(userId, startDate, endDate);
  }

  async getWeeklySummary(userId: number, weekStart: Date, weekEnd: Date) {
    return this.dailyLogService.getWeeklySummary(userId, weekStart, weekEnd);
  }

  async createFromWorkSession(workSessionData: any) {
    const dailyLog = await this.dailyLogService.createFromWorkSession(workSessionData);
    return dailyLog.toPrisma();
  }
} 