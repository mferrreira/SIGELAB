import { NextResponse } from "next/server";
import { HistoryController } from "@/backend/controllers/HistoryController";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/server-auth";

const historyController = new HistoryController();

// GET: Obter resumo de atividades
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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // padrão de 30 dias se a nada não for passada
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const summary = await historyController.getActivitySummary(start, end);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Erro ao buscar resumo de atividades:", error);
    return NextResponse.json({ error: "Erro ao buscar resumo de atividades" }, { status: 500 });
  }
}

