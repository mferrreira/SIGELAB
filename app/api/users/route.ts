import { NextResponse } from "next/server";
import { UserController } from "@/backend/controllers/UserController";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const userController = new UserController();

// GET: Obter todos os usuários
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const users = await userController.getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}

// POST: Criar um novo usuário (público - aprovação posterior)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const user = await userController.createUser(body);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json({ error: error.message || "Erro ao criar usuário" }, { status: 500 });
  }
}