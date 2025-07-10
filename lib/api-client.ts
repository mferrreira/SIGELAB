// Cliente de API para fazer chamadas aos endpoints

// Função genérica para fazer requisições
async function fetchAPI<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Ocorreu um erro na requisição")
  }

  return data
}

// API de Tarefas
export const TasksAPI = {
  // Obter todas as tarefas
  getAll: () => fetchAPI<{ tasks: any[] }>("/api/tasks"),

  // Obter uma tarefa específica
  getById: (id: number) => fetchAPI<{ task: any }>(`/api/tasks/${id}`),

  // Criar uma nova tarefa
  create: (task: any) =>
    fetchAPI<{ task: any }>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    }),

  // Atualizar uma tarefa
  update: (id: number, task: any) =>
    fetchAPI<{ task: any }>(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(task),
    }),

  // Marcar uma tarefa como concluída
  complete: (id: number) =>
    fetchAPI<{ task: any }>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "complete" }),
    }),

  // Excluir uma tarefa
  delete: (id: number) =>
    fetchAPI<{ success: boolean }>(`/api/tasks/${id}`, {
      method: "DELETE",
    }),
}

// API de Usuários
export const UsersAPI = {
  // Obter todos os usuários
  getAll: () => fetchAPI<{ users: any[] }>("/api/users"),

  // Obter um usuário específico
  getById: (id: number) => fetchAPI<{ user: any }>(`/api/users/${id}`),

  // Criar um novo usuário
  create: (user: any) =>
    fetchAPI<{ user: any }>("/api/users", {
      method: "POST",
      body: JSON.stringify(user),
    }),

  // Atualizar um usuário
  update: (id: number, user: any) =>
    fetchAPI<{ user: any }>(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    }),

  // Adicionar pontos a um usuário
  addPoints: (id: number, points: number) =>
    fetchAPI<{ user: any }>(`/api/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "addPoints", points }),
    }),
}

// API de Projetos
export const ProjectsAPI = {
  // Obter todos os projetos
  getAll: () => fetchAPI<{ projects: any[] }>("/api/projects"),

  // Obter um projeto específico
  getById: (id: number) => fetchAPI<{ project: any }>(`/api/projects/${id}`),

  // Criar um novo projeto
  create: (project: any) =>
    fetchAPI<{ project: any }>("/api/projects", {
      method: "POST",
      body: JSON.stringify(project),
    }),

  // Atualizar um projeto
  update: (id: number, project: any) =>
    fetchAPI<{ project: any }>(`/api/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(project),
    }),

  // Excluir um projeto
  delete: (id: number) =>
    fetchAPI<{ success: boolean }>(`/api/projects/${id}`, {
      method: "DELETE",
    }),
}

// API de Recompensas
export const RewardsAPI = {
  // Obter todas as recompensas
  getAll: () => fetchAPI<{ rewards: any[] }>("/api/rewards"),

  // Obter uma recompensa específica
  getById: (id: number) => fetchAPI<{ reward: any }>(`/api/rewards/${id}`),

  // Criar uma nova recompensa
  create: (reward: any) =>
    fetchAPI<{ reward: any }>("/api/rewards", {
      method: "POST",
      body: JSON.stringify(reward),
    }),

  // Atualizar uma recompensa
  update: (id: number, reward: any) =>
    fetchAPI<{ reward: any }>(`/api/rewards/${id}`, {
      method: "PUT",
      body: JSON.stringify(reward),
    }),

  // Excluir uma recompensa
  delete: (id: number) =>
    fetchAPI<{ success: boolean }>(`/api/rewards/${id}`, {
      method: "DELETE",
    }),
}

