import { WeeklyReportModel } from '../models/WeeklyReportModel';

export class WeeklyReportController {
  private weeklyReportModel = new WeeklyReportModel();

  async getReport(id: number) {
    return this.weeklyReportModel.findById(id);
  }

  async getAllReports() {
    return this.weeklyReportModel.findAll();
  }

  async createReport(data: any) {
    // Add validation if needed
    return this.weeklyReportModel.create(data);
  }

  async updateReport(id: number, data: any) {
    // Add validation if needed
    return this.weeklyReportModel.update(id, data);
  }

  async deleteReport(id: number) {
    return this.weeklyReportModel.delete(id);
  }

  async getReportsByUser(userId: number) {
    return this.weeklyReportModel.findByUserId(userId);
  }
} 