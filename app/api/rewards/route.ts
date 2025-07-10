import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Obter todas as recompensas
export async function GET() {
  try {
    const rewards = await prisma.rewards.findMany()
    return NextResponse.json({ rewards }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar recompensas:", error)
    return NextResponse.json({ error: "Erro ao buscar recompensas" }, { status: 500 })
  }
}

// POST: Criar uma nova recompensa
export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.name || body.price === undefined) {
      return NextResponse.json({ error: "Nome e preço são obrigatórios" }, { status: 400 })
    }
    const reward = await prisma.rewards.create({
      data: {
        name: body.name,
        description: body.description || "",
        price: body.price,
        available: body.available !== undefined ? body.available : true,
      },
    })
    return NextResponse.json({ reward }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar recompensa:", error)
    return NextResponse.json({ error: "Erro ao criar recompensa" }, { status: 500 })
  }
}
