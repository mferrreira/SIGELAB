import { NextResponse } from "next/server";
import { UserController } from "@/backend/controllers/UserController";

const userController = new UserController();

// GET: Obter perfis públicos dos usuários
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "public";

    let users;
    switch (type) {
      case "public":
        users = await userController.getPublicProfiles();
        break;
      case "members":
        users = await userController.getMemberProfiles();
        break;
      default:
        users = await userController.getPublicProfiles();
    }

    return NextResponse.json({ users, type });
  } catch (error) {
    console.error("Erro ao buscar perfis dos usuários:", error);
    return NextResponse.json({ error: "Erro ao buscar perfis dos usuários" }, { status: 500 });
  }
}

