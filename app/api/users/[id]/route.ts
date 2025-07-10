import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Obter um usuário específico
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const user = await prisma.users.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }
    // Não retornar informações sensíveis
    const { name, email, role, points, completedTasks } = user
    return NextResponse.json({ user: { id, name, email, role, points, completedTasks } }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 })
  }
}

// PUT: Atualizar um usuário
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const body = await request.json()
    const updatedUser = await prisma.users.update({
      where: { id },
      data: body,
    })
    // Não retornar informações sensíveis
    const { name, email, role, points, completedTasks } = updatedUser
    return NextResponse.json({ user: { id, name, email, role, points, completedTasks } }, { status: 200 })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }
    console.error("Erro ao atualizar usuário:", error)
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 })
  }
}

// PATCH: Adicionar pontos a um usuário
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const body = await request.json()
    if (body.action === "addPoints" && typeof body.points === "number") {
      const updatedUser = await prisma.users.update({
        where: { id },
        data: { points: { increment: body.points } },
      })
      // Não retornar informações sensíveis
      const { name, email, role, points, completedTasks } = updatedUser
      return NextResponse.json({ user: { id, name, email, role, points, completedTasks } }, { status: 200 })
    }
    return NextResponse.json({ error: "Ação não suportada" }, { status: 400 })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }
    console.error("Erro ao processar ação no usuário:", error)
    return NextResponse.json({ error: "Erro ao processar ação no usuário" }, { status: 500 })
  }
}
