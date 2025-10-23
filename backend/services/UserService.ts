import { User } from '../models/user/User';
import { UserRepository } from '../repositories/UserRepository';
import { BadgeService } from './BadgeService';
import { BadgeRepository, UserBadgeRepository } from '../repositories/BadgeRepository';
import { HistoryService } from './HistoryService';
import { HistoryRepository } from '../repositories/HistoryRepository';
import { BadgeEvaluationService } from './BadgeEvaluationService';
import { UserRole } from '@prisma/client';

export class UserService {
    private badgeService?: BadgeService;
    private historyService?: HistoryService;
    private badgeEvaluationService?: BadgeEvaluationService;

    constructor(
        private userRepo: UserRepository,
        badgeRepo?: BadgeRepository,
        userBadgeRepo?: UserBadgeRepository
    ) {

        if (badgeRepo && userBadgeRepo) {
            this.badgeService = new BadgeService(badgeRepo, userBadgeRepo);
        }
        

        const historyRepository = new HistoryRepository();
        this.historyService = new HistoryService(historyRepository, userRepo);
        

        this.badgeEvaluationService = new BadgeEvaluationService();
    }


    async create(data: any): Promise<User> {

        if (!data.name || !data.name.trim()) {
            throw new Error("Nome é obrigatório");
        }
        if (!data.email || !data.email.trim()) {
            throw new Error("Email é obrigatório");
        }
        if (!data.password) {
            throw new Error("Senha é obrigatória");
        }


        const existingUser = await this.userRepo.findByEmail(data.email);
        if (existingUser) {
            throw new Error("Email já está em uso");
        }


        const user = User.create({
            name: data.name.trim(),
            email: data.email.trim(),
            bio: data.bio || null,
            avatar: data.avatar || null,
            profileVisibility: data.profileVisibility || 'public',
            roles: data.roles || [],
        });


        await user.setPassword(data.password);

        const createdUser = await this.userRepo.create(user);
        

        if (this.historyService) {
            await this.historyService.recordEntityCreation('USER', createdUser.id!, createdUser.id!, createdUser.toJSON());
        }
        
        return createdUser;
    }

    async findById(id: number): Promise<User | null> {
        return await this.userRepo.findById(id);
    }

    async findAll(): Promise<User[]> {
        return await this.userRepo.findAll();
    }

    async update(id: number, data: any): Promise<User> {
        const currentUser = await this.userRepo.findById(id);
        if (!currentUser) {
            throw new Error("Usuário não encontrado");
        }


        if (data.name !== undefined) {
            currentUser.updateName(data.name);
        }
        if (data.email !== undefined) {

            const existingUser = await this.userRepo.findByEmail(data.email);
            if (existingUser && existingUser.id !== id) {
                throw new Error("Email já está em uso");
            }
            currentUser.updateEmail(data.email);
        }
        if (data.bio !== undefined) {
            currentUser.updateBio(data.bio);
        }
        if (data.avatar !== undefined) {
            currentUser.updateAvatar(data.avatar);
        }
        if (data.profileVisibility !== undefined) {
            currentUser.updateProfileVisibility(data.profileVisibility);
        }
        if (data.weekHours !== undefined) {
            currentUser.updateWeekHours(data.weekHours);
        }
        if (data.status !== undefined) {
            currentUser.updateStatus(data.status);
        }
        if (data.roles !== undefined) {
            // Clear existing roles and add new ones
            const currentRoles = currentUser.roles;
            currentRoles.forEach((role: UserRole) => currentUser.removeRole(role));
            data.roles.forEach((role: UserRole) => currentUser.addRole(role));
        }

        const oldUserData = currentUser.toJSON();
        const updatedUser = await this.userRepo.update(currentUser);
        

        if (this.historyService) {
            await this.historyService.recordEntityUpdate('USER', id, id, oldUserData, updatedUser.toJSON());
        }
        
        return updatedUser;
    }

    async delete(id: number): Promise<void> {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const userData = user.toJSON();
        await this.userRepo.delete(id);
        

        if (this.historyService) {
            await this.historyService.recordEntityDeletion('USER', id, id, userData);
        }
    }


