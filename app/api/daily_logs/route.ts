import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const date = searchParams.get("date");
  const where: any = {};
  if (userId) where.userId = Number(userId);
  if (date) where.date = new Date(date);
  const logs = await prisma["daily_logs"].findMany({
    where,
    orderBy: { date: "desc" },
    include: { user: true },
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
  // Only allow if user is self or admin
  const user = session.user as any;
  if (user.role !== "admin" && user.id !== userId) {
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