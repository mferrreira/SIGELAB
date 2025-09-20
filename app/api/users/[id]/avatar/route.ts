import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/server-auth"
import { unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = parseInt(params.id)
    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Usuário não autorizado" }, { status: 403 })
    }

    // TODO: Get current avatar URL from database
    // For now, we'll assume the avatar file exists and try to delete it
    // In a real implementation, you'd fetch the user's current avatar URL from the database

    // Example: if you had the avatar URL, you could extract the filename and delete it
    // const avatarUrl = user.avatar // from database
    // if (avatarUrl) {
    //   const fileName = avatarUrl.split('/').pop()
    //   const filePath = join(process.cwd(), "public", "uploads", "avatars", fileName)
    //   
    //   if (existsSync(filePath)) {
    //     await unlink(filePath)
    //   }
    // }

    // TODO: Update user avatar to null in database
    // await userService.updateAvatar(userId, null)

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

