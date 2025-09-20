import { prisma } from '@/lib/database/prisma';
import { WeeklyReport } from '../models/WeeklyReport';

export interface IWeeklyReportRepository {
  findById(id: number): Promise<WeeklyReport | null>;
  findAll(): Promise<WeeklyReport[]>;
  create(report: WeeklyReport): Promise<WeeklyReport>;
  update(id: number, report: WeeklyReport): Promise<WeeklyReport>;
  delete(id: number): Promise<void>;
  findByUserId(userId: number): Promise<WeeklyReport[]>;
  findByWeekRange(startDate: Date, endDate: Date): Promise<WeeklyReport[]>;
  findByYear(year: number): Promise<WeeklyReport[]>;
  findByUserAndWeek(userId: number, weekStart: Date, weekEnd: Date): Promise<WeeklyReport | null>;
  findCurrentWeekReports(): Promise<WeeklyReport[]>;
  findPastWeekReports(): Promise<WeeklyReport[]>;
  findReportsByDateRange(startDate: Date, endDate: Date): Promise<WeeklyReport[]>;
  countByUser(userId: number): Promise<number>;
  countByYear(year: number): Promise<number>;
  getLatestReportByUser(userId: number): Promise<WeeklyReport | null>;
}

export class WeeklyReportRepository implements IWeeklyReportRepository {
  private getIncludeOptions() {
    return {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          roles: true
        }
      }
    };
  }

  async findById(id: number): Promise<WeeklyReport | null> {
    const data = await prisma.weekly_reports.findUnique({
      where: { id },
      include: this.getIncludeOptions()
    });
    return data ? WeeklyReport.fromPrisma(data) : null;
  }

  async findAll(): Promise<WeeklyReport[]> {
    const data = await prisma.weekly_reports.findMany({
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'desc' }
    });
    return data.map(report => WeeklyReport.fromPrisma(report));
  }

  async create(report: WeeklyReport): Promise<WeeklyReport> {
    const data = await prisma.weekly_reports.create({
      data: report.toPrisma(),
      include: this.getIncludeOptions()
    });
    return WeeklyReport.fromPrisma(data);
  }

  async update(id: number, report: WeeklyReport): Promise<WeeklyReport> {
    const data = await prisma.weekly_reports.update({
      where: { id },
      data: report.toPrisma(),
      include: this.getIncludeOptions()
    });
    return WeeklyReport.fromPrisma(data);
  }

  async delete(id: number): Promise<void> {
    await prisma.weekly_reports.delete({
      where: { id }
    });
  }

  async findByUserId(userId: number): Promise<WeeklyReport[]> {
    const data = await prisma.weekly_reports.findMany({
      where: { userId },
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'desc' }
    });
    return data.map(report => WeeklyReport.fromPrisma(report));
  }

  async findByWeekRange(startDate: Date, endDate: Date): Promise<WeeklyReport[]> {
    const data = await prisma.weekly_reports.findMany({
      where: {
        weekStart: { gte: startDate },
        weekEnd: { lte: endDate }
      },
      include: this.getIncludeOptions(),
      orderBy: { weekStart: 'asc' }
    });
    return data.map(report => WeeklyReport.fromPrisma(report));
  }

  async findByYear(year: number): Promise<WeeklyReport[]> {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
    
    const data = await prisma.weekly_reports.findMany({
      where: {
        weekStart: { gte: startOfYear },
        weekEnd: { lte: endOfYear }
      },
      include: this.getIncludeOptions(),
      orderBy: { weekStart: 'asc' }
    });
    return data.map(report => WeeklyReport.fromPrisma(report));
  }

  async findByUserAndWeek(userId: number, weekStart: Date, weekEnd: Date): Promise<WeeklyReport | null> {
    const data = await prisma.weekly_reports.findFirst({
      where: {
        userId,
        weekStart: { gte: weekStart },
        weekEnd: { lte: weekEnd }
      },
      include: this.getIncludeOptions()
    });
    return data ? WeeklyReport.fromPrisma(data) : null;
  }

  async findCurrentWeekReports(): Promise<WeeklyReport[]> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return this.findByWeekRange(startOfWeek, endOfWeek);
  }

  async findPastWeekReports(): Promise<WeeklyReport[]> {
    const now = new Date();
    const endOfLastWeek = new Date(now);
    endOfLastWeek.setDate(now.getDate() - now.getDay() - 1);
    endOfLastWeek.setHours(23, 59, 59, 999);

    const data = await prisma.weekly_reports.findMany({
      where: {
        weekEnd: { lte: endOfLastWeek }
      },
      include: this.getIncludeOptions(),
      orderBy: { weekEnd: 'desc' }
    });
    return data.map(report => WeeklyReport.fromPrisma(report));
  }

  async findReportsByDateRange(startDate: Date, endDate: Date): Promise<WeeklyReport[]> {
    const data = await prisma.weekly_reports.findMany({
      where: {
        OR: [
          {
            weekStart: { gte: startDate, lte: endDate }
          },
          {
            weekEnd: { gte: startDate, lte: endDate }
          },
          {
            weekStart: { lte: startDate },
            weekEnd: { gte: endDate }
          }
        ]
      },
      include: this.getIncludeOptions(),
      orderBy: { weekStart: 'asc' }
    });
    return data.map(report => WeeklyReport.fromPrisma(report));
  }

  async countByUser(userId: number): Promise<number> {
    return await prisma.weekly_reports.count({
      where: { userId }
    });
  }

  async countByYear(year: number): Promise<number> {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
    
    return await prisma.weekly_reports.count({
      where: {
        weekStart: { gte: startOfYear },
        weekEnd: { lte: endOfYear }
      }
    });
  }

  async getLatestReportByUser(userId: number): Promise<WeeklyReport | null> {
    const data = await prisma.weekly_reports.findFirst({
      where: { userId },
      include: this.getIncludeOptions(),
      orderBy: { createdAt: 'desc' }
    });
    return data ? WeeklyReport.fromPrisma(data) : null;
  }
}

