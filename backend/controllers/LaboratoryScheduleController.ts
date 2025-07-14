import { LaboratoryScheduleModel } from '../models/LaboratoryScheduleModel';

export class LaboratoryScheduleController {
  private labScheduleModel = new LaboratoryScheduleModel();

  async getSchedule(id: number) {
    return this.labScheduleModel.findById(id);
  }

  async getAllSchedules() {
    return this.labScheduleModel.findAll();
  }

  async createSchedule(data: any) {
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    if ((endH * 60 + endM) <= (startH * 60 + startM)) {
      throw new Error('Horário final deve ser após o horário inicial');
    }
    return this.labScheduleModel.create(data);
  }

  async updateSchedule(id: number, data: any) {
    return this.labScheduleModel.update(id, data);
  }

  async deleteSchedule(id: number) {
    return this.labScheduleModel.delete(id);
  }

  async getSchedulesByDay(dayOfWeek: number) {
    return this.labScheduleModel.findByDayOfWeek(dayOfWeek);
  }
} 