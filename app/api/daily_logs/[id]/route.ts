import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DailyLogController } from "@/backend/controllers/DailyLogController";
import type { User } from "@/contexts/types";

const dailyLogController = new DailyLogController();

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const log = await dailyLogController.getLog(Number(params.id));
  if (!log) return NextResponse.json({ error: "Log não encontrado" }, { status: 404 });
  return NextResponse.json({ log });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const user = session.user as User;
  const log = await dailyLogController.getLog(Number(params.id));
  if (!log) return NextResponse.json({ error: "Log não encontrado" }, { status: 404 });
  if (user.role !== "administrador_laboratorio" && user.id !== log.userId) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const body = await request.json();
  const updated = await dailyLogController.updateLog(Number(params.id), {
    note: body.note ?? log.note,
    date: body.date ? new Date(body.date) : log.date,
  });
  return NextResponse.json({ log: updated });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const user = session.user as User;
  const log = await dailyLogController.getLog(Number(params.id));
  if (!log) return NextResponse.json({ error: "Log não encontrado" }, { status: 404 });
  if (user.role !== "administrador_laboratorio" && user.id !== log.userId) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  await dailyLogController.deleteLog(Number(params.id));
  return NextResponse.json({ success: true });
} 