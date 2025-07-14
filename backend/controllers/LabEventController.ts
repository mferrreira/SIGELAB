import { LabEventModel } from '../models/LabEventModel';

export class LabEventController {
  private labEventModel = new LabEventModel();

  async getEventsByDate(date: Date) {
    return this.labEventModel.findByDate(date);
  }

  async createEvent(data: any) {
    return this.labEventModel.create(data);
  }

  async getAllEvents() {
    return this.labEventModel.findAll();
  }
} 