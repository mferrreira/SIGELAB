import { History } from '../models/History';
import { HistoryRepository, IHistoryRepository } from '../repositories/HistoryRepository';
import { UserRepository } from '../repositories/UserRepository';
import { HistoryEntity, HistoryAction } from '../models/History';

export interface IHistoryService {
  findById(id: number): Promise<History | null>;
  findAll(): Promise<History[]>;
  create(data: Omit<History, 'id' | 'performedAt'>, performerId: number): Promise<History>;
  findByEntity(entityType: HistoryEntity, entityId: number): Promise<History[]>;
  findByUser(userId: number): Promise<History[]>;
  findByAction(action: HistoryAction): Promise<History[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<History[]>;
  findRecent(limit?: number): Promise<History[]>;
  findEntityHistory(entityType: HistoryEntity, entityId: number, limit?: number): Promise<History[]>;
  findUserActivity(userId: number, limit?: number): Promise<History[]>;
  getActivitySummary(startDate: Date, endDate: Date): Promise<any>;
  recordEntityCreation(entityType: HistoryEntity, entityId: number, performerId: number, data: any): Promise<History>;
  recordEntityUpdate(entityType: HistoryEntity, entityId: number, performerId: number, oldData: any, newData: any): Promise<History>;
  recordEntityDeletion(entityType: HistoryEntity, entityId: number, performerId: number, data: any): Promise<History>;
  recordAction(entityType: HistoryEntity, entityId: number, action: HistoryAction, performerId: number, description?: string, metadata?: any): Promise<History>;
  canUserViewHistory(userId: number): Promise<boolean>;
}

export class HistoryService implements IHistoryService {
  constructor(
    private historyRepository: IHistoryRepository,
    private userRepository: UserRepository
  ) {}

  async findById(id: number): Promise<History | null> {
    return await this.historyRepository.findById(id);
  }

  async findAll(): Promise<History[]> {
    return await this.historyRepository.findAll();
  }

  async create(data: Omit<History, 'id' | 'performedAt'>, performerId: number): Promise<History> {
    // Validate performer exists
    const performer = await this.userRepository.findById(performerId);
    if (!performer) {
      throw new Error('Performer not found');
    }

    const history = History.create({
      ...data,
      performedBy: performerId
    });
    
    return await this.historyRepository.create(history);
  }

  async findByEntity(entityType: HistoryEntity, entityId: number): Promise<History[]> {
    return await this.historyRepository.findByEntity(entityType, entityId);
  }

  async findByUser(userId: number): Promise<History[]> {
    return await this.historyRepository.findByUser(userId);
  }

  async findByAction(action: HistoryAction): Promise<History[]> {
    return await this.historyRepository.findByAction(action);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<History[]> {
    return await this.historyRepository.findByDateRange(startDate, endDate);
  }

  async findRecent(limit: number = 50): Promise<History[]> {
    return await this.historyRepository.findRecent(limit);
  }

  async findEntityHistory(entityType: HistoryEntity, entityId: number, limit: number = 20): Promise<History[]> {
    return await this.historyRepository.findEntityHistory(entityType, entityId, limit);
  }

  async findUserActivity(userId: number, limit: number = 20): Promise<History[]> {
    return await this.historyRepository.findUserActivity(userId, limit);
  }

  async getActivitySummary(startDate: Date, endDate: Date): Promise<any> {
    return await this.historyRepository.getActivitySummary(startDate, endDate);
  }

  // Convenience methods for common operations
  async recordEntityCreation(entityType: HistoryEntity, entityId: number, performerId: number, data: any): Promise<History> {
    return await this.create({
      entityType,
      entityId,
      action: 'CREATE',
      oldValues: null,
      newValues: data,
      description: `Created ${entityType.toLowerCase().replace('_', ' ')}`
    }, performerId);
  }

  async recordEntityUpdate(entityType: HistoryEntity, entityId: number, performerId: number, oldData: any, newData: any): Promise<History> {
    return await this.create({
      entityType,
      entityId,
      action: 'UPDATE',
      oldValues: oldData,
      newValues: newData,
      description: `Updated ${entityType.toLowerCase().replace('_', ' ')}`
    }, performerId);
  }

  async recordEntityDeletion(entityType: HistoryEntity, entityId: number, performerId: number, data: any): Promise<History> {
    return await this.create({
      entityType,
      entityId,
      action: 'DELETE',
      oldValues: data,
      newValues: null,
      description: `Deleted ${entityType.toLowerCase().replace('_', ' ')}`
    }, performerId);
  }

  async recordAction(entityType: HistoryEntity, entityId: number, action: HistoryAction, performerId: number, description?: string, metadata?: any): Promise<History> {
    return await this.create({
      entityType,
      entityId,
      action,
      oldValues: null,
      newValues: metadata,
      description: description || `${action} ${entityType.toLowerCase().replace('_', ' ')}`
    }, performerId);
  }

  async canUserViewHistory(userId: number): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return false;
    }

    // Admin and project managers can view all history
    return user.roles.includes('ADMIN') || user.roles.includes('GERENTE_PROJETO');
  }
}