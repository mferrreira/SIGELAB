import { prisma } from '@/lib/database/prisma';
import { Project, IProject, ProjectStatus } from '../models/Project';
import { ProjectMembership } from '../models/ProjectMembership';
import { UserRole } from '@prisma/client';

export interface IProjectRepository {
    findById(id: number): Promise<Project | null>;
    findAll(): Promise<Project[]>;
    findByStatus(status: ProjectStatus): Promise<Project[]>;
    findByUserId(userId: number): Promise<Project[]>;
    findByCreatorId(creatorId: number): Promise<Project[]>;
    create(project: Project): Promise<Project>;
    update(project: Project): Promise<Project>;
    delete(id: number): Promise<void>;
    exists(id: number): Promise<boolean>;
    getProjectWithMembers(id: number): Promise<Project | null>;
    getProjectWithTasks(id: number): Promise<Project | null>;
    getProjectWithFullDetails(id: number): Promise<Project | null>;
    searchProjects(query: string): Promise<Project[]>;
    getProjectStatistics(): Promise<{
        total: number;
        active: number;
        completed: number;
        archived: number;
        onHold: number;
    }>;
}

export class ProjectRepository implements IProjectRepository {
    private getIncludeOptions() {
        return {
            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    roles: true
                }
            },
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            roles: true
                        }
                    }
                }
            },
            tasks: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    completed: true,
                    points: true
                }
            },
            daily_logs: {
                select: {
                    id: true,
                    date: true,
                    note: true
                }
            },
            _count: {
                select: {
                    tasks: true,
                    members: true,
                    daily_logs: true
                }
            }
        };
    }

    async findById(id: number): Promise<Project | null> {
        const project = await prisma.projects.findUnique({
            where: { id },
            include: this.getIncludeOptions()
        });

        return project ? Project.fromPrisma(project) : null;
    }

    async findAll(): Promise<Project[]> {
        const projects = await prisma.projects.findMany({
            include: this.getIncludeOptions(),
            orderBy: { createdAt: 'desc' }
        });

        // Debug: Log the first project from database
        if (projects.length > 0) {
            console.log('First project from database:', JSON.stringify(projects[0], null, 2));
        }

        return projects.map(project => Project.fromPrisma(project));
    }

    async findByStatus(status: ProjectStatus): Promise<Project[]> {
        const projects = await prisma.projects.findMany({
            where: { status },
            include: this.getIncludeOptions(),
            orderBy: { createdAt: 'desc' }
        });

        return projects.map(project => Project.fromPrisma(project));
    }

    async findByUserId(userId: number): Promise<Project[]> {
        // Find projects where user is a member
        const projects = await prisma.projects.findMany({
            where: {
                members: {
                    some: { userId }
                }
            },
            include: this.getIncludeOptions(),
            orderBy: { createdAt: 'desc' }
        });

        return projects.map(project => Project.fromPrisma(project));
    }

    async findByCreatorId(creatorId: number): Promise<Project[]> {
        const projects = await prisma.projects.findMany({
            where: { createdBy: creatorId },
            include: this.getIncludeOptions(),
            orderBy: { createdAt: 'desc' }
        });

        return projects.map(project => Project.fromPrisma(project));
    }

    async create(project: Project): Promise<Project> {
        const errors = project.validate();
        if (errors.length > 0) {
            throw new Error(`Dados inválidos: ${errors.join(', ')}`);
        }

        const projectData = project.toJSON();
        console.log('ProjectRepository.create - projectData.links:', projectData.links);
        
        const createdProject = await prisma.projects.create({
            data: {
                name: projectData.name,
                description: projectData.description,
                createdAt: projectData.createdAt,
                createdBy: projectData.createdBy,
                status: projectData.status,
                links: projectData.links
            },
            include: this.getIncludeOptions()
        });

        console.log('ProjectRepository.create - created project links:', createdProject.links);
        return Project.fromPrisma(createdProject);
    }

    async update(project: Project): Promise<Project> {
        if (!project.id) {
            throw new Error('ID do projeto é obrigatório para atualização');
        }

        const errors = project.validate();
        if (errors.length > 0) {
            throw new Error(`Dados inválidos: ${errors.join(', ')}`);
        }

        const projectData = project.toJSON();
        console.log('ProjectRepository.update - projectData.links:', projectData.links);
        
        const updatedProject = await prisma.projects.update({
            where: { id: project.id },
            data: {
                name: projectData.name,
                description: projectData.description,
                status: projectData.status,
                links: projectData.links
            },
            include: this.getIncludeOptions()
        });

        console.log('ProjectRepository.update - updated project links:', updatedProject.links);
        return Project.fromPrisma(updatedProject);
    }

    async delete(id: number): Promise<void> {
        await prisma.projects.delete({
            where: { id }
        });
    }

    async exists(id: number): Promise<boolean> {
        const count = await prisma.projects.count({
            where: { id }
        });
        return count > 0;
    }

    async getProjectWithMembers(id: number): Promise<Project | null> {
        const project = await prisma.projects.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        roles: true
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                roles: true
                            }
                        }
                    }
                }
            }
        });

        return project ? Project.fromPrisma(project) : null;
    }

    async getProjectWithTasks(id: number): Promise<Project | null> {
        const project = await prisma.projects.findUnique({
            where: { id },
            include: {
                tasks: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        completed: true,
                        points: true,
                        priority: true,
                        dueDate: true
                    }
                }
            }
        });

        return project ? Project.fromPrisma(project) : null;
    }

    async getProjectWithFullDetails(id: number): Promise<Project | null> {
        const project = await prisma.projects.findUnique({
            where: { id },
            include: this.getIncludeOptions()
        });

        return project ? Project.fromPrisma(project) : null;
    }

    async searchProjects(query: string): Promise<Project[]> {
        const projects = await prisma.projects.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            },
            include: this.getIncludeOptions(),
            orderBy: { createdAt: 'desc' }
        });

        return projects.map(project => Project.fromPrisma(project));
    }

    async getProjectStatistics(): Promise<{
        total: number;
        active: number;
        completed: number;
        archived: number;
        onHold: number;
    }> {
        const [total, active, completed, archived, onHold] = await Promise.all([
            prisma.projects.count(),
            prisma.projects.count({ where: { status: 'active' } }),
            prisma.projects.count({ where: { status: 'completed' } }),
            prisma.projects.count({ where: { status: 'archived' } }),
            prisma.projects.count({ where: { status: 'on_hold' } })
        ]);

        return { total, active, completed, archived, onHold };
    }
}
