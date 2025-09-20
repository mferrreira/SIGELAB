import { NextResponse } from "next/server";
import { IssueController } from "@/backend/controllers/IssueController";

const issueController = new IssueController();

// PATCH: Atualizar status do issue
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const issueId = parseInt(params.id);
    const body = await request.json();
    const { action } = body;

    let issue;
    switch (action) {
      case "start":
        issue = await issueController.startProgress(issueId);
        break;
      case "resolve":
        issue = await issueController.resolveIssue(issueId);
        break;
      case "closed":
        issue = await issueController.closeIssue(issueId);
        break;
      case "reopen":
        issue = await issueController.reopenIssue(issueId);
        break;
      case "unassign":
        issue = await issueController.unassignIssue(issueId);
        break;
      default:
        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    return NextResponse.json({ issue });
  } catch (error: any) {
    console.error("Erro ao atualizar status do issue:", error);
    return NextResponse.json({ error: error.message || "Erro ao atualizar status do issue" }, { status: 500 });
  }
}

