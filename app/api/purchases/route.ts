import { NextResponse } from "next/server"
import { getAllPurchases, getPurchasesByUser, purchaseReward } from "@/lib/db/rewards"

// GET: Obter todas as compras
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const purchases = userId ? getPurchasesByUser(userId) : getAllPurchases()

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

    // Validar dados
    if (!body.userId || !body.rewardId) {
      return NextResponse.json({ error: "ID do usuário e ID da recompensa são obrigatórios" }, { status: 400 })
    }

    // Realizar a compra
    const purchase = purchaseReward(body.userId, body.rewardId)

    if (!purchase) {
      return NextResponse.json(
        {
          error:
            "Falha ao processar a compra. Verifique se o usuário tem pontos suficientes ou se a recompensa está disponível.",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ purchase }, { status: 201 })
  } catch (error) {
    console.error("Erro ao processar compra:", error)
    return NextResponse.json({ error: "Erro ao processar compra" }, { status: 500 })
  }
}
