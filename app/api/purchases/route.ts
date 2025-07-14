import { NextResponse } from "next/server"
import { PurchaseController } from "@/backend/controllers/PurchaseController"

const purchaseController = new PurchaseController();

// GET: Obter todas as compras
export async function GET() {
  try {
    const purchases = await purchaseController.getAllPurchases();
    return new Response(JSON.stringify({ purchases }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error('Erro ao buscar compras:', error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar compras', details: error?.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// POST: Criar uma nova compra (resgatar recompensa)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const purchase = await purchaseController.createPurchase(data);
    return new Response(JSON.stringify({ purchase }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error('Erro ao criar compra:', error);
    return new Response(JSON.stringify({ error: 'Erro ao criar compra', details: error?.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
