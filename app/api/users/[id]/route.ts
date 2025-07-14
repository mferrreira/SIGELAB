import { createApiResponse, createApiError } from "@/contexts/utils";
import { UserController } from "@/backend/controllers/UserController";

const userController = new UserController();

// GET: Obter um usuário específico
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await userController.userModel.findById(params.id);
    return createApiResponse({ user });
  } catch (error: any) {
    console.error("Erro ao buscar usuário:", error);
    return createApiError("Erro ao buscar usuário");
  }
}

// PUT: Atualizar um usuário
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const user = await userController.userModel.update(params.id, body);
    return createApiResponse({ user });
  } catch (error: any) {
    console.error("Erro ao atualizar usuário:", error);
    return createApiError("Erro ao atualizar usuário");
  }
}

// PATCH: Adicionar pontos a um usuário
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    if (body.action === "addPoints" && typeof body.points === "number") {
      const user = await userController.addPoints(params.id, body.points);
      return createApiResponse({ user });
    }
    return createApiError("Ação não suportada", 400);
  } catch (error: any) {
    console.error("Erro ao processar ação no usuário:", error);
    return createApiError("Erro ao processar ação no usuário");
  }
}
