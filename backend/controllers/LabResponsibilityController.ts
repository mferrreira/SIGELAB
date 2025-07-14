import { LabResponsibilityModel } from '../models/LabResponsibilityModel';

export class LabResponsibilityController {
  private labRespModel = new LabResponsibilityModel();

  async getResponsibility(id: number) {
    return this.labRespModel.findById(id);
  }

  async getAllResponsibilities() {
    return this.labRespModel.findAll();
  }

  async createResponsibility(data: any) {
    return this.labRespModel.create(data);
  }

  async updateResponsibility(id: number, data: any) {
    return this.labRespModel.update(id, data);
  }

  async deleteResponsibility(id: number) {
    return this.labRespModel.delete(id);
  }

  async getResponsibilitiesByUser(userId: number) {
    return this.labRespModel.findByUserId(userId);
  }
} 