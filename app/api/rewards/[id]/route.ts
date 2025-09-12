import { NextResponse } from "next/server"
import { RewardController } from "@/backend/controllers/RewardController"

const rewardController = new RewardController();

// GET: Obter uma recompensa específica
export async function GET(context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const reward = await rewardController.getReward(Number(params.id));
    if (!reward) {
      return NextResponse.json({ error: "Recompensa não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ reward });
  } catch (error: any) {
    console.error('Erro ao buscar recompensa:', error);
    return NextResponse.json({ error: 'Erro ao buscar recompensa', details: error?.message }, { status: 500 });
  }
}

// PUT: Atualizar uma recompensa
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const data = await request.json();
    const reward = await rewardController.updateReward(Number(params.id), data);
    return NextResponse.json({ reward });
  } catch (error: any) {
    console.error('Erro ao atualizar recompensa:', error);
    return NextResponse.json({ error: 'Erro ao atualizar recompensa', details: error?.message }, { status: 500 });
  }
}

// PATCH: Atualizar campos específicos de uma recompensa
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const data = await request.json();
    const { action, ...updateData } = data;

    let reward;
    
    switch (action) {
      case 'toggle-availability':
        reward = await rewardController.toggleAvailability(Number(params.id));
        break;
      case 'update-price':
        reward = await rewardController.updatePrice(Number(params.id), updateData.price);
        break;
      case 'update-name':
        reward = await rewardController.updateName(Number(params.id), updateData.name);
        break;
      case 'update-description':
        reward = await rewardController.updateDescription(Number(params.id), updateData.description);
        break;
      default:
        reward = await rewardController.updateReward(Number(params.id), updateData);
    }

    return NextResponse.json({ reward });
  } catch (error: any) {
    console.error('Erro ao atualizar recompensa:', error);
    return NextResponse.json({ error: 'Erro ao atualizar recompensa', details: error?.message }, { status: 500 });
  }
}

// DELETE: Excluir uma recompensa
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    await rewardController.deleteReward(Number(params.id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao excluir recompensa:', error);
    return NextResponse.json({ error: 'Erro ao excluir recompensa', details: error?.message }, { status: 500 });
  }
}
