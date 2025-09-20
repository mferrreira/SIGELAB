import { BadgeService } from '../services/BadgeService';
import { BadgeRepository, UserBadgeRepository } from '../repositories/BadgeRepository';
import { Badge, UserBadge, BadgeCategory } from '../models/Badge';

export class BadgeController {
    private badgeService: BadgeService;

    constructor() {
        const badgeRepo = new BadgeRepository();
        const userBadgeRepo = new UserBadgeRepository();
        this.badgeService = new BadgeService(badgeRepo, userBadgeRepo);
    }

    async getBadge(id: number): Promise<Badge | null> {
        return await this.badgeService.findById(id);
    }

    async getAllBadges(): Promise<Badge[]> {
        return await this.badgeService.findAll();
    }

    async getActiveBadges(): Promise<Badge[]> {
        return await this.badgeService.findActive();
    }

    async getBadgesByCategory(category: BadgeCategory): Promise<Badge[]> {
        return await this.badgeService.findByCategory(category);
    }

    async createBadge(data: any): Promise<Badge> {
        return await this.badgeService.create(data);
    }

    async updateBadge(id: number, data: any): Promise<Badge> {
        return await this.badgeService.update(id, data);
    }

    async deleteBadge(id: number): Promise<void> {
        return await this.badgeService.delete(id);
    }

    async awardBadgeToUser(badgeId: number, userId: number, awardedBy?: number): Promise<UserBadge> {
        return await this.badgeService.awardBadgeToUser(badgeId, userId, awardedBy);
    }

    async removeBadgeFromUser(userId: number, badgeId: number): Promise<void> {
        return await this.badgeService.removeBadgeFromUser(userId, badgeId);
    }

    async getUserBadges(userId: number): Promise<UserBadge[]> {
        return await this.badgeService.getUserBadges(userId);
    }

    async getRecentUserBadges(userId: number, limit?: number): Promise<UserBadge[]> {
        return await this.badgeService.getRecentUserBadges(userId, limit);
    }
}