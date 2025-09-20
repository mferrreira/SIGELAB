import { TaskStatus, TaskPriority, TaskVisibility } from '@prisma/client';

export interface ITask {
  id?: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: number | null;
  projectId?: number | null;
  dueDate?: string | null;
  points: number;
  completed: boolean;
  taskVisibility: TaskVisibility;
}

export class Task {
  private _id?: number;
  private _title: string;
  private _description?: string | null;
  private _status: TaskStatus;
  private _priority: TaskPriority;
  private _assignedTo?: number | null;
  private _projectId?: number | null;
  private _dueDate?: string | null;
  private _points: number;
  private _completed: boolean;
  private _taskVisibility: TaskVisibility;

  constructor(data: ITask) {
    this._id = data.id;
    this._title = data.title;
    this._description = data.description;
    this._status = data.status;
    this._priority = data.priority;
    this._assignedTo = data.assignedTo;
    this._projectId = data.projectId;
    this._dueDate = data.dueDate;
    this._points = data.points;
    this._completed = data.completed;
    this._taskVisibility = data.taskVisibility;
  }

  // Getters
  get id(): number | undefined { return this._id; }
  get title(): string { return this._title; }
  get description(): string | null | undefined { return this._description; }
  get status(): TaskStatus { return this._status; }
  get priority(): TaskPriority { return this._priority; }
  get assignedTo(): number | null | undefined { return this._assignedTo; }
  get projectId(): number | null | undefined { return this._projectId; }
  get dueDate(): string | null | undefined { return this._dueDate; }
  get points(): number { return this._points; }
  get completed(): boolean { return this._completed; }
  get taskVisibility(): TaskVisibility { return this._taskVisibility; }

  // Business Logic Methods
  assignTo(userId: number): void {
    this._assignedTo = userId;
  }

  unassign(): void {
    this._assignedTo = null;
  }

  updateStatus(status: TaskStatus): void {
    this._status = status;
    if (status === 'done') {
      this._completed = true;
    } else {
      this._completed = false;
    }
  }

  updatePriority(priority: TaskPriority): void {
    this._priority = priority;
  }

  updatePoints(points: number): void {
    if (points < 0) {
      throw new Error('Points cannot be negative');
    }
    this._points = points;
  }

  setDueDate(dueDate: string | null): void {
    this._dueDate = dueDate;
  }

  updateVisibility(visibility: TaskVisibility): void {
    this._taskVisibility = visibility;
  }

  isOverdue(): boolean {
    if (!this._dueDate) return false;
    const dueDate = new Date(this._dueDate);
    const now = new Date();
    return dueDate < now && !this._completed;
  }

  canBeCompleted(): boolean {
    return this._status !== 'done' && this._assignedTo !== null;
  }

  complete(): void {
    if (!this.canBeCompleted()) {
      throw new Error('Task cannot be completed');
    }
    this._status = 'done';
    this._completed = true;
  }

  reopen(): void {
    this._status = 'to-do';
    this._completed = false;
  }

  // Validation
  validate(): void {
    if (!this._title || this._title.trim().length === 0) {
      throw new Error('Task title is required');
    }
    if (this._title.length > 200) {
      throw new Error('Task title cannot exceed 200 characters');
    }
    if (this._description && this._description.length > 1000) {
      throw new Error('Task description cannot exceed 1000 characters');
    }
    if (this._points < 0) {
      throw new Error('Task points cannot be negative');
    }
  }

  // Factory Methods
  static create(data: Omit<ITask, 'id'>): Task {
    const task = new Task({
      ...data,
      points: data.points || 0,
      completed: data.completed || false,
      taskVisibility: data.taskVisibility || 'delegated'
    });
    task.validate();
    return task;
  }

  static fromPrisma(data: any): Task {
    return new Task({
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignedTo: data.assignedTo,
      projectId: data.projectId,
      dueDate: data.dueDate,
      points: data.points,
      completed: data.completed,
      taskVisibility: data.taskVisibility
    });
  }

  // Conversion Methods
  toPrisma(): any {
    return {
      id: this._id,
      title: this._title,
      description: this._description,
      status: this._status,
      priority: this._priority,
      assignedTo: this._assignedTo,
      projectId: this._projectId,
      dueDate: this._dueDate,
      points: this._points,
      completed: this._completed,
      taskVisibility: this._taskVisibility
    };
  }

  toJSON(): any {
    return {
      id: this._id,
      title: this._title,
      description: this._description,
      status: this._status,
      priority: this._priority,
      assignedTo: this._assignedTo,
      projectId: this._projectId,
      dueDate: this._dueDate,
      points: this._points,
      completed: this._completed,
      taskVisibility: this._taskVisibility
    };
  }
}

