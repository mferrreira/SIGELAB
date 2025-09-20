import { LabResponsibility } from '../models/LabResponsibility';
import { LabResponsibilityService, ILabResponsibilityService } from '../services/LabResponsibilityService';
import { LabResponsibilityRepository } from '../repositories/LabResponsibilityRepository';
import { UserRepository } from '../repositories/UserRepository';
import { HistoryService } from '../services/HistoryService';
import { HistoryRepository } from '../repositories/HistoryRepository';

export class LabResponsibilityController {
    private labResponsibilityService: ILabResponsibilityService;

    constructor() {
        const labResponsibilityRepo = new LabResponsibilityRepository();
        const userRepo = new UserRepository();
        const historyRepo = new HistoryRepository();
        const historyService = new HistoryService(historyRepo, userRepo);
        
        this.labResponsibilityService = new LabResponsibilityService(labResponsibilityRepo, userRepo, historyService);
    }

    async getResponsibilityById(id: number): Promise<LabResponsibility> {
        const responsibility = await this.labResponsibilityService.findById(id);
        if (!responsibility) {
            throw new Error("Responsabilidade não encontrada");
        }
        return responsibility;
    }

    async getAllResponsibilities(): Promise<LabResponsibility[]> {
        return await this.labResponsibilityService.findAll();
    }

    async createResponsibility(data: {
        userId: number;
        userName: string;
        startTime: Date;
        endTime?: Date | null;
        notes?: string;
    }): Promise<LabResponsibility> {
        return await this.labResponsibilityService.create(data);
    }

    async updateResponsibility(id: number, data: {
        userId?: number;
        notes?: string;
    }): Promise<LabResponsibility> {
        return await this.labResponsibilityService.update(id, data);
    }

    async deleteResponsibility(id: number): Promise<void> {
        await this.labResponsibilityService.delete(id);
    }

    async getResponsibilitiesByUser(userId: number): Promise<LabResponsibility[]> {
        return await this.labResponsibilityService.getResponsibilitiesByUser(userId);
    }

    async getActiveResponsibility(): Promise<LabResponsibility | null> {
        return await this.labResponsibilityService.getActiveResponsibility();
    }

    async getResponsibilitiesByDateRange(startDate: Date, endDate: Date): Promise<LabResponsibility[]> {
        return await this.labResponsibilityService.getResponsibilitiesByDateRange(startDate, endDate);
    }

    async startResponsibility(userId: number, userName: string, notes?: string): Promise<LabResponsibility> {
        return await this.labResponsibilityService.startResponsibility(userId, userName, notes);
    }

    async endResponsibility(id: number, notes?: string): Promise<LabResponsibility> {
        return await this.labResponsibilityService.endResponsibility(id, notes);
    }

    async canUserStartResponsibility(userId: number): Promise<boolean> {
        return await this.labResponsibilityService.canUserStartResponsibility(userId);
    }

    async canUserEndResponsibility(userId: number, responsibilityId: number): Promise<boolean> {
        return await this.labResponsibilityService.canUserEndResponsibility(userId, responsibilityId);
    }
}