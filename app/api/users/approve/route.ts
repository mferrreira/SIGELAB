import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

import { UserService } from '@/backend/services/UserService'
import { UserRepository } from '@/backend/repositories/UserRepository'
import { BadgeRepository, UserBadgeRepository } from '@/backend/repositories/BadgeRepository'

const userService = new UserService(
  new UserRepository(),
  new BadgeRepository(),
  new UserBadgeRepository(),
)

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const user = session.user as any
    
    if (!user.roles.includes('COORDENADOR') && !user.roles.includes('GERENTE')) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const pendingUsers = await userService.findPending();

    return NextResponse.json({ pendingUsers }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar usuários pendentes:", error)
    return NextResponse.json({ error: "Erro ao buscar usuários pendentes" }, { status: 500 })
  }
}


export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const user = session.user as any
    
    if (!user.roles.includes('COORDENADOR') && !user.roles.includes('GERENTE')) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const body = await request.json()
    const { userId, action } = body

    if (!userId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "ID do usuário e ação são obrigatórios" }, { status: 400 })
    }

    if (action === "approve") {

      const updatedUser = await userService.approveUser(Number(userId));

      return NextResponse.json({ 
        user: updatedUser, 
        message: "Usuário aprovado com sucesso"
      }, { status: 200 })
    } else {

      const deletedUser = await userService.delete(Number(userId));

      return NextResponse.json({ 
        user: deletedUser, 
        message: "Usuário rejeitado e removido do sistema"
      }, { status: 200 })
    }
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }
    console.error("Erro ao aprovar/rejeitar usuário:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
} 