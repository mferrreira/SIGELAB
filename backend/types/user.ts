export type UserRole = 'ADMIN' | 'LABORATORIST' | 'PROJECT_MANAGER' | 'VOLUNTEER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string; // Use string to match Prisma model
  points: number;
  completedTasks: number;
  password?: string | null;
  status: string;
  weekHours: number;
  createdAt: Date;
  // Relations omitted for brevity
}

export interface UserCreateInput {
  name: string;
  email: string;
  role: string;
  password?: string;
  status?: string;
  weekHours?: number;
  points?: number;
  completedTasks?: number;
  // Add other fields as needed
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  role?: string;
  password?: string;
  status?: string;
  weekHours?: number;
  points?: number;
  completedTasks?: number;
  // Add other fields as needed
} 