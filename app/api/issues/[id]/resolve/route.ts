import { NextResponse } from "next/server";
import { IssueController } from "@/backend/controllers/IssueController";

const issueController = new IssueController();

// POST: Resolver um issue
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const issueId = parseInt(params.id);
    const body = await request.json();
    const { resolution } = body;

    const issue = await issueController.resolveIssue(issueId, resolution);
    return NextResponse.json({ issue });
  } catch (error: any) {
    console.error("Erro ao resolver issue:", error);
    return NextResponse.json({ error: error.message || "Erro ao resolver issue" }, { status: 500 });
  }
}

