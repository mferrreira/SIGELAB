import { NextResponse } from "next/server"
import { RewardController } from "@/backend/controllers/RewardController"

const rewardController = new RewardController();

// GET: Obter todas as recompensas
export async function GET() {
  try {
    const rewards = await rewardController.getAllRewards();
    return NextResponse.json({ rewards });
  } catch (error: any) {
    console.error('Erro ao buscar recompensas:', error);
    return NextResponse.json({ error: 'Erro ao buscar recompensas', details: error?.message }, { status: 500 });
  }
}

// POST: Criar uma nova recompensa
export async function POST(request: Request) {
  try {
    const response = await rewardController.createReward(request);
    return response;
  } catch (error: any) {
    console.error('Erro ao criar recompensa:', error);
    return NextResponse.json({ error: 'Erro ao criar recompensa', details: error?.message }, { status: 500 });
  }
}
