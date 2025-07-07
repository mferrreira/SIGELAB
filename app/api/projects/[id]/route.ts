import { NextResponse } from "next/server"
import { getProjectById, updateProject, deleteProject } from "@/lib/db/projects"

// GET: Obter um projeto específico
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const project = getProjectById(id)

    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ project }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar projeto:", error)
    return NextResponse.json({ error: "Erro ao buscar projeto" }, { status: 500 })
  }
}

// PUT: Atualizar um projeto
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    const updatedProject = updateProject(id, body)

    if (!updatedProject) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ project: updatedProject }, { status: 200 })
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error)
    return NextResponse.json({ error: "Erro ao atualizar projeto" }, { status: 500 })
  }
}

// DELETE: Excluir um projeto
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const success = deleteProject(id)

    if (!success) {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Erro ao excluir projeto:", error)
    return NextResponse.json({ error: "Erro ao excluir projeto" }, { status: 500 })
  }
}
