import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/server-auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("avatar") as File
    const userId = formData.get("userId") as string

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    if (!userId || parseInt(userId) !== session.user.id) {
      return NextResponse.json({ error: "Usuário não autorizado" }, { status: 403 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Apenas arquivos de imagem são permitidos" }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 5MB" }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "avatars")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `avatar_${userId}_${Date.now()}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return the public URL
    const avatarUrl = `/uploads/avatars/${fileName}`

    // TODO: Update user avatar in database
    // This would typically involve updating the user record in the database
    // For now, we'll just return the URL

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

