import { Project, IProject, ProjectStatus } from '../models/Project';
import { ProjectMembership, IProjectMembership } from '../models/ProjectMembership';
import { ProjectRepository, IProjectRepository } from '../repositories/ProjectRepository';
import { ProjectMembershipRepository, IProjectMembershipRepository } from '../repositories/ProjectMembershipRepository';
import { UserRepository } from '../repositories/UserRepository';
import { HistoryService } from './HistoryService';
import { HistoryRepository } from '../repositories/HistoryRepository';
import { UserRole } from '@prisma/client';

export interface IProjectService {
    findById(id: number): Promise<Project | null>;
    findAll(): Promise<Project[]>;
    findByUserId(userId: number): Promise<Project[]>;
    findByCreatorId(creatorId: number): Promise<Project[]>;
    create(data: Omit<IProject, 'id' | 'createdAt'>, creatorId: number): Promise<Project>;
    update(id: number, data: Partial<IProject>, userId: number): Promise<Project>;
    delete(id: number, userId: number): Promise<void>;
    
    addMemberToProject(projectId: number, userId: number, roles: UserRole[], addedBy: number): Promise<ProjectMembership>;
    removeMemberFromProject(projectId: number, userId: number, removedBy: number): Promise<void>;
    getProjectMembers(projectId: number): Promise<ProjectMembership[]>;
}

export class ProjectService implements IProjectService {
    private userRepository: UserRepository;
    private historyService: HistoryService;

    constructor(
        private projectRepository: IProjectRepository,
        private membershipRepository: IProjectMembershipRepository
    ) {
        this.userRepository = new UserRepository();
        const historyRepository = new HistoryRepository();
        this.historyService = new HistoryService(historyRepository, this.userRepository);
    }

    async findById(id: number): Promise<Project | null> {
        return await this.projectRepository.findById(id);
    }

    async findAll(): Promise<Project[]> {
        return await this.projectRepository.findAll();
    }

    async findByUserId(userId: number): Promise<Project[]> {
        return await this.projectRepository.findByUserId(userId);
    }

    async findByCreatorId(creatorId: number): Promise<Project[]> {
        return await this.projectRepository.findByCreatorId(creatorId);
    }

    async create(data: Omit<IProject, 'id' | 'createdAt'>, creatorId: number): Promise<Project> {
        
        const project = Project.create({
            ...data,
            createdBy: creatorId
        });

        const createdProject = await this.projectRepository.create(project);
        
        const membership = ProjectMembership.create({
            projectId: createdProject.id!,
            userId: creatorId,
            roles: ['GERENTE_PROJETO']
        });

        await this.membershipRepository.create(membership);
        await this.historyService.recordEntityCreation('PROJECT', createdProject.id!, creatorId, createdProject.toJSON());
        await this.historyService.recordAction('PROJECT', createdProject.id!, 'CREATE', creatorId, 'Projeto criado');
        
        return createdProject;
    }

    async update(id: number, data: Partial<IProject>, userId: number): Promise<Project> {
        
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new Error('Projeto não encontrado');
        }

        const canManage = await this.canUserManageProject(id, userId);
        if (!canManage) {
            throw new Error('Usuário não tem permissão para gerenciar este projeto');
        }

        if (data.name !== undefined) {
            project.updateName(data.name);
        }
        if (data.description !== undefined) {
            project.updateDescription(data.description);
        }
        if (data.status !== undefined) {
            project.updateStatus(data.status);
        }
        if (data.links !== undefined) {
            project.updateLinks(data?.links!);
        }
        if (data.leaderId !== undefined) {
            // Validar se o novo líder não é líder de outro projeto
            if (data.leaderId !== null) {
                const existingLeaderProjects = await this.projectRepository.findByLeaderId(data.leaderId);
                const otherProjects = existingLeaderProjects.filter(p => p.id !== id);
                if (otherProjects.length > 0) {
                    throw new Error('Este usuário já é líder de outro projeto. Um usuário só pode ser líder de um projeto por vez.');
                }
            }
            project.updateLeader(data.leaderId);
        }
        
        const oldProjectData = project.toJSON();
        const updatedProject = await this.projectRepository.update(project);
        
        await this.historyService.recordEntityUpdate('PROJECT', id, userId, oldProjectData, updatedProject.toJSON());
        
