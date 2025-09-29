import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/server-auth"
import { NotificationController } from "@/backend/controllers/NotificationController"

const notificationController = new NotificationController()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const result = await notificationController.markAllAsRead(session.user.id)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Erro ao marcar todas as notificações como lidas:", error)
    return NextResponse.json({ error: "Erro ao marcar todas as notificações como lidas" }, { status: 500 })
  }
}


