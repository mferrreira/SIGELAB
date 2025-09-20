import { HistoryService } from '../services/HistoryService';
import { HistoryRepository } from '../repositories/HistoryRepository';
import { UserRepository } from '../repositories/UserRepository';
import { History } from '../models/History';
import { HistoryEntity, HistoryAction } from '../models/History';

export class HistoryController {
  private historyService: HistoryService;

  constructor() {
    const historyRepository = new HistoryRepository();
    const userRepository = new UserRepository();
    this.historyService = new HistoryService(historyRepository, userRepository);
  }

  async getHistory(id: number): Promise<History | null> {
    return await this.historyService.findById(id);
  }

  async getAllHistory(): Promise<History[]> {
    return await this.historyService.findAll();
  }

  async getEntityHistory(entityType: HistoryEntity, entityId: number, limit?: number): Promise<History[]> {
    return await this.historyService.findEntityHistory(entityType, entityId, limit);
  }

  async getUserActivity(userId: number, limit?: number): Promise<History[]> {
    return await this.historyService.findUserActivity(userId, limit);
  }

  async getRecentActivity(limit?: number): Promise<History[]> {
    return await this.historyService.findRecent(limit);
  }

  async getActivityByDateRange(startDate: Date, endDate: Date): Promise<History[]> {
    return await this.historyService.findByDateRange(startDate, endDate);
  }

  async getActivityByAction(action: HistoryAction): Promise<History[]> {
    return await this.historyService.findByAction(action);
  }

  async getActivitySummary(startDate: Date, endDate: Date): Promise<any> {
    return await this.historyService.getActivitySummary(startDate, endDate);
  }

  async canUserViewHistory(userId: number): Promise<boolean> {
    return await this.historyService.canUserViewHistory(userId);
  }
}