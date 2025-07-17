// Client-side Access Control Structure
// This file contains the same access control logic as server-auth.ts
// but without server-side dependencies to avoid bundling issues

export const ACCESS_CONTROL = {
  // Dashboard pages
  DASHBOARD_ADMIN: ['COORDENADOR', 'GERENTE'],
  DASHBOARD_WEEKLY_REPORTS: ['COORDENADOR', 'GERENTE', 'LABORATORISTA'],
  DASHBOARD_PROJETOS: ['COORDENADOR', 'GERENTE', 'GERENTE_PROJETO', 'PESQUISADOR', 'COLABORADOR', 'VOLUNTARIO'],
  
  // Management permissions
  MANAGE_REWARDS: ['COORDENADOR', 'GERENTE', 'LABORATORISTA'],
  MANAGE_USERS: ['COORDENADOR', 'GERENTE'],
  MANAGE_PROJECTS: ['COORDENADOR', 'GERENTE', 'GERENTE_PROJETO'],
  MANAGE_TASKS: ['COORDENADOR', 'GERENTE', 'GERENTE_PROJETO', 'COLABORADOR'],
  MANAGE_PROJECT_MEMBERS: ['COORDENADOR', 'GERENTE', 'GERENTE_PROJETO'],
  
  // View permissions
  VIEW_ALL_DATA: ['COORDENADOR', 'GERENTE', 'LABORATORISTA'],
  VIEW_WEEKLY_REPORTS: ['COORDENADOR', 'GERENTE', 'LABORATORISTA'],
  
  // Edit permissions
  EDIT_PROJECT: ['COORDENADOR', 'GERENTE', 'GERENTE_PROJETO'],
  EDIT_TASKS: ['COORDENADOR', 'GERENTE', 'GERENTE_PROJETO', 'COLABORADOR'],
  
  // Create permissions
  CREATE_TASK: ['COORDENADOR', 'GERENTE', 'GERENTE_PROJETO', 'COLABORADOR'],
  CREATE_PROJECT: ['COORDENADOR', 'GERENTE', 'GERENTE_PROJETO'],
  
  // Laboratory permissions
  MANAGE_LABORATORY: ['COORDENADOR', 'LABORATORISTA'],
  ASSUME_LAB_RESPONSIBILITY: ['COORDENADOR', 'LABORATORISTA'],
  
  // Task-specific permissions
  COMPLETE_PUBLIC_TASKS: ['VOLUNTARIO', 'COLABORADOR', 'GERENTE_PROJETO', 'COORDENADOR', 'GERENTE'],
  ASSIGN_TASKS_TO_VOLUNTEERS: ['COORDENADOR', 'GERENTE', 'GERENTE_PROJETO', 'COLABORADOR'],
  
  // User approval permissions
  APPROVE_USERS: ['COORDENADOR', 'LABORATORISTA'],
  
  // Purchase approval permissions
  APPROVE_PURCHASES: ['COORDENADOR', 'GERENTE', 'LABORATORISTA'],
  
  // Profile permissions
  VIEW_ALL_LOGS: ['COORDENADOR'],
  EDIT_OWN_LOGS: ['COORDENADOR', 'LABORATORISTA', 'GERENTE', 'GERENTE_PROJETO', 'COLABORADOR', 'VOLUNTARIO'],
};

// Utility to check if a user has access to a feature
export function hasAccess(userRoles: string[], feature: keyof typeof ACCESS_CONTROL): boolean {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  const allowedRoles = ACCESS_CONTROL[feature];
  return userRoles.some((role) => allowedRoles.includes(role));
}

// Utility to check if user has any of the specified roles
export function hasAnyRole(userRoles: string[], roles: string[]): boolean {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  return userRoles.some((role) => roles.includes(role));
}

// Utility to check if user has all of the specified roles
export function hasAllRoles(userRoles: string[], roles: string[]): boolean {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  return roles.every((role) => userRoles.includes(role));
}

// Utility to get user's highest priority role for display purposes
export function getPrimaryRole(userRoles: string[]): string {
  if (!userRoles || !Array.isArray(userRoles)) return 'USUARIO';
  
  const rolePriority = [
    'COORDENADOR',
    'GERENTE', 
    'LABORATORISTA',
    'GERENTE_PROJETO',
    'PESQUISADOR',
    'COLABORADOR',
    'VOLUNTARIO'
  ];
  
  for (const role of rolePriority) {
    if (userRoles.includes(role)) {
      return role;
    }
  }
  
  return 'USUARIO';
}

// Utility to get display name for a role
export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    'COORDENADOR': 'Coordenador',
    'GERENTE': 'Gerente',
    'LABORATORISTA': 'Laboratorista',
    'GERENTE_PROJETO': 'Gerente de Projeto',
    'PESQUISADOR': 'Pesquisador',
    'COLABORADOR': 'Colaborador',
    'VOLUNTARIO': 'Voluntário',
    'USUARIO': 'Usuário'
  };
  
  return roleNames[role] || role;
} 