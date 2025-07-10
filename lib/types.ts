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
}

export interface UserFormData {
  name: string
  email: string
  role: string
  password: string
}

// Project types
export interface Project {
  id: number
  name: string
  description?: string | null
  createdAt: string
  createdBy: number
  status: string
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
  status: string
  priority: string
  assignedTo?: number | null
  projectId?: number | null
  dueDate?: string | null
  points: number
  completed: boolean
}

export interface TaskFormData {
  title: string
  description: string
  status: "todo" | "in-progress" | "in-review" | "adjust" | "done"
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
  description?: string | null
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
  date: Date
  note?: string | null
  createdAt: Date
}

export interface DailyLogFormData {
  userId: number
  date: string
  note: string
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

export interface UserScheduleFormData {
  dayOfWeek: number
  startTime: string
  endTime: string
  userId?: number
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
  type: "responsibility" | "daily_log" | "task"
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
  id: string
  title: string
  tasks: Task[]
  onEdit: (task: Task) => void
}

export interface KanbanCardProps {
  task: Task
  onEdit: (task: Task) => void
  isOverdue: boolean
}
