export interface IWeeklyReport {
  id?: number;
  userId: number;
  userName: string;
  weekStart: Date;
  weekEnd: Date;
  totalLogs: number;
  summary?: string | null;
  createdAt?: Date;
}

export class WeeklyReport {
  private _id?: number;
  private _userId: number;
  private _userName: string;
  private _weekStart: Date;
  private _weekEnd: Date;
  private _totalLogs: number;
  private _summary?: string | null;
  private _createdAt: Date;

  constructor(data: IWeeklyReport) {
    this._id = data.id;
    this._userId = data.userId;
    this._userName = data.userName;
    this._weekStart = data.weekStart;
    this._weekEnd = data.weekEnd;
    this._totalLogs = data.totalLogs;
    this._summary = data.summary;
    this._createdAt = data.createdAt || new Date();
  }

  // Getters
  get id(): number | undefined { return this._id; }
  get userId(): number { return this._userId; }
  get userName(): string { return this._userName; }
  get weekStart(): Date { return this._weekStart; }
  get weekEnd(): Date { return this._weekEnd; }
  get totalLogs(): number { return this._totalLogs; }
  get summary(): string | null | undefined { return this._summary; }
  get createdAt(): Date { return this._createdAt; }

  // Business Logic Methods
  updateSummary(summary: string): void {
    if (summary && summary.length > 1000) {
      throw new Error('Summary cannot exceed 1000 characters');
    }
    this._summary = summary;
  }

  updateTotalLogs(totalLogs: number): void {
    if (totalLogs < 0) {
      throw new Error('Total logs cannot be negative');
    }
    this._totalLogs = totalLogs;
  }

  incrementLogs(): void {
    this._totalLogs += 1;
  }

  decrementLogs(): void {
    if (this._totalLogs > 0) {
      this._totalLogs -= 1;
    }
  }

  setWeekPeriod(weekStart: Date, weekEnd: Date): void {
    if (weekStart >= weekEnd) {
      throw new Error('Week start must be before week end');
    }
    
    // Normalize weekStart to 00:00:00
    const normalizedStart = new Date(weekStart);
    normalizedStart.setHours(0, 0, 0, 0);
    
    // Normalize weekEnd to 23:59:59
    const normalizedEnd = new Date(weekEnd);
    normalizedEnd.setHours(23, 59, 59, 999);
    
    this._weekStart = normalizedStart;
    this._weekEnd = normalizedEnd;
  }

  getWeekDuration(): number {
    return this._weekEnd.getTime() - this._weekStart.getTime();
  }

  getWeekDurationInDays(): number {
    return Math.ceil(this.getWeekDuration() / (1000 * 60 * 60 * 24));
  }

  isCurrentWeek(): boolean {
    const now = new Date();
    return now >= this._weekStart && now <= this._weekEnd;
  }

  isPastWeek(): boolean {
    const now = new Date();
    return now > this._weekEnd;
  }

  isFutureWeek(): boolean {
    const now = new Date();
    return now < this._weekStart;
  }

  getWeekNumber(): number {
    const startOfYear = new Date(this._weekStart.getFullYear(), 0, 1);
    const days = Math.floor((this._weekStart.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  }

  getYear(): number {
    return this._weekStart.getFullYear();
  }

  // Validation
  validate(): void {
    if (!this._userId || this._userId <= 0) {
      throw new Error('Valid user ID is required');
    }
    if (!this._userName || this._userName.trim().length === 0) {
      throw new Error('User name is required');
    }
    if (this._userName.length > 100) {
      throw new Error('User name cannot exceed 100 characters');
    }
    if (!this._weekStart || !this._weekEnd) {
      throw new Error('Week start and end dates are required');
    }
    if (this._weekStart >= this._weekEnd) {
      throw new Error('Week start must be before week end');
    }
    if (this._totalLogs < 0) {
      throw new Error('Total logs cannot be negative');
    }
    if (this._summary && this._summary.length > 1000) {
      throw new Error('Summary cannot exceed 1000 characters');
    }
  }

  // Factory Methods
  static create(data: Omit<IWeeklyReport, 'id' | 'createdAt'>): WeeklyReport {
    const report = new WeeklyReport({
      ...data,
      totalLogs: data.totalLogs || 0
    });
    report.validate();
    return report;
  }

  static fromPrisma(data: any): WeeklyReport {
    return new WeeklyReport({
      id: data.id,
      userId: data.userId,
      userName: data.userName,
      weekStart: new Date(data.weekStart),
      weekEnd: new Date(data.weekEnd),
      totalLogs: data.totalLogs,
      summary: data.summary,
      createdAt: new Date(data.createdAt)
    });
  }

  // Conversion Methods
  toPrisma(): any {
    return {
      id: this._id,
      userId: this._userId,
      userName: this._userName,
      weekStart: this._weekStart,
      weekEnd: this._weekEnd,
      totalLogs: this._totalLogs,
      summary: this._summary,
      createdAt: this._createdAt
    };
  }

  toJSON(): any {
    return {
      id: this._id,
      userId: this._userId,
      userName: this._userName,
      weekStart: this._weekStart.toISOString(),
      weekEnd: this._weekEnd.toISOString(),
      totalLogs: this._totalLogs,
      summary: this._summary,
      createdAt: this._createdAt.toISOString()
    };
  }
}

