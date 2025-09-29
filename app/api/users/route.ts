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
    const canViewUsers = user.roles.includes('COORDENADOR') || user.roles.includes('GERENTE')

    if (!canViewUsers) {
      return NextResponse.json({ error: 'Apenas coordenadores e gerentes podem visualizar usuários' }, { status: 403 })
    }

    // Buscar todos os usuários ativos
    const users = await prisma.users.findMany({
      where: {
        status: 'active'
      },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        status: true
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