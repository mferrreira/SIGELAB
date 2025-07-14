import { UserController } from './UserController';
import { prisma } from '@/lib/prisma';

export class LaboratoristController extends UserController {
  async getLabSchedules(userId: string) {
    const schedules = await prisma.user_schedules.findMany({
      where: { userId: Number(userId) },
      include: { user: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    return schedules;
  }

  async logLabActivity(userId: string, activity: string) {
    return { userId, activity };
  }

  async getLabResponsibilities(userId: string) {
    const responsibilities = await prisma.lab_responsibilities.findMany({
      where: { userId: Number(userId) },
    });
    return responsibilities;
  }

  async updateLabResponsibility(userId: string, responsibilityId: string, data: any) {
    const responsibility = await prisma.lab_responsibilities.update({
      where: { id: Number(responsibilityId) },
      data,
    });
    return responsibility;
  }
} 