import { NextResponse } from "next/server";

import { UserService } from '@/backend/services/UserService'
import { UserRepository } from '@/backend/repositories/UserRepository'
import { BadgeRepository, UserBadgeRepository } from '@/backend/repositories/BadgeRepository'

const userService = new UserService(
  new UserRepository(),
  new BadgeRepository(),
  new UserBadgeRepository(),
)

// GET: Obter leaderboard dos usuários
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "points";
    const limit = searchParams.get("limit");

    let users;
    switch (type) {
      case "points":
        users = await userService.getTopUsersByPoints(limit ? parseInt(limit) : undefined);
        break;
      case "tasks":
        users = await userService.getTopUsersByTasks(limit ? parseInt(limit) : undefined);
        break;
      default:
        users = await userService.getTopUsersByPoints(limit ? parseInt(limit) : undefined);
    }

    return NextResponse.json({ users, type });
  } catch (error) {
    console.error("Erro ao buscar leaderboard:", error);
    return NextResponse.json({ error: "Erro ao buscar leaderboard" }, { status: 500 });
  }
}

