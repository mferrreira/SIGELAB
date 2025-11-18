import { NextResponse } from "next/server";

import { UserService } from '@/backend/services/UserService'
import { UserRepository } from '@/backend/repositories/UserRepository'
import { BadgeRepository, UserBadgeRepository } from '@/backend/repositories/BadgeRepository'

const userService = new UserService(
  new UserRepository(),
  new BadgeRepository(),
  new UserBadgeRepository(),
)

// GET: Obter um usuário específico
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    const user = await userService.findById(id);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 });
  }
}

// PUT: Atualizar um usuário
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    const body = await request.json();

    const user = await userService.update(id, body);
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json({ error: error.message || "Erro ao atualizar usuário" }, { status: 500 });
  }
}

// DELETE: Excluir um usuário
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    await userService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json({ error: error.message || "Erro ao excluir usuário" }, { status: 500 });
  }
}