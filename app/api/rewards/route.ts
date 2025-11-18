import { NextResponse } from "next/server"
import { RewardService } from "@/backend/services/RewardService";
import { RewardRepository } from "@/backend/repositories/RewardRepository";

const rewardService = new RewardService(
  new RewardRepository(),
)

export async function GET() {
  try {
    const rewards = await rewardService.findAll();
    return NextResponse.json({ rewards });
  } catch (error: any) {
    console.error('Erro ao buscar recompensas:', error);
    return NextResponse.json({ error: 'Erro ao buscar recompensas', details: error?.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
      const data = await request.json();
      const reward = await rewardService.create(data);
      return new Response(JSON.stringify({ reward: reward.toPrisma() }), { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
      });
    } catch (error: any) {
      console.error('Erro ao criar recompensa:', error);
      return new Response(JSON.stringify({ 
        error: 'Erro ao criar recompensa', 
        details: error?.message 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
}
