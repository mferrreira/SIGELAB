import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/server-auth"
import { UserController } from "@/backend/controllers/UserController"

const userController = new UserController()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID do usuário inválido" }, { status: 400 })
    }

    const body = await request.json()
    const { hours, reason, projectId } = body

    if (!hours || hours <= 0) {
      return NextResponse.json({ error: "Quantidade de horas inválida" }, { status: 400 })
    }

    if (!reason || reason.trim() === "") {
      return NextResponse.json({ error: "Motivo é obrigatório" }, { status: 400 })
    }

    const result = await userController.deductHours(userId, {
      hours,
      reason,
      projectId,
      deductedBy: session.user.id,
      deductedByRoles: session.user.roles || []
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Erro ao retirar horas:", error)
    return NextResponse.json({ error: "Erro ao retirar horas" }, { status: 500 })
  }
}


