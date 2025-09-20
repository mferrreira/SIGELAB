import { NextResponse } from "next/server"
import { ProjectController } from "@/backend/controllers/ProjectController"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const projectController = new ProjectController();

export async function GET(request: Request, { params }: { params: Promise<{ id: number }> }) {
  try {
    const { id } = await params
    const projectId = Number(id)
    const members = await projectController.getProjectMembers(projectId)
    return NextResponse.json({ members }, { status: 200 })
  } catch (error: any) {
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
    
    // Get user ID from session
    const session = await getServerSession(authOptions)
    const sessionUser = session?.user as any
    if (!sessionUser?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    const addedBy = sessionUser.id
    
    const member = await projectController.addMemberToProject(projectId, userId, roles, addedBy)
    return NextResponse.json({ member }, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao adicionar membro ao projeto:", error)
    if (error.message.includes('já é membro')) {
      return NextResponse.json({ error: "Usuário já é membro do projeto" }, { status: 400 })
    }
    if (error.message.includes('permissão')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
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
    
    // Get user ID from session
    const session = await getServerSession(authOptions)
    const sessionUser = session?.user as any
    if (!sessionUser?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    const removedBy = sessionUser.id
    
    await projectController.removeMemberFromProject(projectId, Number(userId), removedBy)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("Erro ao remover membro do projeto:", error)
    if (error.message.includes('permissão')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    if (error.message.includes('último gerente')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Erro ao remover membro do projeto" }, { status: 500 })
  }
} 