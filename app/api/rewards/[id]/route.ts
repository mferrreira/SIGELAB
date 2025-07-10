import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Obter uma recompensa específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }
    const reward = await prisma.rewards.findUnique({ where: { id } })
    if (!reward) {
      return NextResponse.json({ error: "Recompensa não encontrada" }, { status: 404 })
    }
    return NextResponse.json({ reward }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar recompensa:", error)
    return NextResponse.json({ error: "Erro ao buscar recompensa" }, { status: 500 })
  }
}

// PUT: Atualizar uma recompensa
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }
    const body = await request.json()
    const updatedReward = await prisma.rewards.update({
      where: { id },
      data: body,
    })
    return NextResponse.json({ reward: updatedReward }, { status: 200 })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Recompensa não encontrada" }, { status: 404 })
    }
    console.error("Erro ao atualizar recompensa:", error)
    return NextResponse.json({ error: "Erro ao atualizar recompensa" }, { status: 500 })
  }
}

// DELETE: Excluir uma recompensa
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }
    await prisma.rewards.delete({ where: { id } })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Recompensa não encontrada" }, { status: 404 })
    }
    console.error("Erro ao excluir recompensa:", error)
    return NextResponse.json({ error: "Erro ao excluir recompensa" }, { status: 500 })
  }
}
