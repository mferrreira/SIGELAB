import { NextResponse } from "next/server";
import { UserController } from "@/backend/controllers/UserController";

const userController = new UserController();

// GET: Obter estatísticas dos usuários
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let statistics;
    switch (type) {
      case "general":
        statistics = await userController.getUserStatistics();
        break;
      case "roles":
        statistics = await userController.getUsersByRole();
        break;
      case "status":
        statistics = await userController.getUsersByStatus();
        break;
      default:
        statistics = await userController.getUserStatistics();
    }

    return NextResponse.json({ statistics });
  } catch (error) {
    console.error("Erro ao buscar estatísticas dos usuários:", error);
    return NextResponse.json({ error: "Erro ao buscar estatísticas dos usuários" }, { status: 500 });
  }
}

