import { NextResponse } from "next/server";

import { UserService } from '@/backend/services/UserService'
import { UserRepository } from '@/backend/repositories/UserRepository'
import { BadgeRepository, UserBadgeRepository } from '@/backend/repositories/BadgeRepository'

const userService = new UserService(
  new UserRepository(),
  new BadgeRepository(),
  new UserBadgeRepository(),
)

// PATCH: Atualizar pontos do usuário
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    const body = await request.json();
    const { action, points } = body;

    if (points === undefined || points < 0) {
      return NextResponse.json({ error: "Pontos devem ser um número não negativo" }, { status: 400 });
    }

    let user;
    switch (action) {
      case "add":
        user = await userService.addPoints(id, points);
        break;
      case "remove":
        user = await userService.removePoints(id, points);
        break;
      case "set":
        user = await userService.setPoints(id, points);
        break;
      default:
        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Erro ao atualizar pontos do usuário:", error);
    return NextResponse.json({ error: error.message || "Erro ao atualizar pontos do usuário" }, { status: 500 });
  }
}

