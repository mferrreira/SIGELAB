import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/database/prisma'
import { getProjectWeeklyHours } from '@/backend/services/ProjectHoursService'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    // TODO: Mover essa lógica pro repository
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
    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get('weekStart')

    if (!weekStart) {
      return NextResponse.json({ error: 'weekStart é obrigatório' }, { status: 400 })
    }

    // Verificar se o usuário tem acesso ao projeto
    const hasAccess = user.projectMemberships.some(
      membership => membership.project.id === projectId
    ) || user.roles.includes('COORDENADOR') || user.roles.includes('GERENTE')

    if (!hasAccess) {
      return NextResponse.json({ error: 'Acesso negado ao projeto' }, { status: 403 })
    }

    const hours = await getProjectWeeklyHours(projectId, new Date(weekStart))

    return NextResponse.json({ hours }, { status: 200 })
  } catch (error: any) {
    console.error('Erro na API de horas semanais do projeto:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
