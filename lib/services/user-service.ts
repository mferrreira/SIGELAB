import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { validateEmail, validateRole, validateRequiredFields, sanitizeUser } from "@/lib/utils"

export interface UserData {
  name: string
  email: string
  role: string
  password: string
  weekHours: number
}

export interface UserUpdateData {
  name?: string
  email?: string
  role?: string
  password?: string
  weekHours?: number
  status?: string
}

export class UserService {
  // Validate user data for creation
  static validateUserData(data: UserData): { valid: boolean; error?: string } {
    // Validate required fields
    const requiredValidation = validateRequiredFields(data, ['name', 'email', 'role', 'password', 'weekHours'])
    if (!requiredValidation.valid) {
      return requiredValidation
    }

    // Validate email
    const emailValidation = validateEmail(data.email)
    if (!emailValidation.valid) {
      return emailValidation
    }

    // Validate role
    const roleValidation = validateRole(data.role)
    if (!roleValidation.valid) {
      return roleValidation
    }

    // Validate weekHours
    if (data.weekHours < 0 || data.weekHours > 168) { // Max 7 days * 24 hours
      return { valid: false, error: "Horas semanais devem estar entre 0 e 168" }
    }

    return { valid: true }
  }

  // Create a new user
  static async createUser(data: UserData) {
    const validation = this.validateUserData(data)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({ 
      where: { email: data.email.toLowerCase() } 
    })
    
    if (existingUser) {
      throw new Error("Email já está em uso")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.users.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        role: data.role,
        password: hashedPassword,
        weekHours: data.weekHours,
        status: "pending", // Default status
      },
    })

    return sanitizeUser(user)
  }

  // Get all users with optional filtering
  static async getUsers(status?: string) {
    const where = status ? { status } : {}
    
    const users = await prisma.users.findMany({ where })
    return users.map(sanitizeUser)
  }

  // Get a specific user
  static async getUser(id: number) {
    const user = await prisma.users.findUnique({ where: { id } })
    
    if (!user) {
      throw new Error("Usuário não encontrado")
    }

    return sanitizeUser(user)
  }

  // Update user status (approve/reject)
  static async updateUserStatus(id: number, action: "approve" | "reject") {
    const status = action === "approve" ? "active" : "rejected"
    
    const user = await prisma.users.update({
      where: { id },
      data: { status },
    })

    return sanitizeUser(user)
  }

  // Update user data
  static async updateUser(id: number, data: UserUpdateData) {
    // Check if user exists
    const existingUser = await prisma.users.findUnique({ where: { id } })
    if (!existingUser) {
      throw new Error("Usuário não encontrado")
    }

    // Validate email if provided
    if (data.email) {
      const emailValidation = validateEmail(data.email)
      if (!emailValidation.valid) {
        throw new Error(emailValidation.error)
      }

      // Check if email is already taken by another user
      const emailExists = await prisma.users.findFirst({
        where: { 
          email: data.email.toLowerCase(),
          NOT: { id }
        }
      })
      
      if (emailExists) {
        throw new Error("Email já está em uso")
      }
    }

    // Validate role if provided
    if (data.role) {
      const roleValidation = validateRole(data.role)
      if (!roleValidation.valid) {
        throw new Error(roleValidation.error)
      }
    }

    // Validate weekHours if provided
    if (data.weekHours !== undefined) {
      if (data.weekHours < 0 || data.weekHours > 168) {
        throw new Error("Horas semanais devem estar entre 0 e 168")
      }
    }

    // Hash password if provided
    let updateData = { ...data }
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    // Normalize email if provided
    if (data.email) {
      updateData.email = data.email.toLowerCase()
    }

    const user = await prisma.users.update({
      where: { id },
      data: updateData,
    })

    return sanitizeUser(user)
  }

  // Add points to user
  static async addPoints(id: number, points: number) {
    if (points <= 0) {
      throw new Error("Pontos devem ser maiores que zero")
    }

    const user = await prisma.users.update({
      where: { id },
      data: { points: { increment: points } },
    })

    return sanitizeUser(user)
  }

  // Get users by role
  static async getUsersByRole(role: string) {
    const users = await prisma.users.findMany({ where: { role } })
    return users.map(sanitizeUser)
  }

  // Get active users
  static async getActiveUsers() {
    const users = await prisma.users.findMany({ where: { status: "active" } })
    return users.map(sanitizeUser)
  }

  // Get pending users
  static async getPendingUsers() {
    const users = await prisma.users.findMany({ where: { status: "pending" } })
    return users.map(sanitizeUser)
  }

  // Search users by name or email
  static async searchUsers(query: string) {
    const users = await prisma.users.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } }
        ]
      }
    })
    return users.map(sanitizeUser)
  }

  // Get user statistics
  static async getUserStats() {
    const [totalUsers, activeUsers, pendingUsers] = await Promise.all([
      prisma.users.count(),
      prisma.users.count({ where: { status: "active" } }),
      prisma.users.count({ where: { status: "pending" } })
    ])

    const roleStats = await prisma.users.groupBy({
      by: ['role'],
      _count: { role: true }
    })

    return {
      total: totalUsers,
      active: activeUsers,
      pending: pendingUsers,
      byRole: roleStats.reduce((acc, stat) => {
        acc[stat.role] = stat._count.role
        return acc
      }, {} as Record<string, number>)
    }
  }
} 