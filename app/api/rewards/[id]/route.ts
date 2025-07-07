import { NextResponse } from "next/server"
import { getRewardById, updateReward, deleteReward } from "@/lib/db/rewards"

// GET: Obter uma recompensa específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const reward = getRewardById(id)

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
    const id = params.id
    const body = await request.json()

    const updatedReward = updateReward(id, body)

    if (!updatedReward) {
      return NextResponse.json({ error: "Recompensa não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ reward: updatedReward }, { status: 200 })
  } catch (error) {
    console.error("Erro ao atualizar recompensa:", error)
    return NextResponse.json({ error: "Erro ao atualizar recompensa" }, { status: 500 })
  }
}

// DELETE: Excluir uma recompensa
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const success = deleteReward(id)

    if (!success) {
      return NextResponse.json({ error: "Recompensa não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Erro ao excluir recompensa:", error)
    return NextResponse.json({ error: "Erro ao excluir recompensa" }, { status: 500 })
  }
}
