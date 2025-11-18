import { NextResponse } from "next/server"
import { PurchaseService } from "@/backend/services/PurchaseService";
import { PurchaseRepository } from "@/backend/repositories/PurchaseRepository";
import { RewardRepository } from "@/backend/repositories/RewardRepository";

const purchaseService = new PurchaseService(
  new PurchaseRepository(),
  new RewardRepository(),
)

// GET: Obter todas as compras
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const rewardId = searchParams.get("rewardId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let purchases;
    
    if (userId) {
      purchases = await purchaseService.findByUserId(Number(userId));
    } else if (rewardId) {
      purchases = await purchaseService.findByRewardId(Number(rewardId));
    } else if (status) {
      purchases = await purchaseService.findByStatus(status);
    } else if (startDate && endDate) {
      purchases = await purchaseService.searchPurchases({
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });
    } else {
      purchases = await purchaseService.findAll();
    }

    return NextResponse.json({ purchases });
  } catch (error: any) {
    console.error('Erro ao buscar compras:', error);
    return NextResponse.json({ error: 'Erro ao buscar compras', details: error?.message }, { status: 500 });
  }
}

// POST: Criar uma nova compra (resgatar recompensa)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const purchase = await purchaseService.create(data);
    return NextResponse.json({ purchase }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar compra:', error);
    return NextResponse.json({ error: 'Erro ao criar compra', details: error?.message }, { status: 500 });
  }
}
