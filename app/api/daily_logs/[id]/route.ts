import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const log = await prisma.daily_logs.findUnique({
    where: { id: Number(params.id) },
    include: { user: true },
  });
  if (!log) return NextResponse.json({ error: "Log não encontrado" }, { status: 404 });
  return NextResponse.json({ log });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const log = await prisma.daily_logs.findUnique({ where: { id: Number(params.id) } });
  if (!log) return NextResponse.json({ error: "Log não encontrado" }, { status: 404 });
  if (session.user.role !== "admin" && session.user.id !== log.userId) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const body = await request.json();
  const updated = await prisma.daily_logs.update({
    where: { id: Number(params.id) },
    data: {
      note: body.note ?? log.note,
      date: body.date ? new Date(body.date) : log.date,
    },
  });
  return NextResponse.json({ log: updated });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const log = await prisma.daily_logs.findUnique({ where: { id: Number(params.id) } });
  if (!log) return NextResponse.json({ error: "Log não encontrado" }, { status: 404 });
  if (session.user.role !== "admin" && session.user.id !== log.userId) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  await prisma.daily_logs.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ success: true });
} 