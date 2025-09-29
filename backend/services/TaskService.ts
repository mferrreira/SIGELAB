import { Task } from '../models/Task';
import { TaskRepository, ITaskRepository } from '../repositories/TaskRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { HistoryService } from './HistoryService';
import { HistoryRepository } from '../repositories/HistoryRepository';
import { NotificationService } from './NotificationService';
import { NotificationRepository } from '../repositories/NotificationRepository';

export interface ITaskService {
  findById(id: number): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  create(data: Omit<Task, 'id'>, creatorId: number): Promise<Task>;
  update(id: number, data: Partial<Task>, userId: number): Promise<Task>;
  delete(id: number, userId: number): Promise<void>;
  findByAssigneeId(userId: number): Promise<Task[]>;
  getTasksByUser(userId: number): Promise<Task[]>;
  getTasksForUser(userId: number, userRoles: string[]): Promise<Task[]>;
  completeTask(taskId: number, userId: number): Promise<Task>;
  approveTask(taskId: number, leaderId: number): Promise<Task>;
  rejectTask(taskId: number, leaderId: number, reason?: string): Promise<Task>;
}

export class TaskService implements ITaskService {
  private historyService: HistoryService;
  private notificationService: NotificationService;

  constructor(
    private taskRepository: ITaskRepository,
    private userRepository: UserRepository,
    private projectRepository: ProjectRepository
  ) {
    const historyRepository = new HistoryRepository();
    this.historyService = new HistoryService(historyRepository, userRepository);
    
    const notificationRepository = new NotificationRepository();
    this.notificationService = new NotificationService(notificationRepository);
  }

  async findById(id: number): Promise<Task | null> {
    return await this.taskRepository.findById(id);
  }

  async findAll(): Promise<Task[]> {
    return await this.taskRepository.findAll();
  }

  async create(data: Omit<Task, 'id'>, creatorId: number): Promise<Task> {
    const creator = await this.userRepository.findById(creatorId);
    if (!creator) {
      throw new Error('Criador não encontrado');
    }

    // Verificar se é uma quest global e se o usuário tem permissão
    if (data.isGlobal) {
      if (!this.canCreateGlobalQuest(creator)) {
        throw new Error('Usuário não tem permissão para criar quests globais');
      }
      // Para quests globais, não é necessário responsável ou projeto
      data.assignedTo = null;
      data.projectId = null;
      data.taskVisibility = 'public';
    } else {
      // Para tasks normais, validar projeto e responsável
      if (data.projectId) {
        const project = await this.projectRepository.findById(data.projectId);
        if (!project) {
          throw new Error('Projeto não encontrado');
        }
      }

      if (data.assignedTo) {
        const assignee = await this.userRepository.findById(data.assignedTo);
        if (!assignee) {
          throw new Error('Usuário não encontrado');
        }
      }
    }

    const task = Task.create(data);
    const createdTask = await this.taskRepository.create(task);
    
    await this.historyService.recordEntityCreation('TASK', createdTask.id!, creatorId, createdTask.toJSON());
    
    return createdTask;
  }

  async update(id: number, data: Partial<Task>, userId: number): Promise<Task> {
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      throw new Error('Tarefa não encontrada');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const userRoles = user.roles || [];
    let canModifyCompleted = userRoles.some(role => 
      ['COORDENADOR', 'LABORATORISTA', 'GERENTE_PROJETO', "GERENTE"].includes(role)
    );

    if (!canModifyCompleted && existingTask.projectId) {
      const project = await this.projectRepository.findById(existingTask.projectId);
      if (project && (project.createdBy === userId || project.leaderId === userId)) {
        canModifyCompleted = true;
      }
    }

    if (existingTask.completed && !canModifyCompleted) {
      throw new Error('Não é possível modificar tarefas concluídas sem permissões adequadas');
    }

    if (data.assignedTo) {
      const assignee = await this.userRepository.findById(data.assignedTo);
      if (!assignee) {
        throw new Error('Usuário não encontrado');
      }
    }

    if (data.title !== undefined) {
      existingTask.setTitle(data.title);
    }
    if (data.description !== undefined) {
      existingTask.setDescription(data.description!);
    }
    if (data.priority !== undefined) {
      existingTask.setPriority(data.priority);
    }
    if (data.status !== undefined) {
      const oldStatus = existingTask.status;
      existingTask.setStatus(data.status);
      
      // Se a tarefa foi movida para "in-review", enviar notificação para o líder do projeto
      if (oldStatus !== 'in-review' && data.status === 'in-review' && existingTask.projectId) {
        const project = await this.projectRepository.findById(existingTask.projectId);
        if (project && project.leaderId) {
          await this.notificationService.createTaskReviewRequest(
            existingTask.id!,
            existingTask.title,
            userId,
            project.leaderId
          );
        }
      }
    }
    if (data.assignedTo !== undefined) {
      existingTask.assignTo(data.assignedTo!);
    }
    if (data.points !== undefined) {
      existingTask.updatePoints(data.points);
    }
    if (data.dueDate !== undefined) {
      existingTask.setDueDate(data.dueDate);
    }

    const oldTaskData = existingTask.toJSON();
    const updatedTask = await this.taskRepository.update(id, existingTask);
    
    await this.historyService.recordEntityUpdate('TASK', id, userId, oldTaskData, updatedTask.toJSON());
    
    return updatedTask;
  }

