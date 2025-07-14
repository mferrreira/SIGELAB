import { UserController } from './UserController';
import { prisma } from '@/lib/prisma';

export class VolunteerController extends UserController {
  async getAssignedTasks(userId: string) {
    const tasks = await prisma.tasks.findMany({
      where: { assignedTo: Number(userId) },
      include: { assignee: true, projectObj: true },
      orderBy: { id: 'desc' },
    });
    return tasks;
  }

  async logWorkSession(userId: string, sessionData: any) {
    const session = await prisma.work_sessions.create({
      data: {
        userId: Number(userId),
        ...sessionData,
      },
    });
    return session;
  }

  async submitReport(userId: string, reportData: any) {
    const report = await prisma.weekly_reports.create({
      data: {
        userId: Number(userId),
        ...reportData,
      },
    });
    return report;
  }

  async updateTaskStatus(userId: string, taskId: string, status: string) {
    const task = await prisma.tasks.update({
      where: { id: Number(taskId), assignedTo: Number(userId) },
      data: { status },
    });
    return task;
  }
} 