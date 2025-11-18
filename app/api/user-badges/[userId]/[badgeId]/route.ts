import { NextResponse } from "next/server";
import { BadgeService } from "@/backend/services/BadgeService";
import { BadgeRepository, UserBadgeRepository } from "@/backend/repositories/BadgeRepository";

const badgeService = new BadgeService(
  new BadgeRepository(),
  new UserBadgeRepository(),
);

// DELETE: Remover badge de um usuário
export async function DELETE(request: Request, context: { params: Promise<{ userId: string; badgeId: string }> }) {
  try {
    const params = await context.params;
    const userId = parseInt(params.userId);
    const badgeId = parseInt(params.badgeId);

    await badgeService.removeBadgeFromUser(userId, badgeId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao remover badge do usuário:", error);
    return NextResponse.json({ error: error.message || "Erro ao remover badge do usuário" }, { status: 500 });
  }
}

