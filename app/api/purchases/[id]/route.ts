import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Obter uma compra específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const purchase = await prisma.purchases.findUnique({ where: { id } })
    if (!purchase) {
      return NextResponse.json({ error: "Compra não encontrada" }, { status: 404 })
    }
    return NextResponse.json({ purchase }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar compra:", error)
    return NextResponse.json({ error: "Erro ao buscar compra" }, { status: 500 })
  }
}

// PATCH: Atualizar o status de uma compra
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    if (!body.status) {
      return NextResponse.json({ error: "Status é obrigatório" }, { status: 400 })
    }
    const validStatuses = ["pending", "approved", "rejected", "used"]
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 })
    }
    const updatedPurchase = await prisma.purchases.update({
      where: { id },
      data: { status: body.status },
    })
    return NextResponse.json({ purchase: updatedPurchase }, { status: 200 })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Compra não encontrada" }, { status: 404 })
    }
    console.error("Erro ao atualizar status da compra:", error)
    return NextResponse.json({ error: "Erro ao atualizar status da compra" }, { status: 500 })
  }
}
