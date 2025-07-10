import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Obter um projeto específico
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const project = await prisma.projects.findUnique({ where: { id } })
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
    const updatedProject = await prisma.projects.update({
      where: { id },
      data: body,
    })
    return NextResponse.json({ project: updatedProject }, { status: 200 })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
    }
    console.error("Erro ao atualizar projeto:", error)
    return NextResponse.json({ error: "Erro ao atualizar projeto" }, { status: 500 })
  }
}

// DELETE: Excluir um projeto
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    await prisma.projects.delete({ where: { id } })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
    }
    console.error("Erro ao excluir projeto:", error)
    return NextResponse.json({ error: "Erro ao excluir projeto" }, { status: 500 })
  }
}
