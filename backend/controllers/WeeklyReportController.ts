import { WeeklyReportService } from '../services/WeeklyReportService';
import { WeeklyReportRepository } from '../repositories/WeeklyReportRepository';
import { UserRepository } from '../repositories/UserRepository';
import { DailyLogRepository } from '../repositories/DailyLogRepository';
import { WeeklyReport } from '../models/WeeklyReport';

export class WeeklyReportController {
  private weeklyReportService: WeeklyReportService;

  constructor() {
    const weeklyReportRepository = new WeeklyReportRepository();
    const userRepository = new UserRepository();
    const dailyLogRepository = new DailyLogRepository();
    this.weeklyReportService = new WeeklyReportService(weeklyReportRepository, userRepository, dailyLogRepository);
  }

  async getReport(id: number): Promise<WeeklyReport | null> {
    return await this.weeklyReportService.findById(id);
  }

  async getAllReports(): Promise<WeeklyReport[]> {
    return await this.weeklyReportService.findAll();
  }

  async createReport(data: any, creatorId: number): Promise<WeeklyReport> {
    return await this.weeklyReportService.create(data, creatorId);
  }

  async updateReport(id: number, data: any, userId: number): Promise<WeeklyReport> {
    return await this.weeklyReportService.update(id, data, userId);
  }

  async deleteReport(id: number, userId: number): Promise<void> {
    return await this.weeklyReportService.delete(id, userId);
  }

  async getReportsByUser(userId: number): Promise<WeeklyReport[]> {
    return await this.weeklyReportService.findByUserId(userId);
  }

  async getReportsByWeekRange(startDate: Date, endDate: Date): Promise<WeeklyReport[]> {
    return await this.weeklyReportService.findByWeekRange(startDate, endDate);
  }

  async getReportsByYear(year: number): Promise<WeeklyReport[]> {
    return await this.weeklyReportService.findByYear(year);
  }

  async getCurrentWeekReports(): Promise<WeeklyReport[]> {
    return await this.weeklyReportService.findCurrentWeekReports();
  }

  async getPastWeekReports(): Promise<WeeklyReport[]> {
    return await this.weeklyReportService.findPastWeekReports();
  }

  async generateWeeklyReport(userId: number, weekStart: Date, weekEnd: Date): Promise<WeeklyReport> {
    return await this.weeklyReportService.generateWeeklyReport(userId, weekStart, weekEnd);
  }

  async updateReportSummary(id: number, summary: string, userId: number): Promise<WeeklyReport> {
    return await this.weeklyReportService.updateReportSummary(id, summary, userId);
  }

  async getReportStatistics(): Promise<any> {
    return await this.weeklyReportService.getReportStatistics();
  }

  async canUserManageReport(reportId: number, userId: number): Promise<boolean> {
    return await this.weeklyReportService.canUserManageReport(reportId, userId);
  }

  async canUserViewReport(reportId: number, userId: number): Promise<boolean> {
    return await this.weeklyReportService.canUserViewReport(reportId, userId);
  }
} 