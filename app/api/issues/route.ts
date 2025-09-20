import { NextResponse } from "next/server";
import { IssueController } from "@/backend/controllers/IssueController";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const issueController = new IssueController();

// GET: Obter todos os issues
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const reporterId = searchParams.get("reporterId");
    const assigneeId = searchParams.get("assigneeId");
    const search = searchParams.get("search");

    let issues;
    if (status || priority || category || reporterId || assigneeId || search) {
      issues = await issueController.searchIssues({
        status: status as any,
        priority: priority as any,
        category: category || undefined,
        reporterId: reporterId ? parseInt(reporterId) : undefined,
        assigneeId: assigneeId ? parseInt(assigneeId) : undefined,
        search: search || undefined,
      });
    } else {
      issues = await issueController.getAllIssues();
    }

    return NextResponse.json({ issues });
  } catch (error) {
    console.error("Erro ao buscar issues:", error);
    return NextResponse.json({ error: "Erro ao buscar issues" }, { status: 500 });
  }
}

// POST: Criar um novo issue
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    
    const issue = await issueController.createIssue(body);
    return NextResponse.json({ issue }, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar issue:", error);
    return NextResponse.json({ error: error.message || "Erro ao criar issue" }, { status: 500 });
  }
}
