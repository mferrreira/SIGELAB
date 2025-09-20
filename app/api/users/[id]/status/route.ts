import { NextResponse } from "next/server";
import { UserController } from "@/backend/controllers/UserController";

const userController = new UserController();

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
        user = await userController.approveUser(id);
        break;
      case "reject":
        user = await userController.rejectUser(id);
        break;
      case "suspend":
        user = await userController.suspendUser(id);
        break;
      case "activate":
        user = await userController.activateUser(id);
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

