import { ProjectModel } from '../models/ProjectModel';

export class ProjectController {
  private projectModel = new ProjectModel();

  async getProject(id: number) {
    return this.projectModel.findById(id);
  }

  async getAllProjects() {
    return this.projectModel.findAll();
  }

  async createProject(data: any) {
    return this.projectModel.create(data);
  }

  async updateProject(id: number, data: any) {
    return this.projectModel.update(id, data);
  }

  async deleteProject(id: number) {
    return this.projectModel.delete(id);
  }

  async getProjectsByUser(userId: number) {
    return this.projectModel.findByUserId(userId);
  }

  async getProjectsByStatus(status: string) {
    return this.projectModel.findByStatus(status);
  }
} 