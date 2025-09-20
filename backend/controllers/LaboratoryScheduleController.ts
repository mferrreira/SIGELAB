import { LaboratorySchedule } from '../models/LaboratorySchedule';
import { LaboratoryScheduleService, ILaboratoryScheduleService } from '../services/LaboratoryScheduleService';
import { LaboratoryScheduleRepository } from '../repositories/LaboratoryScheduleRepository';
import { UserRepository } from '../repositories/UserRepository';
import { HistoryService } from '../services/HistoryService';
import { HistoryRepository } from '../repositories/HistoryRepository';

export class LaboratoryScheduleController {
    private laboratoryScheduleService: ILaboratoryScheduleService;

    constructor() {
        const laboratoryScheduleRepo = new LaboratoryScheduleRepository();
        const userRepo = new UserRepository();
        const historyRepo = new HistoryRepository();
        const historyService = new HistoryService(historyRepo, userRepo);
        
        this.laboratoryScheduleService = new LaboratoryScheduleService(laboratoryScheduleRepo, userRepo, historyService);
    }

    async getScheduleById(id: number): Promise<LaboratorySchedule> {
        const schedule = await this.laboratoryScheduleService.findById(id);
        if (!schedule) {
            throw new Error("Horário do laboratório não encontrado");
        }
        return schedule;
    }

    async getAllSchedules(): Promise<LaboratorySchedule[]> {
        return await this.laboratoryScheduleService.findAll();
    }

    async createSchedule(data: {
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        notes?: string;
        userId?: number;
    }): Promise<LaboratorySchedule> {
        return await this.laboratoryScheduleService.create(data);
    }

    async updateSchedule(id: number, data: {
        dayOfWeek?: number;
        startTime?: string;
        endTime?: string;
        notes?: string;
        userId?: number;
    }): Promise<LaboratorySchedule> {
        return await this.laboratoryScheduleService.update(id, data);
    }

    async deleteSchedule(id: number): Promise<void> {
        await this.laboratoryScheduleService.delete(id);
    }


    async getSchedulesByDay(dayOfWeek: number): Promise<LaboratorySchedule[]> {
        return await this.laboratoryScheduleService.getSchedulesByDay(dayOfWeek);
    }

    async getSchedulesByTimeRange(startTime: string, endTime: string): Promise<LaboratorySchedule[]> {
        return await this.laboratoryScheduleService.getSchedulesByTimeRange(startTime, endTime);
    }

    async canUserManageSchedule(userId: number): Promise<boolean> {
        return await this.laboratoryScheduleService.canUserManageSchedule(userId);
    }
}