    async authenticate(email: string, password: string): Promise<User | null> {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            return null;
        }

        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return null;
        }

        if (!user.canLogin()) {
            throw new Error("Usuário não pode fazer login no status atual");
        }

        return user;
    }


    async approveUser(id: number): Promise<User> {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const oldUserData = user.toJSON();
        user.approve();
        const updatedUser = await this.userRepo.update(user);
        

        if (this.historyService) {
            await this.historyService.recordEntityUpdate('USER', id, id, oldUserData, updatedUser.toJSON());
        }
        
        return updatedUser;
    }

    async rejectUser(id: number): Promise<User> {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const oldUserData = user.toJSON();
        user.reject();
        const updatedUser = await this.userRepo.update(user);
        

        if (this.historyService) {
            await this.historyService.recordEntityUpdate('USER', id, id, oldUserData, updatedUser.toJSON());
        }
        
        return updatedUser;
    }

    async suspendUser(id: number): Promise<User> {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const oldUserData = user.toJSON();
        user.suspend();
        const updatedUser = await this.userRepo.update(user);
        

        if (this.historyService) {
            await this.historyService.recordEntityUpdate('USER', id, id, oldUserData, updatedUser.toJSON());
        }
        
        return updatedUser;
    }

    async activateUser(id: number): Promise<User> {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const oldUserData = user.toJSON();
        user.activate();
        const updatedUser = await this.userRepo.update(user);
        

        if (this.historyService) {
            await this.historyService.recordEntityUpdate('USER', id, id, oldUserData, updatedUser.toJSON());
        }
        
        return updatedUser;
    }


    async addRole(id: number, role: UserRole): Promise<User> {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const oldUserData = user.toJSON();
        user.addRole(role);
        const updatedUser = await this.userRepo.update(user);
        

        if (this.historyService) {
            await this.historyService.recordEntityUpdate('USER', id, id, oldUserData, updatedUser.toJSON());
        }
        
        return updatedUser;
    }

    async removeRole(id: number, role: UserRole): Promise<User> {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const oldUserData = user.toJSON();
        user.removeRole(role);
        const updatedUser = await this.userRepo.update(user);
        

        if (this.historyService) {
            await this.historyService.recordEntityUpdate('USER', id, id, oldUserData, updatedUser.toJSON());
        }
        
        return updatedUser;
    }

    async setRoles(id: number, roles: UserRole[]): Promise<User> {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const oldUserData = user.toJSON();

        const currentRoles = user.roles;
        currentRoles.forEach(role => user.removeRole(role));
        roles.forEach(role => user.addRole(role));
        
        const updatedUser = await this.userRepo.update(user);
        

        if (this.historyService) {
            await this.historyService.recordEntityUpdate('USER', id, id, oldUserData, updatedUser.toJSON());
        }
        
        return updatedUser;
    }


    async addPoints(id: number, points: number): Promise<User> {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const oldUserData = user.toJSON();
        user.addPoints(points);
        const updatedUser = await this.userRepo.update(user);
        

        if (this.historyService) {
            await this.historyService.recordEntityUpdate('USER', id, id, oldUserData, updatedUser.toJSON());
        }
        
        return updatedUser;
    }

    async removePoints(id: number, points: number): Promise<User> {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const oldUserData = user.toJSON();
        user.removePoints(points);
        const updatedUser = await this.userRepo.update(user);
        

        if (this.historyService) {
            await this.historyService.recordEntityUpdate('USER', id, id, oldUserData, updatedUser.toJSON());
        }
        
        return updatedUser;
    }

    async setPoints(id: number, points: number): Promise<User> {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const oldUserData = user.toJSON();
        user.setPoints(points);
        const updatedUser = await this.userRepo.update(user);
        

        if (this.historyService) {
            await this.historyService.recordEntityUpdate('USER', id, id, oldUserData, updatedUser.toJSON());
        }
        
        return updatedUser;
    }


    async getTopUsersByPoints(limit?: number): Promise<User[]> {
        return await this.userRepo.findTopByPoints(limit || 10);
    }

    async getTopUsersByTasks(limit?: number): Promise<User[]> {
        return await this.userRepo.findTopByTasks(limit || 10);
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
        return await this.userRepo.getUserStatistics();
    }

    async getUsersByRoleStatistics(): Promise<Record<UserRole, number>> {
        return await this.userRepo.getUsersByRole();
    }

    async getUsersByStatusStatistics(): Promise<Record<string, number>> {
        return await this.userRepo.getUsersByStatus();
    }


    async getPublicProfiles(): Promise<User[]> {
        return await this.userRepo.findByProfileVisibility('public');
    }

    async getMemberProfiles(): Promise<User[]> {
        return await this.userRepo.findByProfileVisibility('public');
    }

    async updateProfile(id: number, data: {
        name?: string;
        bio?: string | null;
        avatar?: string | null;
        profileVisibility?: any;
        password?: string;
    }): Promise<User> {
        const user = await this.userRepo.findById(id);

        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const oldUserData = user.toJSON();
        
        if (data.name !== undefined) {
            user.updateName(data.name);
        }
        if (data.bio !== undefined) {
            user.updateBio(data.bio);
        }
        if (data.avatar !== undefined) {
            user.updateAvatar(data.avatar);
        }
        if (data.profileVisibility !== undefined) {
            user.updateProfileVisibility(data.profileVisibility);
        }
        if (data.password !== undefined) {
            if (data.password.trim()) {
                await user.setPassword(data.password);
            }
            // Se password é string vazia, não fazemos nada (mantém a senha atual)
        }
        // Se password é undefined, não fazemos nada (mantém a senha atual)

        const updatedUser = await this.userRepo.update(user);
        
        if (this.historyService) {
            await this.historyService.recordEntityUpdate('USER', id, id, oldUserData, updatedUser.toJSON());
        }
        
        return updatedUser;
    }

    async getUsers(options: { search?: string; excludeProjectId?: number } = {}): Promise<User[]> {
        return await this.userRepo.getUsers(options);
    }

    async deductHours(userId: number, data: {
        hours: number;
        reason: string;
        projectId?: number;
        deductedBy: number;
        deductedByRoles: string[];
    }): Promise<{
        message: string;
        user: User;
    }> {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        // Verificar permissões
        const canDeductHours = this.canDeductHours(data.deductedByRoles, data.projectId);
        if (!canDeductHours) {
            throw new Error("Sem permissão para retirar horas");
        }

        // Se for líder de projeto, verificar se o usuário pertence ao projeto
        if (data.projectId && data.deductedByRoles.includes('GERENTE_PROJETO')) {
            const isUserInProject = await this.isUserInProject(userId, data.projectId);
            if (!isUserInProject) {
                throw new Error("Usuário não pertence ao projeto");
            }
        }

        // Verificar se o usuário tem horas suficientes
        if (user.totalHours < data.hours) {
            throw new Error("Usuário não possui horas suficientes");
        }

        const oldUserData = user.toJSON();
        
        // Retirar horas
        user.deductHours(data.hours);
        const updatedUser = await this.userRepo.update(user);

        // Registrar no histórico
        if (this.historyService) {
            await this.historyService.recordAction(
                'USER', 
                userId, 
                'DEDUCT_HOURS', 
                data.deductedBy, 
                `Horas retiradas: ${data.hours}h. Motivo: ${data.reason}`
            );
        }

        return {
            message: `${data.hours} horas retiradas com sucesso`,
            user: updatedUser
        };
    }

    private canDeductHours(roles: string[], projectId?: number): boolean {
        // Coordenadores e Gerentes podem retirar horas de qualquer usuário
        if (roles.includes('COORDENADOR') || roles.includes('GERENTE')) {
            return true;
        }

        // Líderes de projeto podem retirar horas apenas de usuários do seu projeto
        if (roles.includes('GERENTE_PROJETO') && projectId) {
            return true;
        }

        return false;
    }

    private async isUserInProject(userId: number, projectId: number): Promise<boolean> {
        // Esta verificação seria implementada no repository
        // Por enquanto, retornamos true (implementação simplificada)
        return true;
    }
}