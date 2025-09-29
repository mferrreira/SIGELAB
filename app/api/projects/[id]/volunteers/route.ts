import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/server-auth"
import { ProjectController } from "@/backend/controllers/ProjectController"

const projectController = new ProjectController()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const projectId = parseInt(params.id)
    if (isNaN(projectId)) {
      return NextResponse.json({ error: "ID do projeto inválido" }, { status: 400 })
    }

    const result = await projectController.getVolunteersStats(projectId)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar estatísticas dos voluntários:", error)
    return NextResponse.json({ error: "Erro ao buscar estatísticas dos voluntários" }, { status: 500 })
  }
}


