import { NextResponse } from "next/server";
import { HistoryController } from "@/backend/controllers/HistoryController";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/server-auth";

const historyController = new HistoryController();

// GET: Obter histórico de atividades
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const canView = await historyController.canUserViewHistory(parseInt((session.user as any).id));
    if (!canView) {
      return NextResponse.json({ error: "Sem permissão para visualizar histórico" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    const action = searchParams.get("action");
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = searchParams.get("limit");

    let history;

    if (entityType && entityId) {
      // Get history for specific entity
      history = await historyController.getEntityHistory(
        entityType as any,
        parseInt(entityId),
        limit ? parseInt(limit) : undefined
      );
    } else if (userId) {
      // Get user activity
      history = await historyController.getUserActivity(
        parseInt(userId),
        limit ? parseInt(limit) : undefined
      );
    } else if (action) {
      // Get history by action
      history = await historyController.getActivityByAction(action as any);
    } else if (startDate && endDate) {
      // Get history by date range
      history = await historyController.getActivityByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
    } else {
      // Get recent activity
      history = await historyController.getRecentActivity(
        limit ? parseInt(limit) : 50
      );
    }

    return NextResponse.json({ 
      history: history.map(h => h.toJSON()),
      count: history.length 
    });
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json({ error: "Erro ao buscar histórico" }, { status: 500 });
  }
}

