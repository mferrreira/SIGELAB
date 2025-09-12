import { NextResponse } from "next/server"
import { RewardController } from "@/backend/controllers/RewardController"

const rewardController = new RewardController();

// GET: Obter todas as recompensas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const available = searchParams.get("available");
    const userPoints = searchParams.get("userPoints");
    const name = searchParams.get("name");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    let rewards;
    
    if (available === "true") {
      rewards = await rewardController.getAvailableRewards();
    } else if (available === "false") {
      rewards = await rewardController.getUnavailableRewards();
    } else if (userPoints) {
      rewards = await rewardController.findAffordable(Number(userPoints));
    } else if (name) {
      rewards = await rewardController.findByName(name);
    } else if (minPrice && maxPrice) {
      rewards = await rewardController.findByPriceRange(Number(minPrice), Number(maxPrice));
    } else {
      rewards = await rewardController.getAllRewards();
    }

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
