import { prisma } from '@/lib/prisma';

export class WorkSessionModel {
  async findById(id: number) {
    return prisma.work_sessions.findUnique({ where: { id } });
  }

  async findAll() {
    return prisma.work_sessions.findMany();
  }

  async create(data: any) {
    // Prevent overlapping sessions: check for active session
    const activeSession = await prisma.work_sessions.findFirst({
      where: {
        userId: data.userId,
        endTime: null,
      },
    });
    if (activeSession) {
      return activeSession;
    }
    if (!data.startTime) {
      data.startTime = new Date().toISOString();
    }
    return prisma.work_sessions.create({ data });
  }

  async update(id: number, data: any) {
    // Buscar a sessão atual para verificar se está sendo finalizada
    const currentSession = await prisma.work_sessions.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!currentSession) {
      throw new Error('Sessão não encontrada');
    }

    // Atualizar a sessão
    const updatedSession = await prisma.work_sessions.update({ 
      where: { id }, 
      data 
    });

      // Se a sessão foi finalizada (status = 'completed') e tem duração, atualizar as horas atuais do usuário
  if (data.status === 'completed' && data.duration && data.duration > 0) {
    const durationInHours = data.duration / 3600; // Converter segundos para horas
    
    await prisma.users.update({
      where: { id: currentSession.userId },
      data: {
        currentWeekHours: {
          increment: durationInHours
        }
      }
    });

    console.log(`✅ Horas atuais do usuário atualizadas: +${durationInHours.toFixed(2)}h para o usuário ${currentSession.userId}`);
  }

    return updatedSession;
  }

  async delete(id: number) {
    return prisma.work_sessions.delete({ where: { id } });
  }

  async findByUserId(userId: number) {
    return prisma.work_sessions.findMany({ where: { userId } });
  }

  async findActiveSessions() {
    return prisma.work_sessions.findMany({
      where: { endTime: null },
      include: { user: true },
    });
  }
} 