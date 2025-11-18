import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ImageProcessor } from "@/lib/utils/image-processor"

import { UserService } from '@/backend/services/UserService'
import { UserRepository } from '@/backend/repositories/UserRepository'
import { BadgeRepository, UserBadgeRepository } from '@/backend/repositories/BadgeRepository'

const userService = new UserService(
  new UserRepository(),
  new BadgeRepository(),
  new UserBadgeRepository(),
)

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = parseInt(params.id)
    if (userId !== (session.user as any).id) {
      return NextResponse.json({ error: "Usuário não autorizado" }, { status: 403 })
    }

    const currentUser = await userService.findById(userId)
    
    if (currentUser?.avatar) {
      await ImageProcessor.deleteImage(currentUser.avatar)
    }
    
    await userService.updateProfile(userId, { avatar: null })

    return NextResponse.json({ 
      success: true, 
      message: "Avatar removido com sucesso" 
    })

  } catch (error) {
    console.error("Erro ao remover avatar:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}

