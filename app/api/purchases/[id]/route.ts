import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { createApiResponse, createApiError } from "@/contexts/utils"
import { PurchaseController } from "@/backend/controllers/PurchaseController"

const purchaseController = new PurchaseController();

// GET: Obter uma compra específica
export async function GET(context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const purchase = await purchaseController.getPurchase(Number(params.id));
    return NextResponse.json({ purchase });
  } catch (error: any) {
    console.error('Erro ao buscar compra:', error);
    return NextResponse.json({ error: 'Erro ao buscar compra', details: error?.message }, { status: 500 });
  }
}

// PATCH: Aprovar ou negar uma compra
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await request.json();
    let updated;
    if (body.action === "approve") {
      updated = await prisma.purchases.update({
        where: { id: Number(params.id) },
        data: { status: "approved" }
      });
    } else if (body.action === "deny") {
      updated = await prisma.purchases.update({
        where: { id: Number(params.id) },
        data: { status: "denied" }
      });
    } else {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }
    return NextResponse.json({ purchase: updated });
  } catch (error: any) {
    console.error('Erro ao atualizar compra:', error);
    return NextResponse.json({ error: 'Erro ao atualizar compra', details: error?.message }, { status: 500 });
  }
}
