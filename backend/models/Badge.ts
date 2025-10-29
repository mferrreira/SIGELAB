import { badges, user_badges, users } from '@prisma/client';

export interface IBadge {
    id?: number;
    name: string;
    description: string;
    icon?: string | null | undefined;
    color?: string | null | undefined;
    category: BadgeCategory;
    criteria?: IBadgeCriteria | null;
    isActive: boolean;
    createdAt?: Date;
    createdBy: number;
}

export interface IBadgeCriteria {
    points?: number;
    tasks?: number;
    projects?: number;
    workSessions?: number;
    weeklyHours?: number;
    consecutiveDays?: number;
    specialCondition?: string;
}

export type BadgeCategory = 'achievement' | 'milestone' | 'special' | 'social';

export interface IUserBadge {
    id?: number;
    userId: number;
    badgeId: number;
    earnedAt?: Date;
    earnedBy?: number | null;
}

export class Badge {
    public id?: number;
    public name: string;
    public description: string;
    public icon?: string | null | undefined;
    public color?: string | null | undefined;
    public category: BadgeCategory;
    public criteria?: IBadgeCriteria | null;
    public isActive: boolean;
    public createdAt?: Date;
    public createdBy: number;

    constructor(data: IBadge) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.icon = data.icon;
        this.color = data.color;
        this.category = data.category;
        this.criteria = data.criteria;
        this.isActive = data.isActive;
        this.createdAt = data.createdAt;
        this.createdBy = data.createdBy;
    }

    static create(data: Omit<IBadge, 'id' | 'createdAt'>): Badge {
        return new Badge({
            ...data,
            isActive: true,
            createdAt: new Date(),
        });
    }

    static fromPrisma(data: badges): Badge {
        const badge = new Badge({
            id: data.id,
            name: data.name,
            description: data.description,
            icon: data.icon,
            color: data.color,
            category: data.category as BadgeCategory,
            criteria: data.criteria as IBadgeCriteria | null,
            isActive: data.isActive,
            createdAt: data.createdAt,
            createdBy: data.createdBy,
        });
        return badge;
    }

    toPrisma(): Omit<badges, 'id' | 'createdAt'> {
        return {
            name: this.name,
            description: this.description,
            icon: this.icon,
            color: this.color,
            category: this.category,
            criteria: this.criteria as any,
            isActive: this.isActive,
            createdBy: this.createdBy,
        };
    }

    updateName(name: string): Badge {
        if (!name || name.trim().length === 0) {
            throw new Error("Nome do badge é obrigatório");
        }
        this.name = name.trim();
        return this;
    }

    updateDescription(description: string): Badge {
        if (!description || description.trim().length === 0) {
            throw new Error("Descrição do badge é obrigatória");
        }
        this.description = description.trim();
        return this;
    }

    updateIcon(icon: string | null): Badge {
        this.icon = icon;
        return this;
    }

    updateColor(color: string | null): Badge {
        this.color = color;
        return this;
    }

    updateCategory(category: BadgeCategory): Badge {
        const validCategories: BadgeCategory[] = ['achievement', 'milestone', 'special', 'social'];
        if (!validCategories.includes(category)) {
            throw new Error("Categoria de badge inválida");
        }
        this.category = category;
        return this;
    }

    updateCriteria(criteria: IBadgeCriteria | null): Badge {
        this.criteria = criteria;
        return this;
    }

    activate(): Badge {
        this.isActive = true;
        return this;
    }

    deactivate(): Badge {
        this.isActive = false;
        return this;
    }

    isValid(): boolean {
        return !!(
            this.name &&
            this.description &&
            this.category &&
            this.createdBy
        );
    }

    canBeAwarded(): boolean {
        return this.isActive && this.isValid();
    }

    checkCriteria(userStats: {
        points?: number;
        completedTasks?: number;
        completedProjects?: number;
        workSessions?: number;
        weeklyHours?: number;
        consecutiveDays?: number;
    }): boolean {
        if (!this.criteria) return true;

        const criteria = this.criteria;

        if (criteria.points && (userStats.points || 0) < criteria.points) {
            return false;
        }

        if (criteria.tasks && (userStats.completedTasks || 0) < criteria.tasks) {
            return false;
        }

        if (criteria.projects && (userStats.completedProjects || 0) < criteria.projects) {
            return false;
        }

        if (criteria.workSessions && (userStats.workSessions || 0) < criteria.workSessions) {
            return false;
        }

        if (criteria.weeklyHours && (userStats.weeklyHours || 0) < criteria.weeklyHours) {
            return false;
        }

        if (criteria.consecutiveDays && (userStats.consecutiveDays || 0) < criteria.consecutiveDays) {
            return false;
        }

        return true;
    }

    getDisplayName(): string {
        return this.name;
    }

    getDisplayDescription(): string {
        return this.description;
    }

    getIconUrl(): string | null | undefined {
        return this.icon;
    }

    getColorCode(): string {
        return this.color || '#3B82F6';
    }

    getCategoryDisplayName(): string {
        const categoryNames: Record<BadgeCategory, string> = {
            achievement: 'Conquista',
            milestone: 'Marco',
            special: 'Especial',
            social: 'Social'
        };
        return categoryNames[this.category];
    }

    isAutomatic(): boolean {
        return this.criteria !== null && this.criteria !== undefined;
    }

    isManual(): boolean {
        return !this.isAutomatic();
    }
}

export class UserBadge {
    public id?: number;
    public userId: number;
    public badgeId: number;
    public earnedAt: Date;
    public earnedBy?: number | null | undefined;

    constructor(data: IUserBadge) {
        this.id = data.id;
        this.userId = data.userId;
        this.badgeId = data.badgeId;
        this.earnedAt = data.earnedAt || new Date();
        this.earnedBy = data.earnedBy;
    }

    static create(data: Omit<IUserBadge, 'id' | 'earnedAt'>): UserBadge {
        return new UserBadge({
            ...data,
            earnedAt: new Date(),
        });
    }

    static fromPrisma(data: user_badges): UserBadge {
        return new UserBadge({
            id: data.id,
            userId: data.userId,
            badgeId: data.badgeId,
            earnedAt: data.earnedAt,
            earnedBy: data.earnedBy,
        });
    }

    toPrisma(): Omit<user_badges, 'id'> {
        return {
            userId: this.userId,
            badgeId: this.badgeId,
            earnedAt: this.earnedAt,
            earnedBy: this.earnedBy,
        };
    }

    isValid(): boolean {
        return !!(this.userId && this.badgeId);
    }

    isEarnedByUser(): boolean {
        return this.earnedBy === null;
    }

    isAwardedByAdmin(): boolean {
        return this.earnedBy !== null;
    }

    getEarnedDate(): string {
        return this.earnedAt.toLocaleDateString('pt-BR');
    }

    getEarnedTimeAgo(): string {
        const now = new Date();
        const diffInMs = now.getTime() - this.earnedAt.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return 'Hoje';
        if (diffInDays === 1) return 'Ontem';
        if (diffInDays < 7) return `${diffInDays} dias atrás`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
        if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} meses atrás`;
        return `${Math.floor(diffInDays / 365)} anos atrás`;
    }
}
