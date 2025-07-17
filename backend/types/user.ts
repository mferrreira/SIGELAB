export type UserRole = 'COORDENADOR' | 'GERENTE' | 'LABORATORISTA' | 'PESQUISADOR' | 'GERENTE_PROJETO' | 'COLABORADOR';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: UserRole[];
  points: number;
  completedTasks: number;
  password?: string | null;
  status: string;
  weekHours: number;
  currentWeekHours: number;
  createdAt: Date;
  // Relations omitted for brevity
}

export interface UserCreateInput {
  name: string;
  email: string;
  roles: UserRole[];
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
  roles?: UserRole[];
  password?: string;
  status?: string;
  weekHours?: number;
  points?: number;
  completedTasks?: number;
  // Add other fields as needed
} 