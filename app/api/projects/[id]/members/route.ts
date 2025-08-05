import { NextResponse } from "next/server"
import { ProjectManagerController } from "@/backend/controllers/ProjectManagerController"
import { prisma } from "@/lib/database/prisma"

const projectManagerController = new ProjectManagerController();

export async function GET(request: Request, { params }: { params: Promise<{ id: number }> }) {
  try {
    const { id } = await params
    const projectId = Number(id)
    const members = await prisma.project_members.findMany({
      where: { projectId },
      include: { user: true },
    })
    return NextResponse.json({ members }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar membros do projeto:", error)
    return NextResponse.json({ error: "Erro ao buscar membros do projeto" }, { status: 500 })
  }
}

// POST: Add a member to a project
export async function POST(request: Request, { params }: { params: Promise<{ id: number }> }) {
  try {
    const { id } = await params
    const projectId = Number(id)
    const body = await request.json()
    const { userId, roles } = body
    if (!userId || !roles || !Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json({ error: "userId e roles são obrigatórios" }, { status: 400 })
    }
    const member = await projectManagerController.assignUserToProject(projectId.toString(), userId.toString(), roles)
    return NextResponse.json({ member }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Usuário já é membro do projeto" }, { status: 400 })
    }
    console.error("Erro ao adicionar membro ao projeto:", error)
    return NextResponse.json({ error: "Erro ao adicionar membro ao projeto" }, { status: 500 })
  }
}

// DELETE: Remove a member from a project
export async function DELETE(request: Request, { params }: { params: Promise<{ id: number }> }) {
  try {
    const { id } = await params
    const projectId = Number(id)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 })
    }
    await prisma.project_members.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: Number(userId),
        },
      },
    })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Erro ao remover membro do projeto:", error)
    return NextResponse.json({ error: "Erro ao remover membro do projeto" }, { status: 500 })
  }
} 