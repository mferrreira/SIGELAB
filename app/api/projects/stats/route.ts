import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/database/prisma'
import { getProjectStats } from '@/backend/services/ProjectHoursService'

export async function GET() {
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

    const canAccess = user.roles.includes('COORDENADOR') || user.roles.includes('GERENTE')

    if (!canAccess) {
      return NextResponse.json({ error: 'Apenas coordenadores e gerentes podem acessar estatísticas gerais' }, { status: 403 })
    }

    const stats = await getProjectStats()

    return NextResponse.json({ stats }, { status: 200 })
  } catch (error: any) {
    console.error('Erro na API de estatísticas dos projetos:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
