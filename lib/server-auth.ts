import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import type { NextRequest } from "next/server"
import { createApiError } from "../contexts/utils"

export async function getUserFromRequest(req: NextRequest) {
  const session = await getServerSession(authOptions)
  return session?.user || null
}

export function hasRole(user: any, roles: string | string[]): boolean {
  if (!user) return false
  if (Array.isArray(roles)) {
    return roles.includes(user.role)
  }
  return user.role === roles
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
  ADMIN: "administrador_laboratorio",
  LABORATORIST: "laboratorista", 
  PROJECT_MANAGER: "gerente_projeto",
  VOLUNTEER: "voluntario"
} as const

export function canManageUsers(userRole: string): boolean {
  return [ROLES.ADMIN, ROLES.LABORATORIST].includes(userRole as any)
}

export function canManageProjects(userRole: string): boolean {
  return [ROLES.ADMIN, ROLES.LABORATORIST, ROLES.PROJECT_MANAGER].includes(userRole as any)
}

export function canManageTasks(userRole: string): boolean {
  return [ROLES.ADMIN, ROLES.LABORATORIST, ROLES.PROJECT_MANAGER].includes(userRole as any)
}

export function canViewAllData(userRole: string): boolean {
  return [ROLES.ADMIN, ROLES.LABORATORIST].includes(userRole as any)
} 