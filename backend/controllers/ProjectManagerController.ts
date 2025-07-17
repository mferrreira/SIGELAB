import { UserController } from './UserController';
import { prisma } from '@/lib/database/prisma';
import { UserRole } from '@prisma/client';

const validProjectRoles = [
  'COORDENADOR',
  'GERENTE',
  'LABORATORISTA',
  'PESQUISADOR',
  'GERENTE_PROJETO',
  'COLABORADOR',
  'VOLUNTARIO',
];

export class ProjectManagerController extends UserController {
  async createProject(data: any) {
    const project = await prisma.projects.create({
      data,
    });
    return project;
  }

  async assignUserToProject(projectId: string, userId: string, roles: string[]) {
    if (!validProjectRoles.includes(roles[0])) {
      throw new Error(`Papel de projeto inválido: ${roles[0]}`);
    }
    const membership = await prisma.project_members.create({
      data: {
        projectId: Number(projectId),
        userId: Number(userId),
        roles: roles as UserRole[],
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