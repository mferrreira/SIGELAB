import { WorkSessionService } from "@/backend/services/WorkSessionService";

const workSessionService = new WorkSessionService();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const managerId = url.searchParams.get("managerId");
    const status = url.searchParams.get("status");
    const active = url.searchParams.get("active");
    
    let sessions;

    if (active === "true") {
      sessions = await workSessionService.getSessionsByStatus('active');
    } else if (userId) {
      sessions = await workSessionService.getUserSessions(Number(userId));
    } else if (status) {
      sessions = await workSessionService.getSessionsByStatus(status);
    } else {
      sessions = await workSessionService.getAllSessions();
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

    const session = await workSessionService.createSession(
      data.userId, 
      data.userName, 
      data.activity, 
      data.location, 
      data.projectId
    );
    
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
