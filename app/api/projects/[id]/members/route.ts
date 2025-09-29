import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/database/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      include: {
        projectMemberships: {
          include: {
            project: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const projectId = parseInt(params.id)

    const hasAccess = user.projectMemberships.some(
      membership => membership.project.id === projectId
    ) || user.roles.includes('COORDENADOR') || user.roles.includes('GERENTE')

    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao projeto' }, { status: 403 })
    }

    // Buscar membros do projeto
    const members = await prisma.project_members.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    })

    // Buscar horas trabalhadas por membro
    const membersWithHours = await Promise.all(
      members.map(async (member) => {
        // Horas totais
        const totalSessions = await prisma.work_sessions.findMany({
          where: {
            userId: member.userId,
            projectId: projectId,
            status: 'completed'
          },
          select: { duration: true }
        })

        const totalHours = totalSessions.reduce((sum, session) => sum + (session.duration || 0), 0)

        // Horas da semana atual
        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7))
        startOfWeek.setHours(0, 0, 0, 0)
        
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)

        const weekSessions = await prisma.work_sessions.findMany({
          where: {
            userId: member.userId,
            projectId: projectId,
            status: 'completed',
            startTime: {
              gte: startOfWeek,
              lte: endOfWeek
            }
          },
          select: { duration: true }
        })

        const currentWeekHours = weekSessions.reduce((sum, session) => sum + (session.duration || 0), 0)

        return {
          id: member.id,
          userId: member.userId,
          userName: member.user.name,
          userEmail: member.user.email,
          roles: member.roles,
          joinedAt: member.joinedAt.toISOString(),
          totalHours: Math.round(totalHours * 100) / 100,
          currentWeekHours: Math.round(currentWeekHours * 100) / 100
        }
      })
    )

    return NextResponse.json({ members: membersWithHours }, { status: 200 })
  } catch (error: any) {
    console.error('Erro na API de membros do projeto:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar se o usuário tem permissão para adicionar membros
    const canManage = user.roles.includes('COORDENADOR') || user.roles.includes('GERENTE')

    if (!canManage) {
      return NextResponse.json({ error: 'Apenas coordenadores e gerentes podem adicionar membros' }, { status: 403 })
    }

    const projectId = parseInt(params.id)
    const { userId, roles } = await request.json()

    if (!userId || !roles || !Array.isArray(roles)) {
      return NextResponse.json({ error: 'userId e roles são obrigatórios' }, { status: 400 })
    }

    // Verificar se o usuário existe
    const targetUser = await prisma.users.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar se já é membro do projeto
    const existingMembership = await prisma.project_members.findFirst({
      where: {
        projectId,
        userId: parseInt(userId)
      }
    })

    if (existingMembership) {
      return NextResponse.json({ error: 'Usuário já é membro deste projeto' }, { status: 400 })
    }

    // Adicionar membro ao projeto
    const membership = await prisma.project_members.create({
      data: {
        projectId,
        userId: parseInt(userId),
        roles: roles
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ 
      membership: {
        id: membership.id,
        userId: membership.userId,
        userName: membership.user.name,
        userEmail: membership.user.email,
        roles: membership.roles,
        joinedAt: membership.joinedAt.toISOString()
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Erro na API de adicionar membro:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}