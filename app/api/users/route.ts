import { createApiResponse, createApiError } from "@/contexts/utils";
import { UserController } from "@/backend/controllers/UserController";

const userController = new UserController();

// GET: Obter todos os usuários
export async function GET(request: Request) {
  try {
    const users = await userController.userModel.findAll();
    return createApiResponse({ users });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return createApiError("Erro ao buscar usuários");
  }
}

// POST: Criar um novo usuário
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await userController.userModel.create(body);
    return createApiResponse({ user }, 201);
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error);
    return createApiError("Erro ao criar usuário");
  }
}

// PATCH: Aprovar ou rejeitar usuário
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action } = body;
    if (!id || !["approve", "reject"].includes(action)) {
      return createApiError("ID e ação são obrigatórios", 400);
    }
    const user = await userController.updateUserStatus(id, action);
    return createApiResponse({ user });
  } catch (error: any) {
    console.error("Erro ao atualizar status do usuário:", error);
    return createApiError("Erro ao atualizar status do usuário");
  }
}
