import { Badge, UserBadge, IBadgeCriteria } from '../models/Badge';
import { BadgeRepository, UserBadgeRepository } from '../repositories/BadgeRepository';
import { BadgeCategory } from '../models/Badge';

export class BadgeService {
    constructor(
        private badgeRepo: BadgeRepository,
        private userBadgeRepo: UserBadgeRepository
    ) {}

    // Badge CRUD operations
    async create(data: any): Promise<Badge> {
        // Validate required fields
        if (!data.name || !data.name.trim()) {
            throw new Error("Nome do badge é obrigatório");
        }
        if (!data.description || !data.description.trim()) {
            throw new Error("Descrição do badge é obrigatória");
        }
        if (!data.category) {
            throw new Error("Categoria do badge é obrigatória");
        }
        if (!data.createdBy) {
            throw new Error("Criador do badge é obrigatório");
        }

        // Validate category
        const validCategories: BadgeCategory[] = ['achievement', 'milestone', 'special', 'social'];
        if (!validCategories.includes(data.category)) {
            throw new Error("Categoria de badge inválida");
        }

        // Create badge
        const badge = Badge.create({
            name: data.name.trim(),
            description: data.description.trim(),
            icon: data.icon || null,
            color: data.color || null,
            category: data.category,
            criteria: data.criteria || null,
            isActive: data.isActive !== false,
            createdBy: data.createdBy,
        });

        return await this.badgeRepo.create(badge);
    }

    async findById(id: number): Promise<Badge | null> {
        return await this.badgeRepo.findById(id);
    }

    async findAll(): Promise<Badge[]> {
        return await this.badgeRepo.findAll();
    }

    async findByCategory(category: BadgeCategory): Promise<Badge[]> {
        return await this.badgeRepo.findByCategory(category);
    }

    async findActive(): Promise<Badge[]> {
        return await this.badgeRepo.findActive();
    }

    async update(id: number, data: any): Promise<Badge> {
        const currentBadge = await this.badgeRepo.findById(id);
        if (!currentBadge) {
            throw new Error("Badge não encontrado");
        }

        // Apply updates to current badge
        if (data.name !== undefined) {
            currentBadge.updateName(data.name);
        }
        if (data.description !== undefined) {
            currentBadge.updateDescription(data.description);
        }
        if (data.icon !== undefined) {
            currentBadge.updateIcon(data.icon);
        }
        if (data.color !== undefined) {
            currentBadge.updateColor(data.color);
        }
        if (data.category !== undefined) {
            currentBadge.updateCategory(data.category);
        }
        if (data.criteria !== undefined) {
            currentBadge.updateCriteria(data.criteria);
        }
        if (data.isActive !== undefined) {
            if (data.isActive) {
                currentBadge.activate();
            } else {
                currentBadge.deactivate();
            }
        }

        return await this.badgeRepo.update(currentBadge);
    }

    async delete(id: number): Promise<void> {
        const badge = await this.badgeRepo.findById(id);
        if (!badge) {
            throw new Error("Badge não encontrado");
        }

        await this.badgeRepo.delete(id);
    }

    // User Badge operations
    async awardBadgeToUser(badgeId: number, userId: number, awardedBy?: number): Promise<UserBadge> {
        // Validate badge exists
        const badge = await this.badgeRepo.findById(badgeId);
        if (!badge) {
            throw new Error("Badge não encontrado");
        }

        // Check if user already has this badge
        const existingUserBadge = await this.userBadgeRepo.findByUserAndBadge(userId, badgeId);
        if (existingUserBadge) {
            throw new Error("Usuário já possui este badge");
        }

        // Create user badge
        const userBadge = UserBadge.create({
            userId: userId,
            badgeId: badgeId,
            awardedBy: awardedBy || null,
            awardedAt: new Date(),
        });

        return await this.userBadgeRepo.create(userBadge);
    }

    async removeBadgeFromUser(userId: number, badgeId: number): Promise<void> {
        const userBadge = await this.userBadgeRepo.findByUserAndBadge(userId, badgeId);
        if (!userBadge) {
            throw new Error("Usuário não possui este badge");
        }

        await this.userBadgeRepo.delete(userBadge.id!);
    }

    async getUserBadges(userId: number): Promise<UserBadge[]> {
        return await this.userBadgeRepo.findByUserId(userId);
    }

    async getRecentUserBadges(userId: number, limit?: number): Promise<UserBadge[]> {
        return await this.userBadgeRepo.findRecentByUserId(userId, limit);
    }
}