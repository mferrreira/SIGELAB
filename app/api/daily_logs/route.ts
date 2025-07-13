import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const date = searchParams.get("date");
  const projectId = searchParams.get("projectId");
  
  // Get user session to check role
  const session = await getServerSession(authOptions);
  const currentUser = session?.user as any;
  
  const where: any = {};
  if (userId) where.userId = Number(userId);
  if (date) where.date = new Date(date);
  if (projectId) where.projectId = Number(projectId);
  
  // Role-based filtering
  if (currentUser) {
    if (currentUser.role === "voluntario" || currentUser.role === "gerente_projeto") {
      // Volunteers and project managers only see their own project's logs
      // For now, we'll filter by user's projects (this can be enhanced later)
      if (currentUser.role === "voluntario") {
        where.userId = currentUser.id; // Volunteers only see their own logs
      }
      // Project managers will see logs from their projects (implemented in context)
    }
    // Laboratorists and admins see all logs (no additional filtering)
  }
  
  const logs = await prisma["daily_logs"].findMany({
    where,
    orderBy: { date: "desc" },
    include: { 
      user: true,
      project: true 
    },
  });
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
  // Only allow if user is self or administrador de laboratório
  const user = session.user as any;
  if (user.role !== "administrador_laboratorio" && user.id !== userId) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const log = await prisma["daily_logs"].create({
    data: {
      userId,
      date: new Date(date),
      note: note || null,
    },
  });
  return NextResponse.json({ log });
} 