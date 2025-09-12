import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import type { NextRequest } from "next/server"
import { createApiError } from "../utils/utils"

export async function getUserFromRequest(req: NextRequest) {
  const session = await getServerSession(authOptions)
  return session?.user || null
}

export function hasRole(user: any, roles: string | string[]): boolean {
  if (!user || !user.roles) return false;
  if (Array.isArray(roles)) {
    return user.roles.some((r: string) => roles.includes(r));
  }
  return user.roles.includes(roles);
}

// Enhanced authentication utilities
export async function requireAuth(): Promise<{ user: any; error?: Response }> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return { user: null, error: createApiError("Não autorizado", 401) }
  }
  
  return { user: session.user }
}

export async function requireRole(roles: string | string[]): Promise<{ user: any; error?: Response }> {
  const authResult = await requireAuth()
  if (authResult.error) return authResult
  
  if (!hasRole(authResult.user, roles)) {
    return { user: null, error: createApiError("Acesso negado", 403) }
  }
  
  return { user: authResult.user }
}

export async function requireActiveUser(): Promise<{ user: any; error?: Response }> {
  const authResult = await requireAuth()
  if (authResult.error) return authResult
  
  if (authResult.user.status !== "active") {
    return { user: null, error: createApiError("Usuário não está ativo", 403) }
  }
  
  return { user: authResult.user }
}

// Role-based access control
export const ROLES = {
  COORDENADOR: 'COORDENADOR',
  GERENTE: 'GERENTE',
  LABORATORISTA: 'LABORATORISTA',
  PESQUISADOR: 'PESQUISADOR',
  GERENTE_PROJETO: 'GERENTE_PROJETO',
  COLABORADOR: 'COLABORADOR',
};

export function canManageUsers(userRoles: string[]): boolean {
  return userRoles.includes(ROLES.COORDENADOR) || userRoles.includes(ROLES.GERENTE);
}

export function canManageProjects(userRoles: string[]): boolean {
  return userRoles.includes(ROLES.COORDENADOR) || userRoles.includes(ROLES.GERENTE) || userRoles.includes(ROLES.GERENTE_PROJETO);
}

export function canManageTasks(userRoles: string[]): boolean {
  return userRoles.includes(ROLES.COORDENADOR) || userRoles.includes(ROLES.GERENTE) || userRoles.includes(ROLES.GERENTE_PROJETO);
}

export function canViewAllData(userRoles: string[]): boolean {
  return userRoles.includes(ROLES.COORDENADOR) || userRoles.includes(ROLES.GERENTE);
} 

// Centralized Access Control Structure
export const ACCESS_CONTROL = {
  // Page/feature: allowed roles
  DASHBOARD_ADMIN: ['COORDENADOR', 'GERENTE'],
  DASHBOARD_WEEKLY_REPORTS: ['COORDENADOR', 'GERENTE', 'LABORATORISTA'],
  DASHBOARD_PROJETOS: ['COORDENADOR', 'GERENTE', 'GERENTE_PROJETO', 'COLABORADOR', 'VOLUNTARIO'],
  MANAGE_REWARDS: ['GERENTE_PROJETO', 'COORDENADOR', 'GERENTE'],
  MANAGE_USERS: ['COORDENADOR', 'GERENTE'],
  MANAGE_PROJECTS: ['COORDENADOR', 'GERENTE'],
  MANAGE_TASKS: ['COORDENADOR', 'GERENTE', 'GERENTE_PROJETO', 'COLABORADOR'],
  VIEW_ALL_DATA: ['COORDENADOR', 'GERENTE', 'LABORATORISTA'],
  EDIT_PROJECT: ['COORDENADOR', 'GERENTE', 'GERENTE_PROJETO'],
  CREATE_TASK: ['COORDENADOR', 'GERENTE', 'GERENTE_PROJETO', 'COLABORADOR'],
  MANAGE_PROJECT_MEMBERS: ['COORDENADOR', 'GERENTE', 'GERENTE_PROJETO'],
  // Add more features/pages as needed
};

// Utility to check if a user has access to a feature
export function hasAccess(userRoles: string[], feature: keyof typeof ACCESS_CONTROL): boolean {
  const allowedRoles = ACCESS_CONTROL[feature];
  return userRoles.some((role) => allowedRoles.includes(role));
} 