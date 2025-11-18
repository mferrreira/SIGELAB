import { NextResponse } from "next/server"
//import { ProjectController } from "@/backend/controllers/ProjectController"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ProjectService } from "@/backend/services/ProjectService";
import { ProjectRepository } from "@/backend/repositories/ProjectRepository";
import { ProjectMembershipRepository } from "@/backend/repositories/ProjectMembershipRepository";

const projectService = new ProjectService(
  new ProjectRepository(),
  new ProjectMembershipRepository()
)

export async function GET(request: Request, context: { params: Promise<{ id: number }> }) {
  try {
    const params = await context.params;
    const id = Number(params.id);
    const project = await projectService.findById(id)
    return NextResponse.json({ project }, { status: 200 })
  } catch (error: any) {
    console.error("Erro ao buscar projeto:", error)
    if (error.message === 'Projeto não encontrado') {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
    }
    return NextResponse.json({ error: "Erro ao buscar projeto" }, { status: 500 })
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: number }> }) {
  try {
    const params = await context.params;
    const id = Number(params.id);
    const body = await request.json()
    
    // Get user ID from session
    const session = await getServerSession(authOptions)
    const sessionUser = session?.user as any
    if (!sessionUser?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    
    const updatedProject = await projectService.update(id, body, sessionUser.id)
    return NextResponse.json({ project: updatedProject }, { status: 200 })
  } catch (error: any) {
    console.error("Erro ao atualizar projeto:", error)
    if (error.message === 'Projeto não encontrado') {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
    }
    if (error.message.includes('permissão')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Erro ao atualizar projeto" }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: number }> }) {
  try {
    const params = await context.params;
    const id = Number(params.id);
    
    // Get user ID from session
    const session = await getServerSession(authOptions)
    const sessionUser = session?.user as any
    if (!sessionUser?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    
    await projectService.delete(id, sessionUser.id)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("Erro ao excluir projeto:", error)
    if (error.message === 'Projeto não encontrado') {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
    }
    if (error.message.includes('permissão')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Erro ao excluir projeto" }, { status: 500 })
  }
}
