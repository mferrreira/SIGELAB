import { WorkSessionController } from "@/backend/controllers/WorkSessionController"
import { prisma } from "@/lib/database/prisma";

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

    const session = await workSessionController.createSession(data);
    
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