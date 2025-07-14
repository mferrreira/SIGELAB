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
  if (!userId || !date) {
    return NextResponse.json({ error: "userId e date são obrigatórios" }, { status: 400 });
  }
  const user = session.user as any;
  if (user.role !== "administrador_laboratorio" && user.id !== userId) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  // Use controller for log creation
  const log = await dailyLogController.createLog({ userId, date: new Date(date), note: note || null });
  return NextResponse.json({ log });
} 