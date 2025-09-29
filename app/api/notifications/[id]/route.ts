import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/server-auth"
import { NotificationController } from "@/backend/controllers/NotificationController"

const notificationController = new NotificationController()

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const notificationId = parseInt(params.id)
    if (isNaN(notificationId)) {
      return NextResponse.json({ error: "ID de notificação inválido" }, { status: 400 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'markAsRead') {
      const result = await notificationController.markAsRead(notificationId, session.user.id)
      return NextResponse.json(result, { status: 200 })
    }

    return NextResponse.json({ error: "Ação não suportada" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao atualizar notificação:", error)
    return NextResponse.json({ error: "Erro ao atualizar notificação" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const notificationId = parseInt(params.id)
    if (isNaN(notificationId)) {
      return NextResponse.json({ error: "ID de notificação inválido" }, { status: 400 })
    }

    const result = await notificationController.deleteNotification(notificationId, session.user.id)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Erro ao excluir notificação:", error)
    return NextResponse.json({ error: "Erro ao excluir notificação" }, { status: 500 })
  }
}


