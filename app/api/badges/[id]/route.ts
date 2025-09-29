import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/server-auth";
import { BadgeController } from "@/backend/controllers/BadgeController";

const badgeController = new BadgeController();

// GET: Obter um badge específico
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    const badge = await badgeController.getBadge(id);
    if (!badge) {
      return NextResponse.json({ error: "Badge não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ badge });
  } catch (error) {
    console.error("Erro ao buscar badge:", error);
    return NextResponse.json({ error: "Erro ao buscar badge" }, { status: 500 });
  }
}

// PUT: Atualizar um badge
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Get user ID from session or database
    let userId = (session.user as any).id;
    if (!userId && session.user.email) {
      const { prisma } = await import("@/lib/database/prisma");
      const user = await prisma.users.findUnique({
        where: { email: session.user.email.toLowerCase() },
        select: { id: true }
      });
      if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 });
      }
      userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const params = await context.params;
    const id = parseInt(params.id);
    const body = await request.json();

    const badge = await badgeController.updateBadge(id, body);
    return NextResponse.json({ badge });
  } catch (error: any) {
    console.error("Erro ao atualizar badge:", error);
    return NextResponse.json({ error: error.message || "Erro ao atualizar badge" }, { status: 500 });
  }
}

// DELETE: Excluir um badge
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Get user ID from session or database
    let userId = (session.user as any).id;
    if (!userId && session.user.email) {
      const { prisma } = await import("@/lib/database/prisma");
      const user = await prisma.users.findUnique({
        where: { email: session.user.email.toLowerCase() },
        select: { id: true }
      });
      if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 });
      }
      userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const params = await context.params;
    const id = parseInt(params.id);

    await badgeController.deleteBadge(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao excluir badge:", error);
    return NextResponse.json({ error: error.message || "Erro ao excluir badge" }, { status: 500 });
  }
}
