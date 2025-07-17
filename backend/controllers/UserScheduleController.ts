import { UserScheduleModel } from '../models/UserScheduleModel';
import { prisma } from '@/lib/database/prisma';

export class UserScheduleController {
  private userScheduleModel = new UserScheduleModel();

  async getSchedule(id: number) {
    return this.userScheduleModel.findById(id);
  }

  async getAllSchedules() {
    return this.userScheduleModel.findAll();
  }

  async createSchedule(data: any) {
    if (!data.userId || isNaN(Number(data.userId))) {
      throw new Error('userId é obrigatório e deve ser um número');
    }
    const user = await prisma.users.findUnique({ where: { id: data.userId } });
    if (!user) throw new Error('Usuário não encontrado');

    const schedules = await this.userScheduleModel.findByUserId(data.userId);
    
    let totalMinutes = schedules.reduce((total: any, sched: any) => {
      const [startH, startM] = sched.startTime.split(':').map(Number);
      const [endH, endM] = sched.endTime.split(':').map(Number);
      return total + ((endH * 60 + endM) - (startH * 60 + startM));
    }, 0);
    const [newStartH, newStartM] = data.startTime.split(':').map(Number);
    const [newEndH, newEndM] = data.endTime.split(':').map(Number);
    totalMinutes += ((newEndH * 60 + newEndM) - (newStartH * 60 + newStartM));
    const totalHours = totalMinutes / 60;
    if (totalHours > user.weekHours) {
      throw new Error(`Total de horas agendadas (${totalHours.toFixed(2)}) excede o limite semanal do usuário (${user.weekHours}h)`);
    }
    return this.userScheduleModel.create(data);
  }

  async updateSchedule(id: number, data: any) {
    return this.userScheduleModel.update(id, data);
  }

  async deleteSchedule(id: number) {
    return this.userScheduleModel.delete(id);
  }

  async getSchedulesByUser(userId: number) {
    return this.userScheduleModel.findByUserId(userId);
  }
} 