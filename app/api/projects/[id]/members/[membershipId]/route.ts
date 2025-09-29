import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/database/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string, membershipId: string } }
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

    // Verificar se o usuário tem permissão para remover membros
    const canManage = user.roles.includes('COORDENADOR') || user.roles.includes('GERENTE')

    if (!canManage) {
      return NextResponse.json({ error: 'Apenas coordenadores e gerentes podem remover membros' }, { status: 403 })
    }

    const projectId = parseInt(params.id)
    const membershipId = parseInt(params.membershipId)

    // Verificar se a membership existe e pertence ao projeto
    const membership = await prisma.project_members.findFirst({
      where: {
        id: membershipId,
        projectId: projectId
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Membro não encontrado no projeto' }, { status: 404 })
    }

    // Remover a membership
    await prisma.project_members.delete({
      where: { id: membershipId }
    })

    return NextResponse.json({ 
      message: `Membro ${membership.user.name} removido do projeto com sucesso` 
    }, { status: 200 })
  } catch (error: any) {
    console.error('Erro na API de remover membro:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
