import { prisma } from "@/lib/prisma"
import { parseTimeToMinutes, validateTimeOrder, validateRequiredFields } from "@/lib/utils"

export interface ScheduleData {
  userId: number
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface ScheduleValidationResult {
  valid: boolean
  error?: string
}

export class ScheduleService {
  // Validate schedule data
  static async validateSchedule(data: ScheduleData, scheduleId?: number): Promise<ScheduleValidationResult> {
    // Validate required fields
    const requiredValidation = validateRequiredFields(data, ['userId', 'dayOfWeek', 'startTime', 'endTime'])
    if (!requiredValidation.valid) {
      return requiredValidation
    }

    // Validate time order
    const timeValidation = validateTimeOrder(data.startTime, data.endTime)
    if (!timeValidation.valid) {
      return timeValidation
    }

    // Validate day of week
    if (data.dayOfWeek < 0 || data.dayOfWeek > 6) {
      return { valid: false, error: "Dia da semana deve estar entre 0 (Domingo) e 6 (Sábado)" }
    }

    // Check if user exists and get their weekly hours limit
    const user = await prisma.users.findUnique({ 
      where: { id: data.userId }, 
      select: { weekHours: true, status: true } 
    })
    
    if (!user) {
      return { valid: false, error: "Usuário não encontrado" }
    }

    if (user.status !== "active") {
      return { valid: false, error: "Usuário não está ativo" }
    }

    // Validate weekly hours limit
    const weeklyHoursValidation = await this.validateWeeklyHours(data, user.weekHours, scheduleId)
    if (!weeklyHoursValidation.valid) {
      return weeklyHoursValidation
    }

    return { valid: true }
  }

  // Validate weekly hours limit
  private static async validateWeeklyHours(
    data: ScheduleData, 
    userWeekHours: number, 
    excludeScheduleId?: number
  ): Promise<ScheduleValidationResult> {
    // Get all schedules for the user (excluding the one being updated, if any)
    const schedules = await prisma.user_schedules.findMany({
      where: {
        userId: data.userId,
        ...(excludeScheduleId ? { NOT: { id: excludeScheduleId } } : {})
      }
    })

    // Calculate total minutes scheduled in the week
    let totalMinutes = schedules.reduce((total, schedule) => {
      return total + parseTimeToMinutes(schedule.endTime) - parseTimeToMinutes(schedule.startTime)
    }, 0)

    // Add the new/updated schedule
    totalMinutes += parseTimeToMinutes(data.endTime) - parseTimeToMinutes(data.startTime)

    const totalHours = totalMinutes / 60
    if (totalHours > userWeekHours) {
      return { 
        valid: false, 
        error: `Total de horas agendadas (${totalHours.toFixed(2)}) excede o limite semanal do usuário (${userWeekHours}h)` 
      }
    }

    return { valid: true }
  }

  // Create a new schedule
  static async createSchedule(data: ScheduleData) {
    const validation = await this.validateSchedule(data)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    return await prisma.user_schedules.create({
      data: {
        userId: data.userId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
      },
      include: { user: true },
    })
  }

  // Update an existing schedule
  static async updateSchedule(id: number, data: Partial<ScheduleData>) {
    // Get the existing schedule to get the userId
    const existing = await prisma.user_schedules.findUnique({ where: { id } })
    if (!existing) {
      throw new Error("Horário não encontrado")
    }

    // Prepare the data for validation (use existing values for missing fields)
    const validationData: ScheduleData = {
      userId: existing.userId,
      dayOfWeek: data.dayOfWeek ?? existing.dayOfWeek,
      startTime: data.startTime ?? existing.startTime,
      endTime: data.endTime ?? existing.endTime,
    }

    const validation = await this.validateSchedule(validationData, id)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    return await prisma.user_schedules.update({
      where: { id },
      data: {
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
      },
      include: { user: true },
    })
  }

  // Get schedules for a user
  static async getUserSchedules(userId?: number) {
    const where = userId ? { userId: parseInt(userId.toString()) } : {}
    
    return await prisma.user_schedules.findMany({
      where,
      include: { user: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    })
  }

  // Get a specific schedule
  static async getSchedule(id: number) {
    const schedule = await prisma.user_schedules.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!schedule) {
      throw new Error("Horário não encontrado")
    }

    return schedule
  }

  // Delete a schedule
  static async deleteSchedule(id: number) {
    const schedule = await prisma.user_schedules.findUnique({ where: { id } })
    if (!schedule) {
      throw new Error("Horário não encontrado")
    }

    await prisma.user_schedules.delete({ where: { id } })
    return { success: true }
  }

  // Get user's weekly schedule summary
  static async getUserWeeklySummary(userId: number) {
    const user = await prisma.users.findUnique({ 
      where: { id: userId }, 
      select: { weekHours: true, name: true } 
    })
    
    if (!user) {
      throw new Error("Usuário não encontrado")
    }

    const schedules = await this.getUserSchedules(userId)
    
    const totalMinutes = schedules.reduce((total, schedule) => {
      return total + parseTimeToMinutes(schedule.endTime) - parseTimeToMinutes(schedule.startTime)
    }, 0)

    const scheduledHours = totalMinutes / 60
    const remainingHours = user.weekHours - scheduledHours

    return {
      user: { id: userId, name: user.name, weekHours: user.weekHours },
      scheduledHours: Math.round(scheduledHours * 100) / 100,
      remainingHours: Math.round(remainingHours * 100) / 100,
      isOverLimit: scheduledHours > user.weekHours,
      schedules
    }
  }
} 