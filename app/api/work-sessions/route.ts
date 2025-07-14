import { WorkSessionController } from "@/backend/controllers/WorkSessionController"
import { prisma } from "@/lib/prisma";

const workSessionController = new WorkSessionController();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const managerId = url.searchParams.get("managerId");
    const active = url.searchParams.get("active");
    let sessions;
    if (active === "true") {
      sessions = await workSessionController.getActiveSessions();
    } else if (managerId) {
      // Find all projects managed by this user
      const projects = await prisma.projects.findMany({ where: { createdBy: Number(managerId) } });
      const projectIds = projects.map(p => p.id);
      // Find all users in these projects
      const members = await prisma.project_members.findMany({ where: { projectId: { in: projectIds } } });
      const userIds = members.map(m => m.userId);
      // Get all sessions for these users
      sessions = await prisma.work_sessions.findMany({ where: { userId: { in: userIds } } });
    } else if (userId) {
      sessions = await workSessionController.getSessionsByUser(Number(userId));
    } else {
      sessions = await workSessionController.getAllSessions();
    }
    return new Response(JSON.stringify({ data: sessions }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error('Erro ao buscar sessões de trabalho:', error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar sessões de trabalho', details: error?.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Look up the user's name
    const user = await prisma.users.findUnique({ where: { id: data.userId } });
    if (!user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), { status: 404 });
    }
    // Add userName to the data
    const session = await workSessionController.createSession({
      ...data,
      userName: user.name,
    });
    return new Response(JSON.stringify({ data: session }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error('Erro ao criar sessão de trabalho:', error);
    return new Response(JSON.stringify({ error: 'Erro ao criar sessão de trabalho', details: error?.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 