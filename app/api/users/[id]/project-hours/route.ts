import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { ProjectHoursController } from '@/backend/controllers/ProjectHoursController'
import { prisma } from '@/lib/database/prisma'

const projectHoursController = new ProjectHoursController()

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
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const targetUserId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get('weekStart')
    const weekEnd = searchParams.get('weekEnd')

    // Verificar se o usuário pode acessar os dados do outro usuário
    const canAccess = user.id === targetUserId || 
                     user.roles.includes('COORDENADOR') || 
                     user.roles.includes('GERENTE')

    if (!canAccess) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const hours = await projectHoursController.getUserProjectHours(
      targetUserId,
      weekStart || undefined,
      weekEnd || undefined
    )

    return NextResponse.json({ hours }, { status: 200 })
  } catch (error: any) {
    console.error('Erro na API de horas dos projetos do usuário:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
