import { prisma } from "@/lib/prisma"
import { validateRequiredFields } from "@/lib/utils"

export interface TaskData {
  title: string
  description?: string
  status: string
  priority: string
  assignedTo?: number
  projectId?: number
  dueDate?: string
  points: number
  taskVisibility: string
}

export interface TaskUpdateData {
  title?: string
  description?: string
  status?: string
  priority?: string
  assignedTo?: number | null
  projectId?: number
  dueDate?: string
  points?: number
  taskVisibility?: string
  completed?: boolean
}

export class TaskService {
  // Validate task data
  static validateTaskData(data: TaskData): { valid: boolean; error?: string } {
    // Validate required fields
    const requiredValidation = validateRequiredFields(data, ['title', 'status', 'priority', 'points', 'taskVisibility'])
    if (!requiredValidation.valid) {
      return requiredValidation
    }

    // Validate status
    const validStatuses = ['to-do', 'in-progress', 'in-review', 'adjust', 'done', 'pending', 'in_progress', 'completed', 'cancelled']
    if (!validStatuses.includes(data.status)) {
      return { valid: false, error: "Status inválido" }
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent']
    if (!validPriorities.includes(data.priority)) {
      return { valid: false, error: "Prioridade inválida" }
    }

    // Validate taskVisibility
    const validVisibilities = ['delegated', 'public']
    if (!validVisibilities.includes(data.taskVisibility)) {
      return { valid: false, error: "Visibilidade inválida" }
    }

    // Validate points
    if (data.points < 0) {
      return { valid: false, error: "Pontos devem ser maiores ou iguais a zero" }
    }

    return { valid: true }
  }

  // Create a new task
  static async createTask(data: TaskData) {
    const validation = this.validateTaskData(data)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Validate assigned user if provided
    if (data.assignedTo) {
      const assignedUser = await prisma.users.findUnique({
        where: { id: data.assignedTo }
      })
      
      if (!assignedUser) {
        throw new Error("Usuário atribuído não encontrado")
      }
      
      if (assignedUser.role !== "voluntario") {
        throw new Error("Apenas voluntários podem ser atribuídos a tarefas")
      }
    }

    // Validate project if provided
    if (data.projectId) {
      const project = await prisma.projects.findUnique({
        where: { id: data.projectId }
      })
      
      if (!project) {
        throw new Error("Projeto não encontrado")
      }
    }

    const task = await prisma.tasks.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assignedTo: data.assignedTo,
        projectId: data.projectId,
        dueDate: data.dueDate,
        points: data.points,
        taskVisibility: data.taskVisibility,
      },
      include: {
        assignee: true,
        projectObj: true,
      },
    })

    return task
  }

  // Get tasks with role-based filtering
  static async getTasks(userId?: number, role?: string) {
    if (!userId || !role) {
      return await prisma.tasks.findMany({
        include: { assignee: true, projectObj: true },
        orderBy: { id: 'desc' }
      })
    }

    const numericUserId = parseInt(userId.toString())

    if (role === "voluntario") {
      // Get project memberships for this volunteer
      const memberships = await prisma.project_members.findMany({
        where: { userId: numericUserId },
        select: { projectId: true },
      })
      const projectIds = memberships.map(m => m.projectId)

      // Tasks assigned to them or public tasks for their projects
      return await prisma.tasks.findMany({
        where: {
          OR: [
            { assignedTo: numericUserId },
            { taskVisibility: "public", projectId: { in: projectIds } },
          ],
        },
        include: { assignee: true, projectObj: true },
        orderBy: { id: 'desc' }
      })
    } else if (role === "gerente_projeto") {
      // Get projects where user is creator or project manager
      const [createdProjects, managedProjects] = await Promise.all([
        // Projects created by this user
        prisma.projects.findMany({
          where: { createdBy: numericUserId },
          select: { id: true },
        }),
        // Projects where user is a project member (manager)
        prisma.project_members.findMany({
          where: { userId: numericUserId },
          select: { projectId: true },
        })
      ])
      
      const createdProjectIds = createdProjects.map(p => p.id)
      const managedProjectIds = managedProjects.map(p => p.projectId)
      const allProjectIds = [...createdProjectIds, ...managedProjectIds]

      // Tasks from all their projects (created + managed)
      return await prisma.tasks.findMany({
        where: {
          projectId: { in: allProjectIds },
        },
        include: { assignee: true, projectObj: true },
        orderBy: { id: 'desc' }
      })
    } else {
      // Laboratorists and admins see all tasks
      return await prisma.tasks.findMany({
        include: { assignee: true, projectObj: true },
        orderBy: { id: 'desc' }
      })
    }
  }

  // Get a specific task
  static async getTask(id: number) {
    const task = await prisma.tasks.findUnique({
      where: { id },
      include: {
        assignee: true,
        projectObj: true,
      },
    })

    if (!task) {
      throw new Error("Tarefa não encontrada")
    }

    return task
  }

  // Update a task
  static async updateTask(id: number, data: TaskUpdateData) {
    // Check if task exists
    const existingTask = await prisma.tasks.findUnique({
      where: { id },
      include: {
        assignee: true,
        projectObj: true,
      },
    })

    if (!existingTask) {
      throw new Error("Tarefa não encontrada")
    }

    // Validate assigned user if provided
    if (data.assignedTo !== undefined) {
      if (data.assignedTo) {
        const assignedUser = await prisma.users.findUnique({
          where: { id: data.assignedTo }
        })
        
        if (!assignedUser) {
          throw new Error("Usuário atribuído não encontrado")
        }
        
        if (assignedUser.role !== "voluntario") {
          throw new Error("Apenas voluntários podem ser atribuídos a tarefas")
        }
      }
    }

    // Handle status change and points awarding
    let updateData = { ...data }
    let pointsToAward = 0

    if ((data.status === "completed" || data.status === "done") && existingTask.status !== "completed" && existingTask.status !== "done") {
      pointsToAward = existingTask.points
    }

    // Update the task
    const updatedTask = await prisma.tasks.update({
      where: { id },
      data: updateData,
      include: {
        assignee: true,
        projectObj: true,
      },
    })

    // Award points if task was completed
    if (pointsToAward > 0 && updatedTask.assignedTo) {
      await prisma.users.update({
        where: { id: updatedTask.assignedTo },
        data: {
          points: { increment: pointsToAward },
          completedTasks: { increment: 1 },
        },
      })
    }

    return updatedTask
  }

  // Delete a task
  static async deleteTask(id: number) {
    const task = await prisma.tasks.findUnique({ where: { id } })
    if (!task) {
      throw new Error("Tarefa não encontrada")
    }

    await prisma.tasks.delete({ where: { id } })
    return { success: true }
  }

  // Get tasks by project
  static async getTasksByProject(projectId: number) {
    return await prisma.tasks.findMany({
      where: { projectId },
      include: { assignee: true, projectObj: true },
      orderBy: { id: 'desc' }
    })
  }

  // Get tasks by status
  static async getTasksByStatus(status: string) {
    return await prisma.tasks.findMany({
      where: { status },
      include: { assignee: true, projectObj: true },
      orderBy: { id: 'desc' }
    })
  }

  // Get tasks assigned to a user
  static async getTasksByAssignee(userId: number) {
    return await prisma.tasks.findMany({
      where: { assignedTo: userId },
      include: { assignee: true, projectObj: true },
      orderBy: { id: 'desc' }
    })
  }

  // Get task statistics
  static async getTaskStats() {
    const [totalTasks, completedTasks, pendingTasks] = await Promise.all([
      prisma.tasks.count(),
      prisma.tasks.count({ where: { status: "completed" } }),
      prisma.tasks.count({ where: { status: "pending" } })
    ])

    const statusStats = await prisma.tasks.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    const priorityStats = await prisma.tasks.groupBy({
      by: ['priority'],
      _count: { priority: true }
    })

    return {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      byStatus: statusStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status
        return acc
      }, {} as Record<string, number>),
      byPriority: priorityStats.reduce((acc, stat) => {
        acc[stat.priority] = stat._count.priority
        return acc
      }, {} as Record<string, number>)
    }
  }
} 