// API de Compras
export const PurchasesAPI = {
  // Obter todas as compras
  getAll: (userId?: number) => {
    const url = userId ? `/api/purchases?userId=${userId}` : "/api/purchases"
    return fetchAPI<{ purchases: any[] }>(url)
  },

  // Obter uma compra específica
  getById: (id: number) => fetchAPI<{ purchase: any }>(`/api/purchases/${id}`),

  // Criar uma nova compra (resgatar recompensa)
  create: (purchase: { userId: number; rewardId: number }) =>
    fetchAPI<{ purchase: any }>("/api/purchases", {
      method: "POST",
      body: JSON.stringify(purchase),
    }),

  // Atualizar o status de uma compra
  updateStatus: (id: number, status: string) =>
    fetchAPI<{ purchase: any }>(`/api/purchases/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
}

// API de Responsabilidades do Laboratório
export const ResponsibilitiesAPI = {
  // Obter todas as responsabilidades
  getAll: (startDate?: string, endDate?: string) => {
    let url = "/api/responsibilities"
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`
    }
    return fetchAPI<{ responsibilities: any[] }>(url)
  },

  // Obter responsabilidade ativa
  getActive: () => fetchAPI<{ activeResponsibility: any | null }>("/api/responsibilities?active=true"),

  // Iniciar uma nova responsabilidade
  start: (data: { userId: number; userName: string; notes?: string }) =>
    fetchAPI<{ responsibility: any }>("/api/responsibilities", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Encerrar uma responsabilidade
  end: (id: number) =>
    fetchAPI<{ responsibility: any }>(`/api/responsibilities/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "end" }),
    }),

  // Atualizar notas de uma responsabilidade
  updateNotes: (id: number, notes: string) =>
    fetchAPI<{ responsibility: any }>(`/api/responsibilities/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "updateNotes", notes }),
    }),

  // Excluir uma responsabilidade
  delete: (id: number) =>
    fetchAPI<{ success: boolean }>(`/api/responsibilities/${id}`, {
      method: "DELETE",
    }),
}

// API de Logs Diários
export const DailyLogsAPI = {
  // Obter todos os logs
  getAll: (userId?: number, date?: string) => {
    let url = "/api/daily_logs"
    const params = new URLSearchParams()
    if (userId) params.append("userId", userId.toString())
    if (date) params.append("date", date)
    if (params.toString()) url += `?${params.toString()}`
    return fetchAPI<{ logs: any[] }>(url)
  },

  // Obter um log específico
  getById: (id: number) => fetchAPI<{ log: any }>(`/api/daily_logs/${id}`),

  // Criar um novo log
  create: (log: any) =>
    fetchAPI<{ log: any }>("/api/daily_logs", {
      method: "POST",
      body: JSON.stringify(log),
    }),

  // Atualizar um log
  update: (id: number, log: any) =>
    fetchAPI<{ log: any }>(`/api/daily_logs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(log),
    }),

  // Excluir um log
  delete: (id: number) =>
    fetchAPI<{ success: boolean }>(`/api/daily_logs/${id}`, {
      method: "DELETE",
    }),
}

// API de Horários dos Usuários
export const SchedulesAPI = {
  // Obter todos os horários
  getAll: (userId?: number) => {
    const url = userId ? `/api/schedules?userId=${userId}` : "/api/schedules"
    return fetchAPI<{ schedules: any[] }>(url)
  },

  // Obter um horário específico
  getById: (id: number) => fetchAPI<{ schedule: any }>(`/api/schedules/${id}`),

  // Criar um novo horário
  create: (schedule: any) =>
    fetchAPI<{ schedule: any }>("/api/schedules", {
      method: "POST",
      body: JSON.stringify(schedule),
    }),

  // Atualizar um horário
  update: (id: number, schedule: any) =>
    fetchAPI<{ schedule: any }>(`/api/schedules/${id}`, {
      method: "PUT",
      body: JSON.stringify(schedule),
    }),

  // Excluir um horário
  delete: (id: number) =>
    fetchAPI<{ success: boolean }>(`/api/schedules/${id}`, {
      method: "DELETE",
    }),
}
