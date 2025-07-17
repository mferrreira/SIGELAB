import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DailyLogController } from "@/backend/controllers/DailyLogController";

const dailyLogController = new DailyLogController();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const date = searchParams.get("date");
  const projectId = searchParams.get("projectId");
  const session = await getServerSession(authOptions);
  const currentUser = session?.user as any;
  const where: any = {};
  if (userId) where.userId = Number(userId);
  if (date) where.date = new Date(date);
  if (projectId) where.projectId = Number(projectId);
  if (currentUser) {
    if (currentUser.role === "voluntario") {
      where.userId = currentUser.id;
    }
  }
  // Use controller for log retrieval
  const logs = await dailyLogController.getAllLogs();
  // Optionally, filter logs here if needed
  return NextResponse.json({ logs });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const body = await request.json();
  const { userId, date, note } = body;
  if (!userId) {
    return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
  }
  let logDate: Date;
  if (!date) {
    logDate = new Date(); // Use now if not provided
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    // Only date provided, set to local 00:00:00
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
  // Use controller for log creation
  const log = await dailyLogController.createLog({ userId, date: logDate, note: note || null });
  return NextResponse.json({ log });
} 