import { Task } from '../models/Task';
import { TaskRepository, ITaskRepository } from '../repositories/TaskRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { HistoryService } from './HistoryService';
import { HistoryRepository } from '../repositories/HistoryRepository';

export interface ITaskService {
  findById(id: number): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  create(data: Omit<Task, 'id'>, creatorId: number): Promise<Task>;
  update(id: number, data: Partial<Task>, userId: number): Promise<Task>;
  delete(id: number, userId: number): Promise<void>;
  findByAssigneeId(userId: number): Promise<Task[]>;
  getTasksByUser(userId: number): Promise<Task[]>;
  completeTask(taskId: number, userId: number): Promise<Task>;
}

export class TaskService implements ITaskService {
  private historyService: HistoryService;

  constructor(
    private taskRepository: ITaskRepository,
    private userRepository: UserRepository,
    private projectRepository: ProjectRepository
  ) {
    const historyRepository = new HistoryRepository();
    this.historyService = new HistoryService(historyRepository, userRepository);
  }

  async findById(id: number): Promise<Task | null> {
    return await this.taskRepository.findById(id);
  }

  async findAll(): Promise<Task[]> {
    return await this.taskRepository.findAll();
  }

  async create(data: Omit<Task, 'id'>, creatorId: number): Promise<Task> {
    // Validate creator exists
    const creator = await this.userRepository.findById(creatorId);
    if (!creator) {
      throw new Error('Creator not found');
    }

    // Validate project if provided
    if (data.projectId) {
      const project = await this.projectRepository.findById(data.projectId);
      if (!project) {
        throw new Error('Project not found');
      }
    }

    // Validate assignee if provided
    if (data.assignedTo) {
      const assignee = await this.userRepository.findById(data.assignedTo);
      if (!assignee) {
        throw new Error('Assignee not found');
      }
    }

    const task = Task.create(data);
    const createdTask = await this.taskRepository.create(task);
    
    // Record creation in history
    await this.historyService.recordEntityCreation('TASK', createdTask.id!, creatorId, createdTask.toJSON());
    
    return createdTask;
  }

  async update(id: number, data: Partial<Task>, userId: number): Promise<Task> {
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      throw new Error('Task not found');
    }

    // Validate assignee if being updated
    if (data.assignedTo) {
      const assignee = await this.userRepository.findById(data.assignedTo);
      if (!assignee) {
        throw new Error('Assignee not found');
      }
    }

    // Apply updates to existing task
    if (data.title !== undefined) {
      existingTask.updateTitle(data.title);
    }
    if (data.description !== undefined) {
      existingTask.updateDescription(data.description);
    }
    if (data.priority !== undefined) {
      existingTask.updatePriority(data.priority);
    }
    if (data.status !== undefined) {
      existingTask.updateStatus(data.status);
    }
    if (data.assignedTo !== undefined) {
      existingTask.assignTo(data.assignedTo);
    }
    if (data.points !== undefined) {
      existingTask.updatePoints(data.points);
    }
    if (data.dueDate !== undefined) {
      existingTask.updateDueDate(data.dueDate);
    }

    const oldTaskData = existingTask.toJSON();
    const updatedTask = await this.taskRepository.update(existingTask);
    
    // Record update in history
    await this.historyService.recordEntityUpdate('TASK', id, userId, oldTaskData, updatedTask.toJSON());
    
    return updatedTask;
  }

  async delete(id: number, userId: number): Promise<void> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    const taskData = task.toJSON();
    await this.taskRepository.delete(id);
    
    // Record deletion in history
    await this.historyService.recordEntityDeletion('TASK', id, userId, taskData);
  }

  async findByAssigneeId(userId: number): Promise<Task[]> {
    return await this.taskRepository.findByAssigneeId(userId);
  }

  async getTasksByUser(userId: number): Promise<Task[]> {
    return await this.taskRepository.findByUserId(userId);
  }

  async completeTask(taskId: number, userId: number): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const oldTaskData = task.toJSON();
    task.complete();
    const updatedTask = await this.taskRepository.update(task);
    
    // Record completion in history
    await this.historyService.recordEntityUpdate('TASK', taskId, userId, oldTaskData, updatedTask.toJSON());
    
    return updatedTask;
  }
}