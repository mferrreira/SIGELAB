import { NextResponse } from "next/server";
import { UserService } from '@/backend/services/UserService'
import { UserRepository } from '@/backend/repositories/UserRepository'
import { BadgeRepository, UserBadgeRepository } from '@/backend/repositories/BadgeRepository'

const userService = new UserService(
  new UserRepository(),
  new BadgeRepository(),
  new UserBadgeRepository(),
)

// GET: Obter perfis públicos dos usuários
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "public";

    let users;
    switch (type) {
      case "public":
        users = await userService.getPublicProfiles();
        break;
      case "members":
        users = await userService.getMemberProfiles();
        break;
      default:
        users = await userService.getPublicProfiles();
    }

    return NextResponse.json({ users, type });
  } catch (error) {
    console.error("Erro ao buscar perfis dos usuários:", error);
    return NextResponse.json({ error: "Erro ao buscar perfis dos usuários" }, { status: 500 });
  }
}

