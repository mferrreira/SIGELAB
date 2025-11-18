import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { UserService } from '@/backend/services/UserService'
import { UserRepository } from '@/backend/repositories/UserRepository'
import { BadgeRepository, UserBadgeRepository } from '@/backend/repositories/BadgeRepository'

const userService = new UserService(
  new UserRepository(),
  new BadgeRepository(),
  new UserBadgeRepository(),
)

// GET: Obter perfil do usuário
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const params = await context.params;
    const id = parseInt(params.id);


    if ((session.user as any).id !== id && !(session.user as any).roles?.includes('COORDENADOR')) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const user = await userService.findById(id);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Erro ao buscar perfil do usuário:", error);
    return NextResponse.json({ error: error.message || "Erro ao buscar perfil do usuário" }, { status: 500 });
  }
}

// PATCH: Atualizar perfil do usuário
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const params = await context.params;
    const id = parseInt(params.id);

    if ((session.user as any).id !== id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const user = await userService.updateProfile(id, body);
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Erro ao atualizar perfil do usuário:", error);
    return NextResponse.json({ error: error.message || "Erro ao atualizar perfil do usuário" }, { status: 500 });
  }
}

