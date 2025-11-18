import { NextResponse } from "next/server"
import { PurchaseService } from "@/backend/services/PurchaseService";
import { PurchaseRepository } from "@/backend/repositories/PurchaseRepository";
import { RewardRepository } from "@/backend/repositories/RewardRepository";

const purchaseService = new PurchaseService(
  new PurchaseRepository(),
  new RewardRepository(),
)

// GET: Obter uma compra específica
export async function GET(context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const purchase = await purchaseService.findById(Number(params.id));
    if (!purchase) {
      return NextResponse.json({ error: "Compra não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ purchase });
  } catch (error: any) {
    console.error('Erro ao buscar compra:', error);
    return NextResponse.json({ error: 'Erro ao buscar compra', details: error?.message }, { status: 500 });
  }
}

// PUT: Atualizar uma compra
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const data = await request.json();
    const purchase = await purchaseService.update(Number(params.id), data);
    return NextResponse.json({ purchase });
  } catch (error: any) {
    console.error('Erro ao atualizar compra:', error);
    return NextResponse.json({ error: 'Erro ao atualizar compra', details: error?.message }, { status: 500 });
  }
}

// PATCH: Aprovar, rejeitar, completar ou cancelar uma compra
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { action, ...updateData } = body;

    let purchase;
    
    switch (action) {
      case "approve":
        purchase = await purchaseService.approvePurchase(Number(params.id));
        break;
      case "reject":
      case "deny":
        purchase = await purchaseService.rejectPurchase(Number(params.id));
        break;
      case "complete":
        purchase = await purchaseService.completePurchase(Number(params.id));
        break;
      case "cancel":
        purchase = await purchaseService.cancelPurchase(Number(params.id));
        break;
      default:
        purchase = await purchaseService.update(Number(params.id), updateData);
    }

    return NextResponse.json({ purchase });
  } catch (error: any) {
    console.error('Erro ao atualizar compra:', error);
    return NextResponse.json({ error: 'Erro ao atualizar compra', details: error?.message }, { status: 500 });
  }
}

// DELETE: Excluir uma compra
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    await purchaseService.delete(Number(params.id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao excluir compra:', error);
    return NextResponse.json({ error: 'Erro ao excluir compra', details: error?.message }, { status: 500 });
  }
}
