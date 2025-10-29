import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/server-auth"
import { NotificationController } from "@/backend/controllers/NotificationController"

const notificationController = new NotificationController()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const countOnly = searchParams.get('count') === 'true'

    if (countOnly) {
      const result = await notificationController.getUnreadCount(session.user.id)
      return NextResponse.json(result, { status: 200 })
    }

    if (unreadOnly) {
      const result = await notificationController.getUnreadNotifications(session.user.id)
      return NextResponse.json(result, { status: 200 })
    }

    const result = await notificationController.getNotifications(session.user.id)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, message, data, userId } = body

    if (!type || !title || !message || !userId) {
      return NextResponse.json({ error: "Dados obrigatórios não fornecidos" }, { status: 400 })
    }

    const userRoles = session.user.roles || []
    const canCreateNotifications = userRoles.includes('COORDENADOR') || userRoles.includes('GERENTE') || userRoles.includes('GERENTE_PROJETO')

    if (!canCreateNotifications) {
      return NextResponse.json({ error: "Sem permissão para criar notificações" }, { status: 403 })
    }

    const result = await notificationController.create({
      userId,
      type,
      title,
      message,
      data
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar notificação:", error)
    return NextResponse.json({ error: "Erro ao criar notificação" }, { status: 500 })
  }
}


