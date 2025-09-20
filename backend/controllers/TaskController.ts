import { TaskService } from '../services/TaskService';
import { TaskRepository } from '../repositories/TaskRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { Task } from '../models/Task';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    const taskRepository = new TaskRepository();
    const userRepository = new UserRepository();
    const projectRepository = new ProjectRepository();
    this.taskService = new TaskService(taskRepository, userRepository, projectRepository);
  }

  async getTask(id: number): Promise<Task | null> {
    return await this.taskService.findById(id);
  }

  async getAllTasks(): Promise<Task[]> {
    return await this.taskService.findAll();
  }

  async createTask(data: any, creatorId: number): Promise<Task> {
    return await this.taskService.create(data, creatorId);
  }

  async updateTask(id: number, data: any, userId: number): Promise<Task> {
    return await this.taskService.update(id, data, userId);
  }

  async deleteTask(id: number, userId: number): Promise<void> {
    return await this.taskService.delete(id, userId);
  }

  async getTasksByAssignee(userId: number): Promise<Task[]> {
    return await this.taskService.findByAssigneeId(userId);
  }

  async getTasksByUser(userId: number): Promise<Task[]> {
    return await this.taskService.getTasksByUser(userId);
  }

  async completeTask(taskId: number, userId: number): Promise<Task> {
    return await this.taskService.completeTask(taskId, userId);
  }
} 