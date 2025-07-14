// User types
export interface User {
  id: number
  name: string
  email: string
  role: string
  points: number
  completedTasks: number
  password?: string | null
  status: string
  weekHours: number
}

export interface UserFormData {
  name: string
  email: string
  role: string
  password: string
  weekHours: number
}

// Project types
export interface Project {
  id: number
  name: string
  description?: string | null
  createdAt: string
  createdBy: number
  status: "active" | "completed" | "archived"
}

export interface ProjectFormData {
  name: string
  description: string
  status: "active" | "completed" | "archived"
}

// Task types
export interface Task {
  id: number
  title: string
  description?: string | null
  status: "to-do" | "in-progress" | "in-review" | "adjust" | "done"
  priority: string
  assignedTo?: number | null
  projectId?: number | null
  dueDate?: string | null
  points: number
  completed: boolean
  taskVisibility?: string
}

export interface TaskFormData {
  title: string
  description: string
  status: "to-do" | "in-progress" | "in-review" | "adjust" | "done"
  priority: "low" | "medium" | "high"
  assignedTo: string
  project: string
  dueDate: string
  points: number
  completed: boolean
}

// Reward types
export interface Reward {
  id: number
  name: string
  description: string
  price: number
  available: boolean
}

export interface RewardFormData {
  name: string
  description: string
  price: number
  available: boolean
}

// Purchase types
export interface Purchase {
  id: number
  userId: number
  rewardId: number
  rewardName: string
  price: number
  purchaseDate: string
  status: string
  formattedDate?: string
  user?: {
    id: number
    name: string
    email: string
  }
}

export interface PurchaseFormData {
  rewardId: number
  rewardName: string
  price: number
}

// Lab Responsibility types
export interface LabResponsibility {
  id: number
  userId: number
  userName: string
  startTime: string
  endTime?: string | null
  notes?: string | null
}

export interface LabResponsibilityFormData {
  userId: number
  userName: string
  startTime: string
  endTime?: string
  notes?: string
}

// Daily Log types
export interface DailyLog {
  id: number
  userId: number
  projectId?: number | null
  date: Date
  note?: string | null
  createdAt: Date
  user?: {
    id: number
    name: string
    email: string
  }
  project?: {
    id: number
    name: string
  }
}

export interface DailyLogFormData {
  userId: number
  date: string
  note: string
}

// Context types
export interface UserContextType {
  users: User[]
  loading: boolean
  error: string | null
  fetchUsers: () => Promise<void>
  createUser: (user: UserFormData) => Promise<User>
  updateUser: (id: number, user: Partial<User>) => Promise<User>
  deleteUser: (id: number) => Promise<void>
}

export interface ProjectContextType {
  projects: Project[]
  loading: boolean
  error: string | null
  fetchProjects: () => Promise<void>
  createProject: (project: ProjectFormData) => Promise<Project>
  updateProject: (id: number, project: Partial<Project>) => Promise<Project>
  deleteProject: (id: number) => Promise<void>
}

export interface TaskContextType {
  tasks: Task[]
  loading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  createTask: (task: TaskFormData) => Promise<Task>
  updateTask: (id: number, task: Partial<Task>) => Promise<Task>
  deleteTask: (id: number) => Promise<void>
  moveTask: (taskId: number, newStatus: string) => Promise<void>
}

export interface RewardContextType {
  rewards: Reward[]
  loading: boolean
  error: string | null
  fetchRewards: () => Promise<void>
  createReward: (reward: RewardFormData) => Promise<Reward>
  updateReward: (id: number, reward: Partial<Reward>) => Promise<Reward>
  deleteReward: (id: number) => Promise<void>
  purchaseReward: (purchase: PurchaseFormData) => Promise<Purchase>
}

export interface ResponsibilityContextType {
  responsibilities: LabResponsibility[]
  loading: boolean
  error: string | null
  fetchResponsibilities: () => Promise<void>
  createResponsibility: (responsibility: LabResponsibilityFormData) => Promise<LabResponsibility>
  updateResponsibility: (id: number, responsibility: Partial<LabResponsibility>) => Promise<LabResponsibility>
  deleteResponsibility: (id: number) => Promise<void>
  completeResponsibility: (id: number, endTime: string) => Promise<void>
}

export interface DailyLogContextType {
  logs: DailyLog[]
  loading: boolean
  error: string | null
  fetchLogs: (userId?: number, date?: string) => Promise<void>
  createLog: (log: { userId: number; date: string; note?: string }) => Promise<DailyLog>
  updateLog: (id: number, data: { note?: string; date?: string }) => Promise<DailyLog>
  deleteLog: (id: number) => Promise<void>
}

// Dialog prop types
export interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
}

export interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project | null
}

export interface RewardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reward?: Reward | null
}

export interface ResponsibilityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  responsibility?: LabResponsibility | null
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Auth types
export interface AuthUser {
  id: number
  name: string
  email: string
  role: string
  points: number
  completedTasks: number
  status: string
  weekHours: number
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  role: string
  password: string
  weekHours: number
}

