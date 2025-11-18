import { NextResponse } from "next/server";
import { BadgeService } from "@/backend/services/BadgeService";
import { BadgeRepository, UserBadgeRepository } from "@/backend/repositories/BadgeRepository";

const badgeService = new BadgeService(
  new BadgeRepository(),
  new UserBadgeRepository(),
);

// GET: Obter badges de um usuário
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = searchParams.get("limit");

    if (!userId) {
      return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
    }

    const badges = await badgeService.getUserBadges(parseInt(userId));
    const recentBadges = limit 
      ? await badgeService.getRecentUserBadges(parseInt(userId), parseInt(limit))
      : await badgeService.getRecentUserBadges(parseInt(userId));

    return NextResponse.json({ 
      badges, 
      recentBadges,
      count: badges.length 
    });
  } catch (error) {
    console.error("Erro ao buscar badges do usuário:", error);
    return NextResponse.json({ error: "Erro ao buscar badges do usuário" }, { status: 500 });
  }
}

// POST: Conceder badge a um usuário
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { badgeId, userId, awardedBy } = body;

    if (!badgeId || !userId) {
      return NextResponse.json({ error: "badgeId e userId são obrigatórios" }, { status: 400 });
    }

    const userBadge = await badgeService.awardBadgeToUser(badgeId, userId, awardedBy);
    return NextResponse.json({ userBadge }, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao conceder badge:", error);
    return NextResponse.json({ error: error.message || "Erro ao conceder badge" }, { status: 500 });
  }
}

