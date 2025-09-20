import { NextResponse } from "next/server";
import { IssueController } from "@/backend/controllers/IssueController";

const issueController = new IssueController();

// POST: Atribuir issue a um usuário
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const issueId = parseInt(params.id);
    const body = await request.json();
    const { assigneeId } = body;

    if (!assigneeId) {
      return NextResponse.json({ error: "assigneeId é obrigatório" }, { status: 400 });
    }

    const issue = await issueController.assignIssue(issueId, assigneeId);
    return NextResponse.json({ issue });
  } catch (error: any) {
    console.error("Erro ao atribuir issue:", error);
    return NextResponse.json({ error: error.message || "Erro ao atribuir issue" }, { status: 500 });
  }
}
