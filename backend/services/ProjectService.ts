import { Project, IProject, ProjectStatus } from '../models/Project';
import { ProjectMembership, IProjectMembership } from '../models/ProjectMembership';
import { ProjectRepository, IProjectRepository } from '../repositories/ProjectRepository';
import { ProjectMembershipRepository, IProjectMembershipRepository } from '../repositories/ProjectMembershipRepository';
import { UserRepository } from '../repositories/UserRepository';
import { HistoryService } from './HistoryService';
import { HistoryRepository } from '../repositories/HistoryRepository';
import { UserRole } from '@prisma/client';

export interface IProjectService {
    // Project CRUD operations
    findById(id: number): Promise<Project | null>;
    findAll(): Promise<Project[]>;
    findByUserId(userId: number): Promise<Project[]>;
    findByCreatorId(creatorId: number): Promise<Project[]>;
    create(data: Omit<IProject, 'id' | 'createdAt'>, creatorId: number): Promise<Project>;
    update(id: number, data: Partial<IProject>, userId: number): Promise<Project>;
    delete(id: number, userId: number): Promise<void>;
    
    // Project membership operations
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

    // Project CRUD operations
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
        console.log('ProjectService.create - input data:', data);
        console.log('ProjectService.create - data.links:', data.links);
        
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
        await this.historyService.recordProjectMemberAddition(createdProject.id!, creatorId, creatorId, ['GERENTE_PROJETO']);
        
        return createdProject;
    }

    async update(id: number, data: Partial<IProject>, userId: number): Promise<Project> {
        console.log('ProjectService.update - input data:', data);
        console.log('ProjectService.update - data.links:', data.links);
        
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
            console.log('ProjectService.update - updating links from:', project.links, 'to:', data.links);
            project.updateLinks(data.links);
        }

        console.log('ProjectService.update - project links after update:', project.links);
        
        const oldProjectData = project.toJSON();
        const updatedProject = await this.projectRepository.update(project);
        
        // Record project update in history
        await this.historyService.recordEntityUpdate('PROJECT', id, userId, oldProjectData, updatedProject.toJSON());
        
        return updatedProject;
    }

    async delete(id: number, userId: number): Promise<void> {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new Error('Projeto não encontrado');
        }

        // Check if user can manage this project
        const canManage = await this.canUserManageProject(id, userId);
        if (!canManage) {
            throw new Error('Usuário não tem permissão para excluir este projeto');
        }

        // Check if project can be deleted
        if (!project.canBeDeleted()) {
            throw new Error('Projeto não pode ser excluído no status atual');
        }

        const projectData = project.toJSON();
        await this.projectRepository.delete(id);
        
        // Record project deletion in history
        await this.historyService.recordEntityDeletion('PROJECT', id, userId, projectData);
    }

    async canUserManageProject(projectId: number, userId: number): Promise<boolean> {
        const membership = await this.membershipRepository.findByProjectAndUser(projectId, userId);
        if (membership) {
            return membership.canManageProject();
        }
        
        // If user is not a member, check if they have global management roles
        // This allows COORDENADOR and GERENTE to manage any project
        const user = await this.userRepository.findById(userId);
        if (user) {
            return user.hasAnyRole(['COORDENADOR', 'GERENTE']);
        }
        
        return false;
    }

    // Project membership operations
    async addMemberToProject(projectId: number, userId: number, roles: UserRole[], addedBy: number): Promise<ProjectMembership> {
        // Check if project exists
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new Error('Projeto não encontrado');
        }

        // Check if user adding member can manage the project
        const canManage = await this.canUserManageProject(projectId, addedBy);
        if (!canManage) {
            throw new Error('Usuário não tem permissão para adicionar membros a este projeto');
        }

        // Check if user is already a member
        const existingMembership = await this.membershipRepository.findByProjectAndUser(projectId, userId);
        if (existingMembership) {
            throw new Error('Usuário já é membro deste projeto');
        }

        // Validate roles
        if (!roles || roles.length === 0) {
            throw new Error('Pelo menos um papel deve ser atribuído');
        }

        const membership = ProjectMembership.create({
            projectId,
            userId,
            roles
        });

        const createdMembership = await this.membershipRepository.create(membership);
        
        // Record member addition in history
        await this.historyService.recordProjectMemberAddition(projectId, userId, addedBy, roles);
        
        return createdMembership;
    }

    async removeMemberFromProject(projectId: number, userId: number, removedBy: number): Promise<void> {
        // Check if project exists
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new Error('Projeto não encontrado');
        }

        // Check if user removing member can manage the project
        const canManage = await this.canUserManageProject(projectId, removedBy);
        if (!canManage) {
            throw new Error('Usuário não tem permissão para remover membros deste projeto');
        }

        // Check if user is a member
        const membership = await this.membershipRepository.findByProjectAndUser(projectId, userId);
        if (!membership) {
            throw new Error('Usuário não é membro deste projeto');
        }

        // Prevent removing the last project manager
        if (membership.isProjectManager()) {
            const managers = await this.membershipRepository.getProjectManagers(projectId);
            if (managers.length <= 1) {
                throw new Error('Não é possível remover o último gerente do projeto');
            }
        }

        await this.membershipRepository.deleteByProjectAndUser(projectId, userId);
        
        // Record member removal in history
        await this.historyService.recordProjectMemberRemoval(projectId, userId, removedBy);
    }

    async getProjectMembers(projectId: number): Promise<ProjectMembership[]> {
        return await this.membershipRepository.getProjectMembersWithDetails(projectId);
    }
}