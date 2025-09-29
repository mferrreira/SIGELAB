import { TaskService } from '../services/TaskService';
import { TaskRepository } from '../repositories/TaskRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { Task } from '../models/Task';

// Sistema de pontuação baseado em prioridade
const PRIORITY_POINTS = {
  'low': 25,
  'medium': 50,
  'high': 100,
  'urgent': 150
} as const;

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
    const validatedData = await this.validateAndAdjustPoints(data, creatorId);
    return await this.taskService.create(validatedData, creatorId);
  }

  async updateTask(id: number, data: any, userId: number): Promise<Task> {
    data.completed === true ? data.completed = false : data.completed = true;
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

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return await this.taskService.getTasksByProject(projectId);
  }

  async completeTask(taskId: number, userId: number): Promise<Task> {
    return await this.taskService.completeTask(taskId, userId);
  }

  async approveTask(taskId: number, leaderId: number): Promise<Task> {
    return await this.taskService.approveTask(taskId, leaderId);
  }

  async rejectTask(taskId: number, leaderId: number, reason?: string): Promise<Task> {
    return await this.taskService.rejectTask(taskId, leaderId, reason);
  }

  async getTasksForUser(userId: number, userRoles: string[]): Promise<Task[]> {
    return await this.taskService.getTasksForUser(userId, userRoles);
  }

  private async validateAndAdjustPoints(data: any, creatorId: number): Promise<any> {
    const userRepository = new UserRepository();
    const creator = await userRepository.findById(creatorId);
    
    if (!creator) {
      throw new Error('Usuário criador não encontrado');
    }

    const userRoles = creator.roles || [];
    const isManagerOrCoordinator = userRoles.includes('COORDENADOR') || userRoles.includes('GERENTE');
    
    // Se não for coordenador/gerente, usar pontos baseados na prioridade
    if (!isManagerOrCoordinator) {
      const priorityPoints = PRIORITY_POINTS[data.priority as keyof typeof PRIORITY_POINTS];
      data.points = priorityPoints;
    }
    
    // Se for coordenador/gerente, manter os pontos enviados (já validados no frontend)
    // Mas garantir que não seja negativo
    if (data.points < 0) {
      data.points = 0;
    }
    
    return data;
  }
} 