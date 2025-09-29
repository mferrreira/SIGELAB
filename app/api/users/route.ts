import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/database/prisma'

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

    // Verificar se o usuário tem permissão para ver outros usuários
    const canViewFullUsers = user.roles.includes('COORDENADOR') || user.roles.includes('GERENTE')
    const canViewBasicUsers = user.roles.includes('COORDENADOR') || user.roles.includes('GERENTE') || user.roles.includes('VOLUNTARIO') || user.roles.includes('COLABORADOR') || user.roles.includes('LABORATORISTA')

    if (!canViewBasicUsers) {
      return NextResponse.json({ error: 'Usuário não tem permissão para visualizar outros usuários' }, { status: 403 })
    }

    // Buscar usuários ativos com campos diferentes baseado na permissão
    const users = await prisma.users.findMany({
      where: {
        status: 'active'
      },
      select: {
        id: true,
        name: true,
        email: canViewFullUsers,
        roles: canViewFullUsers,
        status: canViewFullUsers,
        points: true,
        avatar: true,
        bio: canViewFullUsers
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ users }, { status: 200 })
  } catch (error: any) {
    console.error('Erro na API de usuários:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}