        return updatedProject;
    }

    async delete(id: number, userId: number): Promise<void> {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new Error('Projeto não encontrado');
        }

        const canManage = await this.canUserManageProject(id, userId);
        if (!canManage) {
            throw new Error('Usuário não tem permissão para excluir este projeto');
        }

        if (!project.canBeDeleted()) {
            throw new Error('Projeto não pode ser excluído no status atual');
        }

        const projectData = project.toJSON();
        await this.projectRepository.delete(id);
        
        await this.historyService.recordEntityDeletion('PROJECT', id, userId, projectData);
    }

    async canUserManageProject(projectId: number, userId: number): Promise<boolean> {
        const membership = await this.membershipRepository.findByProjectAndUser(projectId, userId);
        if (membership) {
            return membership.canManageProject();
        }
        
        const user = await this.userRepository.findById(userId);
        if (user) {
            return user.hasAnyRole(['COORDENADOR', 'GERENTE']);
        }
        
        return false;
    }


    async addMemberToProject(projectId: number, userId: number, roles: UserRole[], addedBy: number): Promise<ProjectMembership> {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new Error('Projeto não encontrado');
        }

        const canManage = await this.canUserManageProject(projectId, addedBy);
        if (!canManage) {
            throw new Error('Usuário não tem permissão para adicionar membros a este projeto');
        }

        const existingMembership = await this.membershipRepository.findByProjectAndUser(projectId, userId);
        if (existingMembership) {
            throw new Error('Usuário já é membro deste projeto');
        }

        if (!roles || roles.length === 0) {
            throw new Error('Pelo menos um papel deve ser atribuído');
        }

        const membership = ProjectMembership.create({
            projectId,
            userId,
            roles
        });

        const createdMembership = await this.membershipRepository.create(membership);
        
        await this.historyService.recordAction('PROJECT', projectId, 'CREATE', addedBy, 'Membro adicionado ao projeto');
        
        return createdMembership;
    }

    async removeMemberFromProject(projectId: number, userId: number, removedBy: number): Promise<void> {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new Error('Projeto não encontrado');
        }

        const canManage = await this.canUserManageProject(projectId, removedBy);
        if (!canManage) {
            throw new Error('Usuário não tem permissão para remover membros deste projeto');
        }

        const membership = await this.membershipRepository.findByProjectAndUser(projectId, userId);
        if (!membership) {
            throw new Error('Usuário não é membro deste projeto');
        }

        if (membership.isProjectManager()) {
            const managers = await this.membershipRepository.getProjectManagers(projectId);
            if (managers.length <= 1) {
                throw new Error('Não é possível remover o último gerente do projeto');
            }
        }

        await this.membershipRepository.deleteByProjectAndUser(projectId, userId);
        
        await this.historyService.recordAction('PROJECT', projectId, 'REMOVE_MEMBER', removedBy, 'Membro removido do projeto');
    }

    async getProjectMembers(projectId: number): Promise<ProjectMembership[]> {
        return await this.membershipRepository.getProjectMembersWithDetails(projectId);
    }

    async getVolunteersStats(projectId: number): Promise<{
        volunteers: any[];
        stats: {
            totalVolunteers: number;
            totalHours: number;
            completedTasks: number;
            totalPoints: number;
        };
    }> {
        const members = await this.membershipRepository.getProjectMembersWithDetails(projectId);
        
        // Converter membros em voluntários com dados reais
        const volunteers = members.map(member => ({
            id: member.userId,
            name: member.user?.name || 'Usuário',
            email: member.user?.email || '',
            avatar: member.user?.avatar,
            role: member.roles?.[0] || 'COLABORADOR',
            joinedAt: member.joinedAt,
            hoursWorked: member.user?.totalHours || 0,
            tasksCompleted: member.user?.completedTasks || 0,
            pointsEarned: member.user?.points || 0,
            status: 'active' as const,
            lastActivity: new Date().toISOString().split('T')[0]
        }));

        // Calcular estatísticas reais
        const totalVolunteers = volunteers.length;
        const totalHours = volunteers.reduce((sum, v) => sum + v.hoursWorked, 0);
        const completedTasks = volunteers.reduce((sum, v) => sum + v.tasksCompleted, 0);
        const totalPoints = volunteers.reduce((sum, v) => sum + v.pointsEarned, 0);

        return {
            volunteers,
            stats: {
                totalVolunteers,
                totalHours,
                completedTasks,
                totalPoints
            }
        };
    }
}