  async delete(id: number, userId: number): Promise<void> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new Error('Tarefa não encontrada');
    }

    const taskData = task.toJSON();
    await this.taskRepository.delete(id);
    
    await this.historyService.recordEntityDeletion('TASK', id, userId, taskData);
  }

  async findByAssigneeId(userId: number): Promise<Task[]> {
    return await this.taskRepository.findByAssigneeId(userId);
  }

  async getTasksByUser(userId: number): Promise<Task[]> {
    return await this.taskRepository.findByAssigneeId(userId);
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return await this.taskRepository.findByProjectId(projectId);
  }

  async getTasksForUser(userId: number, userRoles: string[]): Promise<Task[]> {
    // Verifica se é gerente, colaborador ou administrador
    const hasManageTasksPermission = userRoles.includes('COORDENADOR') || 
                                   userRoles.includes('GERENTE') || 
                                   userRoles.includes('GERENTE_PROJETO') || 
                                   userRoles.includes('LABORATORISTA') ||
                                   userRoles.includes('COLABORADOR') ||
                                   userRoles.includes('VOLUNTARIO');

    if (hasManageTasksPermission) {
      // Busca todas as tarefas
      return await this.taskRepository.findAll();
    }

    // Para outros usuários, busca apenas tarefas atribuídas a eles
    return await this.taskRepository.findByAssigneeId(userId);
  }

  async completeTask(taskId: number, userId: number): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error('Tarefa não encontrada');
    }

    if (task.completed) {
      throw new Error('Tarefa já concluída');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const oldTaskData = task.toJSON();
    task.complete();
    const updatedTask = await this.taskRepository.update(taskId, task);
    
    const pointsToAward = task.points;
    if (pointsToAward > 0) {
      user.addPoints(pointsToAward);
      user.incrementCompletedTasks();
      await this.userRepository.update(user);
    }
    
    await this.historyService.recordEntityUpdate('TASK', taskId, userId, oldTaskData, updatedTask.toJSON());
    
    return updatedTask;
  }

  async approveTask(taskId: number, leaderId: number): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error('Tarefa não encontrada');
    }

    if (task.status !== 'in-review') {
      throw new Error('Tarefa não está em revisão');
    }

    // Verificar se o usuário é líder do projeto
    if (task.projectId) {
      const project = await this.projectRepository.findById(task.projectId);
      if (!project || project.leaderId !== leaderId) {
        throw new Error('Usuário não é líder do projeto');
      }
    }

    const oldTaskData = task.toJSON();
    task.updateStatus('done');
    task.complete();
    const updatedTask = await this.taskRepository.update(taskId, task);

    // Adicionar pontos ao usuário responsável
    if (task.assignedTo) {
      const user = await this.userRepository.findById(task.assignedTo);
      if (user && task.points > 0) {
        user.addPoints(task.points);
        user.incrementCompletedTasks();
        await this.userRepository.update(user);
      }

      // Enviar notificação de aprovação
      await this.notificationService.createTaskApproved(taskId, task.title, task.assignedTo);
    }

    await this.historyService.recordEntityUpdate('TASK', taskId, leaderId, oldTaskData, updatedTask.toJSON());

    return updatedTask;
  }

  async rejectTask(taskId: number, leaderId: number, reason?: string): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error('Tarefa não encontrada');
    }

    if (task.status !== 'in-review') {
      throw new Error('Tarefa não está em revisão');
    }

    // Verificar se o usuário é líder do projeto
    if (task.projectId) {
      const project = await this.projectRepository.findById(task.projectId);
      if (!project || project.leaderId !== leaderId) {
        throw new Error('Usuário não é líder do projeto');
      }
    }

    const oldTaskData = task.toJSON();
    task.updateStatus('adjust');
    const updatedTask = await this.taskRepository.update(taskId, task);

    // Enviar notificação de rejeição
    if (task.assignedTo) {
      await this.notificationService.createTaskRejected(taskId, task.title, task.assignedTo, reason);
    }

    await this.historyService.recordEntityUpdate('TASK', taskId, leaderId, oldTaskData, updatedTask.toJSON());

    return updatedTask;
  }

  private canCreateGlobalQuest(user: any): boolean {
    return user.roles && (user.roles.includes('COORDENADOR') || user.roles.includes('GERENTE'));
  }
}