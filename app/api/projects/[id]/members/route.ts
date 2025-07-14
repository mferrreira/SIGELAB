import { NextResponse } from "next/server"
import { ProjectManagerController } from "@/backend/controllers/ProjectManagerController"
import { prisma } from "@/lib/prisma"

const projectManagerController = new ProjectManagerController();

// GET: List all members of a project
export async function GET(request: Request, { params }: { params: { id: number } }) {
  try {
    const projectId = Number(params.id)
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
export async function POST(request: Request, { params }: { params: { id: number } }) {
  try {
    const projectId = Number(params.id)
    const body = await request.json()
    const { userId, role } = body
    if (!userId || !role) {
      return NextResponse.json({ error: "userId e role são obrigatórios" }, { status: 400 })
    }
    const member = await projectManagerController.assignUserToProject(projectId.toString(), userId.toString(), role)
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
export async function DELETE(request: Request, { params }: { params: { id: number } }) {
  try {
    const projectId = Number(params.id)
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