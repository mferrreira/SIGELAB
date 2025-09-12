import { NextResponse } from "next/server"
import { PurchaseController } from "@/backend/controllers/PurchaseController"

const purchaseController = new PurchaseController();

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
      purchases = await purchaseController.getPurchasesByUser(Number(userId));
    } else if (rewardId) {
      purchases = await purchaseController.getPurchasesByReward(Number(rewardId));
    } else if (status) {
      purchases = await purchaseController.getPurchasesByStatus(status);
    } else if (startDate && endDate) {
      purchases = await purchaseController.searchPurchases({
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });
    } else {
      purchases = await purchaseController.getAllPurchases();
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
    const purchase = await purchaseController.createPurchase(data);
    return NextResponse.json({ purchase }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar compra:', error);
    return NextResponse.json({ error: 'Erro ao criar compra', details: error?.message }, { status: 500 });
  }
}
