import { UserSchedule } from '../models/UserSchedule';
import { UserScheduleService, IUserScheduleService } from '../services/UserScheduleService';
import { UserScheduleRepository } from '../repositories/UserScheduleRepository';
import { UserRepository } from '../repositories/UserRepository';
import { HistoryService } from '../services/HistoryService';
import { HistoryRepository } from '../repositories/HistoryRepository';

export class UserScheduleController {
    private userScheduleService: IUserScheduleService;

    constructor() {
        const userScheduleRepo = new UserScheduleRepository();
        const userRepo = new UserRepository();
        const historyRepo = new HistoryRepository();
        const historyService = new HistoryService(historyRepo, userRepo);
        
        this.userScheduleService = new UserScheduleService(userScheduleRepo, userRepo, historyService);
    }

    async getSchedule(id: number): Promise<UserSchedule> {
        const schedule = await this.userScheduleService.findById(id);
        if (!schedule) {
            throw new Error("Horário não encontrado");
        }
        return schedule;
    }

    async getAllSchedules(): Promise<UserSchedule[]> {
        return await this.userScheduleService.findAll();
    }

    async createSchedule(data: {
        userId: number;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isActive?: boolean;
    }): Promise<UserSchedule> {
        return await this.userScheduleService.create({
            ...data,
            isActive: data.isActive ?? true
        });
    }

    async updateSchedule(id: number, data: {
        userId?: number;
        dayOfWeek?: number;
        startTime?: string;
        endTime?: string;
        isActive?: boolean;
    }): Promise<UserSchedule> {
        return await this.userScheduleService.update(id, data);
    }

    async deleteSchedule(id: number): Promise<void> {
        await this.userScheduleService.delete(id);
    }

    // Query operations (used by API)
    async getSchedulesByUser(userId: number): Promise<UserSchedule[]> {
        return await this.userScheduleService.getSchedulesByUser(userId);
    }
}