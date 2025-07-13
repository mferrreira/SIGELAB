import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Obter todas as compras
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const purchases = userId
      ? await prisma.purchases.findMany({ 
          where: { userId: Number(userId) },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            },
            reward: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true
              }
            }
          },
          orderBy: { id: 'desc' }
        })
      : await prisma.purchases.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            },
            reward: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true
              }
            }
          },
          orderBy: { id: 'desc' }
        })
    return NextResponse.json({ purchases }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar compras:", error)
    return NextResponse.json({ error: "Erro ao buscar compras" }, { status: 500 })
  }
}

// POST: Criar uma nova compra (resgatar recompensa)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.userId || !body.rewardId) {
      return NextResponse.json({ error: "ID do usuário e ID da recompensa são obrigatórios" }, { status: 400 })
    }
    // Verificar se a recompensa existe e está disponível
    const reward = await prisma.rewards.findUnique({ where: { id: body.rewardId } })
    if (!reward || !reward.available) {
      return NextResponse.json({ error: "Recompensa não disponível" }, { status: 400 })
    }
    // Verificar se o usuário existe
    const user = await prisma.users.findUnique({ where: { id: Number(body.userId) } })
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 400 })
    }
    // Verificar se o usuário tem pontos suficientes
    if ((user.points ?? 0) < reward.price) {
      return NextResponse.json({ error: "Pontos insuficientes" }, { status: 400 })
    }
    // Deduzir pontos do usuário e criar a compra em uma transação
    const purchase = await prisma.$transaction(async (tx) => {
      await tx.users.update({
        where: { id: Number(body.userId) },
        data: { points: (user.points ?? 0) - reward.price },
      })
      return await tx.purchases.create({
        data: {
          userId: Number(body.userId),
          rewardId: body.rewardId,
          rewardName: reward.name,
          price: reward.price,
          purchaseDate: new Date().toISOString(),
          status: "pending",
        },
      })
    })
    return NextResponse.json({ purchase }, { status: 201 })
  } catch (error) {
    console.error("Erro ao processar compra:", error)
    return NextResponse.json({ error: "Erro ao processar compra" }, { status: 500 })
  }
}
