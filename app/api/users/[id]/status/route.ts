import { NextResponse } from "next/server";

import { UserService } from '@/backend/services/UserService'
import { UserRepository } from '@/backend/repositories/UserRepository'
import { BadgeRepository, UserBadgeRepository } from '@/backend/repositories/BadgeRepository'

const userService = new UserService(
  new UserRepository(),
  new BadgeRepository(),
  new UserBadgeRepository(),
)

// PATCH: Atualizar status do usuário
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    const body = await request.json();
    const { action } = body;

    let user;
    switch (action) {
      case "approve":
        user = await userService.approveUser(id);
        break;
      case "reject":
        user = await userService.rejectUser(id);
        break;
      case "suspend":
        user = await userService.suspendUser(id);
        break;
      case "activate":
        user = await userService.activateUser(id);
        break;
      default:
        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Erro ao atualizar status do usuário:", error);
    return NextResponse.json({ error: error.message || "Erro ao atualizar status do usuário" }, { status: 500 });
  }
}

