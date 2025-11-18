import { NextResponse } from "next/server";

import { UserService } from '@/backend/services/UserService'
import { UserRepository } from '@/backend/repositories/UserRepository'
import { BadgeRepository, UserBadgeRepository } from '@/backend/repositories/BadgeRepository'

const userService = new UserService(
  new UserRepository(),
  new BadgeRepository(),
  new UserBadgeRepository(),
)

// PATCH: Atualizar roles do usuário
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    const body = await request.json();
    const { action, role, roles } = body;

    let user;
    switch (action) {
      case "add":
        if (!role) {
          return NextResponse.json({ error: "Role é obrigatório para adicionar" }, { status: 400 });
        }
        user = await userService.addRole(id, role);
        break;
      case "remove":
        if (!role) {
          return NextResponse.json({ error: "Role é obrigatório para remover" }, { status: 400 });
        }
        user = await userService.removeRole(id, role);
        break;
      case "set":
        if (!roles || !Array.isArray(roles)) {
          return NextResponse.json({ error: "Roles array é obrigatório para definir" }, { status: 400 });
        }
        user = await userService.setRoles(id, roles);
        break;
      default:
        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Erro ao atualizar roles do usuário:", error);
    return NextResponse.json({ error: error.message || "Erro ao atualizar roles do usuário" }, { status: 500 });
  }
}

