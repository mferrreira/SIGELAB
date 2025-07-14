import { TaskModel } from '../models/TaskModel';

export class TaskController {
  private taskModel = new TaskModel();

  async getTask(id: number) {
    return this.taskModel.findById(id);
  }

  async getAllTasks() {
    return this.taskModel.findAll();
  }

  async createTask(data: any) {
    return this.taskModel.create(data);
  }

  async updateTask(id: number, data: any) {
    return this.taskModel.update(id, data);
  }

  async deleteTask(id: number) {
    return this.taskModel.delete(id);
  }

  async getTasksByProject(projectId: number) {
    return this.taskModel.findByProjectId(projectId);
  }

  async getTasksByAssignee(userId: number) {
    return this.taskModel.findByAssigneeId(userId);
  }

  async getTasksByStatus(status: string) {
    return this.taskModel.findByStatus(status);
  }
} 