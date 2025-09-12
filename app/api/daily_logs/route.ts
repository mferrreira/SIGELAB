import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DailyLogController } from "@/backend/controllers/DailyLogController";

const dailyLogController = new DailyLogController();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");
    const projectId = searchParams.get("projectId");
    const session = await getServerSession(authOptions);
    const currentUser = session?.user as any;

    let logs;
    
    if (userId) {
      if (date) {
        logs = await dailyLogController.getLogsByDateRange(
          Number(userId), 
          new Date(date), 
          new Date(date)
        );
      } else {
        logs = await dailyLogController.getLogsByUser(Number(userId));
      }
    } else if (projectId) {
      logs = await dailyLogController.getLogsByProject(Number(projectId));
    } else {
      if (currentUser) {
        if (currentUser.role === "voluntario") {
          logs = await dailyLogController.getLogsByUser(currentUser.id);
        } else {
          logs = await dailyLogController.getAllLogs();
        }
      } else {
        logs = await dailyLogController.getAllLogs();
      }
    }

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Erro ao buscar logs diários:", error);
    return NextResponse.json({ error: "Erro ao buscar logs diários" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    
    const body = await request.json();
    const { userId, date, note, projectId, workSessionId } = body;
    
    if (!userId) {
      return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
    }
    
    let logDate: Date;
    if (!date) {
      logDate = new Date();
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number);
      logDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    } else {
      logDate = new Date(date);
    }
    
    const user = session.user as any;
    if (user.roles.includes('COLABORADOR')) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }
    if (!user.roles.includes('COORDENADOR') && user.id !== userId) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }
    
    const log = await dailyLogController.createLog({ 
      userId, 
      date: logDate, 
      note: note || null,
      projectId: projectId || null,
      workSessionId: workSessionId || null
    });
    
    return NextResponse.json({ log });
  } catch (error) {
    console.error("Erro ao criar log diário:", error);
    return NextResponse.json({ error: "Erro ao criar log diário" }, { status: 500 });
  }
} 