import { NextResponse } from "next/server";

import { UserService } from '@/backend/services/UserService'
import { UserRepository } from '@/backend/repositories/UserRepository'
import { BadgeRepository, UserBadgeRepository } from '@/backend/repositories/BadgeRepository'

const userService = new UserService(
  new UserRepository(),
  new BadgeRepository(),
  new UserBadgeRepository(),
)



// GET: Obter estatísticas dos usuários
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let statistics;
    switch (type) {
      case "general":
        statistics = await userService.getUserStatistics();
        break;
      case "roles":
        statistics = await userService.getUsersByRole();
        break;
      case "status":
        statistics = await userService.getUserByStatus();
        break;
      default:
        statistics = await userService.getUserStatistics();
    }

    return NextResponse.json({ statistics });
  } catch (error) {
    console.error("Erro ao buscar estatísticas dos usuários:", error);
    return NextResponse.json({ error: "Erro ao buscar estatísticas dos usuários" }, { status: 500 });
  }
}

