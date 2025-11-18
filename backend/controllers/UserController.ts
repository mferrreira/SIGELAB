import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import { BadgeRepository, UserBadgeRepository } from '../repositories/BadgeRepository';
import { User } from '../models/user/User';
import { UserRole } from '@prisma/client';

export class UserController {
    private userService: UserService;

    constructor() {
        const userRepo = new UserRepository();
        const badgeRepo = new BadgeRepository();
        const userBadgeRepo = new UserBadgeRepository();
        this.userService = new UserService(userRepo, badgeRepo, userBadgeRepo);
    }

    async getUser(id: number): Promise<User | null> {
        return await this.userService.findById(id);
    }

    async getAllUsers(): Promise<any[]> {
        const users = await this.userService.findAll();
        return users.map(user => user.toJSON());
    }

    async createUser(data: any): Promise<any> {
        const user = await this.userService.create(data);
        return user.toJSON();
    }

    async updateUser(id: number, data: any): Promise<any> {
        const user = await this.userService.update(id, data);
        return user.toJSON();
    }

    async deleteUser(id: number): Promise<void> {
        return await this.userService.delete(id);
    }

    async authenticateUser(email: string, password: string): Promise<User | null> {
        return await this.userService.authenticate(email, password);
    }

    async approveUser(id: number): Promise<any> {
        const user = await this.userService.approveUser(id);
        return user.toJSON();
    }

    async rejectUser(id: number): Promise<any> {
        const user = await this.userService.rejectUser(id);
        return user.toJSON();
    }

    async suspendUser(id: number): Promise<any> {
        const user = await this.userService.suspendUser(id);
        return user.toJSON();
    }

    async activateUser(id: number): Promise<any> {
        const user = await this.userService.activateUser(id);
        return user.toJSON();
    }

    async addRole(id: number, role: UserRole): Promise<any> {
        const user = await this.userService.addRole(id, role);
        return user.toJSON();
    }

    async removeRole(id: number, role: UserRole): Promise<any> {
        const user = await this.userService.removeRole(id, role);
        return user.toJSON();
    }

    async setRoles(id: number, roles: UserRole[]): Promise<any> {
        const user = await this.userService.setRoles(id, roles);
        return user.toJSON();
    }

    async addPoints(id: number, points: number): Promise<any> {
        const user = await this.userService.addPoints(id, points);
        return user.toJSON();
    }

    async removePoints(id: number, points: number): Promise<any> {
        const user = await this.userService.removePoints(id, points);
        return user.toJSON();
    }

    async setPoints(id: number, points: number): Promise<any> {
        const user = await this.userService.setPoints(id, points);
        return user.toJSON();
    }

    async getTopUsersByPoints(limit?: number): Promise<any[]> {
        const users = await this.userService.getTopUsersByPoints(limit);
        return users.map(user => user.toJSON());
    }

    async getTopUsersByTasks(limit?: number): Promise<any[]> {
        const users = await this.userService.getTopUsersByTasks(limit);
        return users.map(user => user.toJSON());
    }

    async getUserStatistics(): Promise<{
        total: number;
        active: number;
        pending: number;
        rejected: number;
        suspended: number;
        inactive: number;
        totalPoints: number;
        totalTasks: number;
        averagePoints: number;
        averageTasks: number;
    }> {
        return await this.userService.getUserStatistics();
    }

    async getUsersByRoleStatistics(): Promise<Record<UserRole, number>> {
        return await this.userService.getUsersByRoleStatistics();
    }

    async getUsersByStatusStatistics(): Promise<Record<string, number>> {
        return await this.userService.getUsersByStatusStatistics();
    }

    async getPublicProfiles(): Promise<any[]> {
        const users = await this.userService.getPublicProfiles();
        return users.map(user => user.toJSON());
    }

    async getMemberProfiles(): Promise<any[]> {
        const users = await this.userService.getMemberProfiles();
        return users.map(user => user.toJSON());
    }

    async updateProfile(id: number, data: {
        name?: string;
        bio?: string | null;
        avatar?: string | null;
        profileVisibility?: any;
        password?: string;
        weekHours?: number;
    }): Promise<any> {
        const user = await this.userService.updateProfile(id, data);
        return user.toJSON();
    }

    async getUsers(options: { search?: string; excludeProjectId?: number } = {}): Promise<{
        success: boolean;
        users: any[];
    }> {
        try {
            const users = await this.userService.getUsers(options);
            return {
                success: true,
                users: users.map(user => user.toJSON())
            };
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            throw new Error('Erro ao buscar usuários');
        }
    }

    async deductHours(userId: number, data: {
        hours: number;
        reason: string;
        projectId?: number;
        deductedBy: number;
        deductedByRoles: string[];
    }): Promise<{
        success: boolean;
        message: string;
        user: any;
    }> {
        try {
            const result = await this.userService.deductHours(userId, data);
            return {
                success: true,
                message: result.message,
                user: result.user.toJSON()
            };
        } catch (error) {
            console.error('Erro ao retirar horas:', error);
            throw new Error('Erro ao retirar horas');
        }
    }
}
