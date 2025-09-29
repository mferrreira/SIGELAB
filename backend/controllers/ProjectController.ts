import { ProjectService } from '../services/ProjectService';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { ProjectMembershipRepository } from '../repositories/ProjectMembershipRepository';
import { ProjectStatus } from '../models/Project';
import { UserRole } from '@prisma/client';

export class ProjectController {
    private projectService: ProjectService;

    constructor() {
        const projectRepo = new ProjectRepository();
        const membershipRepo = new ProjectMembershipRepository();
        this.projectService = new ProjectService(projectRepo, membershipRepo);
    }

    async getProject(id: number): Promise<any> {
        const project = await this.projectService.findById(id);
        if (!project) {
            throw new Error('Projeto não encontrado');
        }
        return project.toJSON();
    }

    async getAllProjects(): Promise<any[]> {
        const projects = await this.projectService.findAll();
        return projects.map(project => project.toJSON());
    }

    async getProjectsByUser(userId: number): Promise<any[]> {
        const projects = await this.projectService.findByUserId(userId);
        return projects.map(project => project.toJSON());
    }

    async getProjectsByCreator(creatorId: number): Promise<any[]> {
        const projects = await this.projectService.findByCreatorId(creatorId);
        return projects.map(project => project.toJSON());
    }

    async createProject(data: any, creatorId: number): Promise<any> {
        const project = await this.projectService.create(data, creatorId);
        return project.toJSON();
    }

    async updateProject(id: number, data: any, userId: number): Promise<any> {
        const project = await this.projectService.update(id, data, userId);
        return project.toJSON();
    }

    async deleteProject(id: number, userId: number): Promise<void> {
        await this.projectService.delete(id, userId);
    }

    async addMemberToProject(projectId: number, userId: number, roles: UserRole[], addedBy: number): Promise<any> {
        const membership = await this.projectService.addMemberToProject(projectId, userId, roles, addedBy);
        return membership.toJSON();
    }

    async removeMemberFromProject(projectId: number, userId: number, removedBy: number): Promise<void> {
        await this.projectService.removeMemberFromProject(projectId, userId, removedBy);
    }

    async getProjectMembers(projectId: number): Promise<any[]> {
        const members = await this.projectService.getProjectMembers(projectId);
        return members.map(member => member.toJSON());
    }

    async getVolunteersStats(projectId: number): Promise<{
        success: boolean;
        volunteers: any[];
        stats: {
            totalVolunteers: number;
            totalHours: number;
            completedTasks: number;
            totalPoints: number;
        };
    }> {
        try {
            const result = await this.projectService.getVolunteersStats(projectId);
            return {
                success: true,
                volunteers: result.volunteers,
                stats: result.stats
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas dos voluntários:', error);
            throw new Error('Erro ao buscar estatísticas dos voluntários');
        }
    }
}