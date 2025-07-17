import { createApiResponse, createApiError } from "@/lib/utils/utils";
import { UserController } from "@/backend/controllers/UserController";

const userController = new UserController();

// GET: Obter um usuário específico
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const user = await userController.userModel.findById(params.id);
    if (!user) return createApiError("Usuário não encontrado", 404);
    // Garantir que currentWeekHours está presente
    return createApiResponse({ user });
  } catch (error: any) {
    console.error("Erro ao buscar usuário:", error);
    return createApiError("Erro ao buscar usuário");
  }
}

// PUT: Atualizar um usuário
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await request.json();
    const user = await userController.userModel.update(params.id, body);
    return createApiResponse({ user });
  } catch (error: any) {
    console.error("Erro ao atualizar usuário:", error);
    return createApiError("Erro ao atualizar usuário");
  }
}

// PATCH: Adicionar pontos a um usuário
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await request.json();
    if (body.action === "addPoints" && typeof body.points === "number") {
      const user = await userController.addPoints(params.id, body.points);
      return createApiResponse({ user });
    }
    return createApiError("Ação não suportada", 400);
  } catch (error: any) {
    console.error("Erro ao processar a ação no usuário:", error);
    return createApiError("Erro ao processar a ação no usuário");
  }
}
