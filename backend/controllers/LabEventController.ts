import { LabEvent } from '../models/LabEvent';
import { LabEventService, ILabEventService } from '../services/LabEventService';
import { LabEventRepository } from '../repositories/LabEventRepository';
import { UserRepository } from '../repositories/UserRepository';
import { HistoryService } from '../services/HistoryService';
import { HistoryRepository } from '../repositories/HistoryRepository';

export class LabEventController {
    private labEventService: ILabEventService;

    constructor() {
        const labEventRepo = new LabEventRepository();
        const userRepo = new UserRepository();
        const historyRepo = new HistoryRepository();
        const historyService = new HistoryService(historyRepo, userRepo);
        
        this.labEventService = new LabEventService(labEventRepo, userRepo, historyService);
    }

    async getEventById(id: number): Promise<LabEvent> {
        const event = await this.labEventService.findById(id);
        if (!event) {
            throw new Error("Evento não encontrado");
        }
        return event;
    }

    async getAllEvents(): Promise<LabEvent[]> {
        return await this.labEventService.findAll();
    }

    async createEvent(data: {
        userId: number;
        userName: string;
        date: Date;
        note: string;
    }): Promise<LabEvent> {
        return await this.labEventService.create(data);
    }

    async updateEvent(id: number, data: {
        userId?: number;
        note?: string;
        date?: Date;
    }): Promise<LabEvent> {
        return await this.labEventService.update(id, data);
    }

    async deleteEvent(id: number): Promise<void> {
        await this.labEventService.delete(id);
    }
    
    async getEventsByDate(date: Date): Promise<LabEvent[]> {
        return await this.labEventService.getEventsByDate(date);
    }

    async getEventsByUser(userId: number): Promise<LabEvent[]> {
        return await this.labEventService.getEventsByUser(userId);
    }

    async getEventsByDateRange(startDate: Date, endDate: Date): Promise<LabEvent[]> {
        return await this.labEventService.getEventsByDateRange(startDate, endDate);
    }

    async canUserCreateEvent(userId: number): Promise<boolean> {
        return await this.labEventService.canUserCreateEvent(userId);
    }

    async canUserViewEvent(eventId: number, userId: number): Promise<boolean> {
        return await this.labEventService.canUserViewEvent(eventId, userId);
    }
}