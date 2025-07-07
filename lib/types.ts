export interface User {
  id: string
  name: string
  email: string
  role: "user" | "manager"
  points: number
  completedTasks: number
}

export interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  assignedTo: string
  project: string
  dueDate?: string
  points: number
  completed?: boolean
}

export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  createdBy: string
  status: "active" | "completed" | "archived"
}

export interface Reward {
  id: string
  name: string
  description: string
  price: number
  image?: string
  available: boolean
}

export interface Purchase {
  id: string
  userId: string
  rewardId: string
  rewardName: string
  price: number
  purchaseDate: string
  status: "pending" | "approved" | "rejected" | "used"
}

export interface LabResponsibility {
  id: string
  userId: string
  userName: string
  startTime: string
  endTime: string | null
  notes?: string
}

export interface ActiveResponsibility {
  id: string
  userId: string
  userName: string
  startTime: string
  duration: number // duração em segundos
}
