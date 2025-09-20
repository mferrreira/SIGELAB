import { NextResponse } from "next/server";
import { IssueController } from "@/backend/controllers/IssueController";

const issueController = new IssueController();

// GET: Obter um issue específico
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    const issue = await issueController.getIssue(id);
    if (!issue) {
      return NextResponse.json({ error: "Issue não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ issue });
  } catch (error) {
    console.error("Erro ao buscar issue:", error);
    return NextResponse.json({ error: "Erro ao buscar issue" }, { status: 500 });
  }
}

// PUT: Atualizar um issue
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    const body = await request.json();

    const issue = await issueController.updateIssue(id, body);
    return NextResponse.json({ issue });
  } catch (error: any) {
    console.error("Erro ao atualizar issue:", error);
    return NextResponse.json({ error: error.message || "Erro ao atualizar issue" }, { status: 500 });
  }
}

// DELETE: Excluir um issue
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    await issueController.deleteIssue(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao excluir issue:", error);
    return NextResponse.json({ error: error.message || "Erro ao excluir issue" }, { status: 500 });
  }
}
