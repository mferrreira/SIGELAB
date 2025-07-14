import { UserController } from './UserController';
import { prisma } from '@/lib/prisma';

export class ProjectManagerController extends UserController {
  async createProject(data: any) {
    const project = await prisma.projects.create({
      data,
    });
    return project;
  }

  async assignUserToProject(projectId: string, userId: string, role: string) {
    const membership = await prisma.project_members.create({
      data: {
        projectId: Number(projectId),
        userId: Number(userId),
        role,
      },
    });
    return membership;
  }

  async manageProjectTask(projectId: string, taskId: string, data: any) {
    const task = await prisma.tasks.update({
      where: { id: Number(taskId), projectId: Number(projectId) },
      data,
    });
    return task;
  }

  async getProjectProgress(projectId: string) {
    const [total, completed] = await Promise.all([
      prisma.tasks.count({ where: { projectId: Number(projectId) } }),
      prisma.tasks.count({ where: { projectId: Number(projectId), status: { in: ["completed", "done"] } } })
    ]);
    return {
      projectId,
      totalTasks: total,
      completedTasks: completed,
      progress: total > 0 ? completed / total : 0,
    };
  }
} 