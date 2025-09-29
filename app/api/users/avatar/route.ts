import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { UserController } from "@/backend/controllers/UserController"
import { ImageProcessor } from "@/lib/utils/image-processor"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("avatar") as File
    const userId = formData.get("userId") as string

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    if (!userId || parseInt(userId) !== (session.user as any).id) {
      return NextResponse.json({ error: "Usuário não autorizado" }, { status: 403 })
    }

    const validation = ImageProcessor.validateImage(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const userController = new UserController()
    const currentUser = await userController.getUser(parseInt(userId))
    
    if (currentUser?.avatar) {
      await ImageProcessor.deleteImage(currentUser.avatar)
    }

    const avatarUrl = await ImageProcessor.processAndSave(file, parseInt(userId), {
      width: 300,
      height: 300,
      quality: 85,
      format: 'webp'
    })

    await userController.updateProfile(parseInt(userId), { avatar: avatarUrl })

    return NextResponse.json({ 
      success: true, 
      avatarUrl,
      message: "Avatar atualizado com sucesso" 
    })

  } catch (error) {
    console.error("Erro ao fazer upload do avatar:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}

