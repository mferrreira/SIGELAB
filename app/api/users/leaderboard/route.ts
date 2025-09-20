import { NextResponse } from "next/server";
import { UserController } from "@/backend/controllers/UserController";

const userController = new UserController();

// GET: Obter leaderboard dos usuários
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "points";
    const limit = searchParams.get("limit");

    let users;
    switch (type) {
      case "points":
        users = await userController.getTopUsersByPoints(limit ? parseInt(limit) : undefined);
        break;
      case "tasks":
        users = await userController.getTopUsersByTasks(limit ? parseInt(limit) : undefined);
        break;
      default:
        users = await userController.getTopUsersByPoints(limit ? parseInt(limit) : undefined);
    }

    return NextResponse.json({ users, type });
  } catch (error) {
    console.error("Erro ao buscar leaderboard:", error);
    return NextResponse.json({ error: "Erro ao buscar leaderboard" }, { status: 500 });
  }
}