// Calendar and Event types
export interface CalendarEvent {
  id: number
  title: string
  start: Date
  end: Date
  type: "responsibility" | "daily_log"
  description?: string
  color: string
}

export interface DayViewEvent {
  id: number
  title: string
  startTime: string
  endTime: string
  description?: string
  type: "responsibility" | "daily_log" | "task" | "laboratory"
  color: string
}

// Statistics types
export interface UserStats {
  totalPoints: number
  completedTasks: number
  totalTasks: number
  completionRate: number
  rank: number
}

export interface ProjectStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  inProgressTasks: number
  completionRate: number
}

export interface SystemStats {
  totalUsers: number
  totalProjects: number
  totalTasks: number
  totalRewards: number
  totalPurchases: number
  averageCompletionRate: number
}

// Kanban component types
export interface KanbanColumnProps {
  status: string
  tasks: Task[]
  onEdit: (task: Task) => void
  onAddTask: (status: string) => void
  canAddTask: boolean
}

export interface KanbanCardProps {
  task: Task
  onEdit: (task: Task) => void
  isOverdue: boolean
  index: number
}

// User Schedule types
export interface UserSchedule {
  id: number
  userId: number
  dayOfWeek: number // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string // Format: "HH:MM"
  endTime: string // Format: "HH:MM"
  createdAt: Date
  user?: User
}

export interface LaboratorySchedule {
  id: number
  dayOfWeek: number // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string // Format: "HH:MM"
  endTime: string // Format: "HH:MM"
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface UserScheduleFormData {
  dayOfWeek: number
  startTime: string
  endTime: string
  userId?: number
}

export interface UserScheduleContextType {
  schedules: UserSchedule[]
  loading: boolean
  error: string | null
  fetchSchedules: (userId?: number) => Promise<void>
  createSchedule: (schedule: UserScheduleFormData) => Promise<UserSchedule>
  updateSchedule: (id: number, schedule: Partial<UserSchedule>) => Promise<UserSchedule>
  deleteSchedule: (id: number) => Promise<void>
  getSchedulesByDay: (dayOfWeek: number) => UserSchedule[]
}

export interface LaboratoryScheduleFormData {
  dayOfWeek: number
  startTime: string
  endTime: string
  notes?: string
}

export interface LaboratoryScheduleContextType {
  schedules: LaboratorySchedule[]
  loading: boolean
  error: string | null
  fetchSchedules: () => Promise<void>
  createSchedule: (schedule: LaboratoryScheduleFormData) => Promise<LaboratorySchedule>
  updateSchedule: (id: number, schedule: Partial<LaboratorySchedule>) => Promise<LaboratorySchedule>
  deleteSchedule: (id: number) => Promise<void>
  getSchedulesByDay: (dayOfWeek: number) => LaboratorySchedule[]
}

// Weekly Report types
export interface WeeklyReport {
  id: number
  userId: number
  userName: string
  weekStart: Date
  weekEnd: Date
  totalLogs: number
  logs: DailyLog[]
  summary: string
  createdAt: Date
}

export interface WeeklyReportFormData {
  userId: number
  weekStart: string
  weekEnd: string
  summary?: string
}

export interface WeeklyReportContextType {
  weeklyReports: WeeklyReport[]
  loading: boolean
  error: string | null
  fetchWeeklyReports: (userId?: number, weekStart?: string, weekEnd?: string) => Promise<void>
  generateWeeklyReport: (userId: number, weekStart: string, weekEnd: string) => Promise<WeeklyReport>
  createWeeklyReport: (report: WeeklyReportFormData) => Promise<WeeklyReport>
  updateWeeklyReport: (id: number, data: Partial<WeeklyReport>) => Promise<WeeklyReport>
  deleteWeeklyReport: (id: number) => Promise<void>
}

// Work Session types
export interface WorkSession {
  id: number
  userId: number
  userName: string
  startTime: Date
  endTime?: Date | null
  duration?: number | null // Duration in minutes
  activity?: string | null
  location?: string | null // "lab", "home", "remote", etc.
  status: "active" | "completed" | "paused"
  createdAt: Date
  updatedAt: Date
  user?: {
    id: number
    name: string
    email: string
  }
}

export interface WorkSessionFormData {
  userId: number
  activity?: string
  location?: string
}

export interface WorkSessionContextType {
  sessions: WorkSession[]
  activeSession: WorkSession | null
  loading: boolean
  error: string | null
  fetchSessions: (userId?: number, status?: string) => Promise<void>
  startSession: (session: WorkSessionFormData) => Promise<WorkSession>
  endSession: (id: number, activity?: string) => Promise<WorkSession>
  pauseSession: (id: number) => Promise<WorkSession>
  resumeSession: (id: number) => Promise<WorkSession>
  updateSession: (id: number, data: Partial<WorkSession>) => Promise<WorkSession>
  deleteSession: (id: number) => Promise<void>
  getActiveSession: (userId: number) => WorkSession | null
  getWeeklyHours: (userId: number, weekStart: string, weekEnd: string) => Promise<number>
}
