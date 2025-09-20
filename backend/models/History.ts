export type HistoryAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'ASSIGN' 
  | 'UNASSIGN' 
  | 'COMPLETE' 
  | 'REOPEN' 
  | 'APPROVE' 
  | 'REJECT' 
  | 'AWARD' 
  | 'REVOKE' 
  | 'ADD_MEMBER' 
  | 'REMOVE_MEMBER' 
  | 'CHANGE_STATUS' 
  | 'CHANGE_PRIORITY' 
  | 'CHANGE_ROLE' 
  | 'UPDATE_POINTS' 
  | 'UPDATE_PROFILE' 
  | 'ADD_LINK' 
  | 'REMOVE_LINK' 
  | 'UPDATE_LINK';

export type HistoryEntity = 
  | 'USER' 
  | 'TASK' 
  | 'PROJECT' 
  | 'DAILY_LOG' 
  | 'WORK_SESSION' 
  | 'WEEKLY_REPORT'
  | 'USER_SCHEDULE' 
  | 'ISSUE' 
  | 'PURCHASE' 
  | 'REWARD' 
  | 'BADGE' 
  | 'PROJECT_MEMBERSHIP' 
  | 'USER_BADGE'
  | 'LAB_EVENT'
  | 'LABORATORY_SCHEDULE'
  | 'LAB_RESPONSIBILITY';

export interface IHistory {
  id?: number;
  entityType: HistoryEntity;
  entityId: number;
  action: HistoryAction;
  performedBy: number;
  performedAt: Date;
  oldValues?: any;
  newValues?: any;
  description?: string;
  metadata?: any;
}

export class History {
  private _id?: number;
  private _entityType: HistoryEntity;
  private _entityId: number;
  private _action: HistoryAction;
  private _performedBy: number;
  private _performedAt: Date;
  private _oldValues?: any;
  private _newValues?: any;
  private _description?: string;
  private _metadata?: any;

  constructor(data: IHistory) {
    this._id = data.id;
    this._entityType = data.entityType;
    this._entityId = data.entityId;
    this._action = data.action;
    this._performedBy = data.performedBy;
    this._performedAt = data.performedAt || new Date();
    this._oldValues = data.oldValues;
    this._newValues = data.newValues;
    this._description = data.description;
    this._metadata = data.metadata;
  }

  // Getters
  get id(): number | undefined { return this._id; }
  get entityType(): HistoryEntity { return this._entityType; }
  get entityId(): number { return this._entityId; }
  get action(): HistoryAction { return this._action; }
  get performedBy(): number { return this._performedBy; }
  get performedAt(): Date { return this._performedAt; }
  get oldValues(): any { return this._oldValues; }
  get newValues(): any { return this._newValues; }
  get description(): string | undefined { return this._description; }
  get metadata(): any { return this._metadata; }

  // Business Logic Methods
  setDescription(description: string): void {
    this._description = description;
  }

  setMetadata(metadata: any): void {
    this._metadata = metadata;
  }

  getChanges(): { field: string; oldValue: any; newValue: any }[] {
    if (!this._oldValues || !this._newValues) {
      return [];
    }

    const changes: { field: string; oldValue: any; newValue: any }[] = [];
    
    // Compare old and new values
    const allKeys = new Set([
      ...Object.keys(this._oldValues || {}),
      ...Object.keys(this._newValues || {})
    ]);

    for (const key of allKeys) {
      const oldValue = this._oldValues?.[key];
      const newValue = this._newValues?.[key];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({ field: key, oldValue, newValue });
      }
    }

    return changes;
  }

  hasChanges(): boolean {
    return this.getChanges().length > 0;
  }

  getActionDescription(): string {
    const entityName = this._entityType.toLowerCase().replace('_', ' ');
    const actionName = this._action.toLowerCase().replace('_', ' ');
    
    switch (this._action) {
      case 'CREATE':
        return `Created ${entityName}`;
      case 'UPDATE':
        return `Updated ${entityName}`;
      case 'DELETE':
        return `Deleted ${entityName}`;
      case 'ASSIGN':
        return `Assigned ${entityName}`;
      case 'UNASSIGN':
        return `Unassigned ${entityName}`;
      case 'COMPLETE':
        return `Completed ${entityName}`;
      case 'REOPEN':
        return `Reopened ${entityName}`;
      case 'APPROVE':
        return `Approved ${entityName}`;
      case 'REJECT':
        return `Rejected ${entityName}`;
      case 'AWARD':
        return `Awarded ${entityName}`;
      case 'REVOKE':
        return `Revoked ${entityName}`;
      case 'ADD_MEMBER':
        return `Added member to ${entityName}`;
      case 'REMOVE_MEMBER':
        return `Removed member from ${entityName}`;
      case 'CHANGE_STATUS':
        return `Changed status of ${entityName}`;
      case 'CHANGE_PRIORITY':
        return `Changed priority of ${entityName}`;
      case 'CHANGE_ROLE':
        return `Changed role of ${entityName}`;
      case 'UPDATE_POINTS':
        return `Updated points for ${entityName}`;
      case 'UPDATE_PROFILE':
        return `Updated profile for ${entityName}`;
      case 'ADD_LINK':
        return `Added link to ${entityName}`;
      case 'REMOVE_LINK':
        return `Removed link from ${entityName}`;
      case 'UPDATE_LINK':
        return `Updated link in ${entityName}`;
      default:
        return `${actionName} ${entityName}`;
    }
  }

  // Validation
  validate(): void {
    if (!this._entityType) {
      throw new Error('Entity type is required');
    }
    if (!this._entityId || this._entityId <= 0) {
      throw new Error('Valid entity ID is required');
    }
    if (!this._action) {
      throw new Error('Action is required');
    }
    if (!this._performedBy || this._performedBy <= 0) {
      throw new Error('Valid performer ID is required');
    }
    if (!this._performedAt) {
      throw new Error('Performed at date is required');
    }
  }

  // Factory Methods
  static create(data: Omit<IHistory, 'id' | 'performedAt'>): History {
    const history = new History({
      ...data,
      performedAt: new Date()
    });
    history.validate();
    return history;
  }

  static fromPrisma(data: any): History {
    return new History({
      id: data.id,
      entityType: data.entityType,
      entityId: data.entityId,
      action: data.action,
      performedBy: data.performedBy,
      performedAt: new Date(data.performedAt),
      oldValues: data.oldValues,
      newValues: data.newValues,
      description: data.description,
      metadata: data.metadata
    });
  }

  // Conversion Methods
  toPrisma(): any {
    return {
      id: this._id,
      entityType: this._entityType,
      entityId: this._entityId,
      action: this._action,
      performedBy: this._performedBy,
      performedAt: this._performedAt,
      oldValues: this._oldValues,
      newValues: this._newValues,
      description: this._description,
      metadata: this._metadata
    };
  }

  toJSON(): any {
    return {
      id: this._id,
      entityType: this._entityType,
      entityId: this._entityId,
      action: this._action,
      performedBy: this._performedBy,
      performedAt: this._performedAt.toISOString(),
      oldValues: this._oldValues,
      newValues: this._newValues,
      description: this._description,
      metadata: this._metadata,
      actionDescription: this.getActionDescription(),
      changes: this.getChanges()
    };
  }
}
