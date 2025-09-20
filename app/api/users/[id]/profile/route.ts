import { NextResponse } from "next/server";
import { UserController } from "@/backend/controllers/UserController";

const userController = new UserController();

// PATCH: Atualizar perfil do usuário
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    const body = await request.json();

    const user = await userController.updateProfile(id, body);
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Erro ao atualizar perfil do usuário:", error);
    return NextResponse.json({ error: error.message || "Erro ao atualizar perfil do usuário" }, { status: 500 });
  }
}

