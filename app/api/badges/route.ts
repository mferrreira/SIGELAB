import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/server-auth";
import { BadgeController } from "@/backend/controllers/BadgeController";

const badgeController = new BadgeController();

// GET: Obter todos os badges
export async function GET() {
  try {
    const badges = await badgeController.getAllBadges();
    return NextResponse.json({ badges });
  } catch (error) {
    console.error("Erro ao buscar badges:", error);
    return NextResponse.json({ error: "Erro ao buscar badges" }, { status: 500 });
  }
}

// POST: Criar um novo badge
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // If session exists but userId is missing, get user from database
    let userId = (session.user as any).id;
    if (!userId && session.user.email) {
      const { prisma } = await import("@/lib/database/prisma");
      const user = await prisma.users.findUnique({
        where: { email: session.user.email.toLowerCase() },
        select: { id: true, roles: true }
      });
      
      if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 });
      }
      
      userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    
    // Set the authenticated user as the creator
    body.createdBy = userId;
    
    const badge = await badgeController.createBadge(body);
    return NextResponse.json({ badge }, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar badge:", error);
    return NextResponse.json({ error: error.message || "Erro ao criar badge" }, { status: 500 });
  }
}
